// Twitter API utilities for follow verification
import { z } from 'zod';

// Simple in-memory cache with TTL to reduce Twitter API calls
type CacheEntry<T> = { value: T; expiresAt: number };
const userCache = new Map<string, CacheEntry<TwitterUser>>(); // key: username (lowercase)
const followCache = new Map<string, CacheEntry<boolean>>();   // key: `${userId}->${ANALYZER_TWITTER_ID}`
const now = () => Date.now();
const setCache = <T>(m: Map<string, CacheEntry<T>>, k: string, v: T, ttlMs: number) => m.set(k, { value: v, expiresAt: now() + ttlMs });
const getCache = <T>(m: Map<string, CacheEntry<T>>, k: string): T | undefined => {
  const e = m.get(k);
  if (!e) return undefined;
  if (e.expiresAt < now()) { m.delete(k); return undefined; }
  return e.value;
};

// --- Lightweight global queue + throttle for Twitter API calls ---
// This helps avoid hitting Twitter 429 rate limits by spacing requests.
const MIN_INTERVAL_MS = Number(process.env.TWITTER_MIN_INTERVAL_MS || 900); // ~1 req/sec by default
let nextAvailableAt = 0;
type QueueTask<T> = () => Promise<T>;
const q: Array<() => void> = [];
let active = false;

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

function runNext() {
  if (active) return;
  const job = q.shift();
  if (!job) return;
  active = true;
  job();
}

async function enqueue<T>(task: QueueTask<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    q.push(async () => {
      try {
        const wait = Math.max(0, nextAvailableAt - now());
        if (wait > 0) await sleep(wait);
        // Reserve next slot
        nextAvailableAt = now() + MIN_INTERVAL_MS;
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        active = false;
        // Allow a tiny gap to avoid tight loops
        setTimeout(runNext, 0);
      }
    });
    runNext();
  });
}

class TwitterRateLimitError extends Error {
  code = 429;
  retryAfterMs: number;
  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.retryAfterMs = retryAfterMs;
  }
}

async function fetchTwitter(url: string, init?: RequestInit, opts: { retries?: number } = {}) {
  if (!TwitterConfig.success) {
    const err: any = new Error('Twitter API not configured');
    err.code = 500;
    throw err;
  }

  const maxRetries = typeof opts.retries === 'number' ? opts.retries : 2;

  const attempt = async (n: number): Promise<Response> => {
    return enqueue(async () => {
      const res = await fetch(url, {
        ...init,
        headers: {
          'Authorization': `Bearer ${TwitterConfig.data.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          ...(init?.headers as any || {}),
        },
      });

      if (res.status === 429) {
        // Determine suggested wait time
        const retryAfterHeader = res.headers.get('retry-after');
        const resetHeader = res.headers.get('x-rate-limit-reset');
        let retryAfterMs = 0;
        if (retryAfterHeader && !Number.isNaN(Number(retryAfterHeader))) {
          retryAfterMs = Number(retryAfterHeader) * 1000;
        }
        if (resetHeader && !Number.isNaN(Number(resetHeader))) {
          const resetMs = Number(resetHeader) * 1000 - now();
          if (resetMs > retryAfterMs) retryAfterMs = resetMs;
        }
        if (retryAfterMs <= 0) retryAfterMs = 15_000; // sensible default

        // Small automatic retries when the wait is short
        if (n < maxRetries && retryAfterMs <= 5000) {
          await sleep(retryAfterMs);
          return attempt(n + 1);
        }
        throw new TwitterRateLimitError('Twitter API rate limit', retryAfterMs);
      }

      if (!res.ok) {
        const err: any = new Error(`Twitter API error: ${res.status}`);
        err.code = res.status;
        try { err.body = await res.text(); } catch {}
        throw err;
      }
      return res;
    });
  };

  return attempt(0);
}

// Types
interface TwitterUser {
  id: string;
  username: string;
  name: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
  };
}

interface TwitterFollowResponse {
  data?: TwitterUser[];
  meta?: {
    result_count: number;
  };
}

// Environment variables validation
const TwitterConfig = z.object({
  TWITTER_BEARER_TOKEN: z.string().min(1, "Twitter Bearer Token is required")
}).safeParse({
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN
});

if (!TwitterConfig.success) {
  console.warn("⚠️ Twitter Bearer Token not configured. Twitter follow verification will be disabled.");
}

const AnalyzerAccount = z.object({
  ANALYZER_TWITTER_ID: z.string().optional(),
  ANALYZER_TWITTER_USERNAME: z.string().optional()
}).parse({
  ANALYZER_TWITTER_ID: process.env.ANALYZER_TWITTER_ID,
  ANALYZER_TWITTER_USERNAME: process.env.ANALYZER_TWITTER_USERNAME
});

const ANALYZER_TWITTER_ID = AnalyzerAccount.ANALYZER_TWITTER_ID || "1234567890"; // fallback demo ID
const ANALYZER_USERNAME = AnalyzerAccount.ANALYZER_TWITTER_USERNAME || "AnalyzerFinance";

/**
 * Get Twitter user by username
 */
export async function getTwitterUser(username: string): Promise<TwitterUser | null> {
  if (!TwitterConfig.success) {
    throw new Error("Twitter API not configured");
  }

  try {
    const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
    // cache lookup (10 minutes)
    const cached = getCache<TwitterUser>(userCache, cleanUsername);
    if (cached) return cached;
    const response = await fetchTwitter(
      `https://api.twitter.com/2/users/by/username/${cleanUsername}?user.fields=public_metrics`
    );

    if (response.status === 404) {
      return null; // User not found
    }

    const data = await response.json();
    if (data?.data) setCache(userCache, cleanUsername, data.data, 10 * 60 * 1000);
    return data.data || null;
  } catch (error) {
    console.error('Error fetching Twitter user:', error);
    throw error;
  }
}

/**
 * Check if a user follows Analyzer Finance
 */
export async function checkTwitterFollow(username: string): Promise<boolean> {
  if (!TwitterConfig.success) {
    console.warn("Twitter API not configured, returning false");
    return false;
  }

  try {
    const displayName = username.trim().replace(/^@+/, '');
    console.log(`🔍 Checking if @${displayName} follows @${ANALYZER_USERNAME}...`);
    const user = await getTwitterUser(displayName);
    if (!user) {
      console.log(`❌ Twitter user @${displayName} not found`);
      return false;
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);
    // Cache check (5 minutes)
    const followKey = `${user.id}->${ANALYZER_TWITTER_ID}`;
    const cachedFollow = getCache<boolean>(followCache, followKey);
    if (cachedFollow !== undefined) {
      console.log(`🗄️ Follow cache hit: ${cachedFollow}`);
      return cachedFollow;
    }

    // Fetch following list with pagination (cap pages to avoid abuse)
    let paginationToken: string | undefined = undefined;
    let page = 0;
    const MAX_PAGES = 5; // up to ~5000 accounts if 1000/page
    let found = false;
    while (page < MAX_PAGES && !found) {
      const url = new URL(`https://api.twitter.com/2/users/${user.id}/following`);
      url.searchParams.set('user.fields', 'username');
      url.searchParams.set('max_results', '1000');
      if (paginationToken) url.searchParams.set('pagination_token', paginationToken);
      console.log(`🔍 Checking following page ${page + 1} for user ${user.id}...`);

      const res = await fetchTwitter(url.toString(), undefined, { retries: 2 });
      const data: TwitterFollowResponse & { meta?: any } = await res.json();
      const list = data.data || [];
      found = list.some((f) => f.id === ANALYZER_TWITTER_ID || f.username?.toLowerCase() === ANALYZER_USERNAME.toLowerCase());
      if (found) break;
      paginationToken = (data as any)?.meta?.next_token;
      if (!paginationToken) break;
      page++;
    }

    setCache(followCache, followKey, found, 5 * 60 * 1000);
    console.log(`${found ? '✅' : '❌'} User @${displayName} ${found ? 'follows' : 'does not follow'} @${ANALYZER_USERNAME}`);
    return found;
    
  } catch (error) {
    console.error('❌ Error checking Twitter follow:', error);
    // If rate limited, bubble up so the API can respond appropriately
    const code = (error as any)?.code;
    if (code === 429) throw error;
    // For other errors, be conservative
    return false;
  }
}

/**
 * Simplified verification for development
 * Just checks if username format is valid
 */
export function validateTwitterUsername(username: string): { valid: boolean; error?: string } {
  const cleanUsername = username.replace('@', '');
  
  if (cleanUsername.length < 1 || cleanUsername.length > 15) {
    return { valid: false, error: "Username must be 1-15 characters" };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  }
  
  return { valid: true };
}