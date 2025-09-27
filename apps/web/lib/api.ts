'use client';

const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8071';

export async function authWithTelegram(): Promise<{ token: string }> {
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData || '';
  
  // If not inside Telegram, use Web auth for full browser support
  if (!initData) {
    const clientId = localStorage.getItem('analyzer_client_id') || cryptoRandom();
    localStorage.setItem('analyzer_client_id', clientId);
    const username = localStorage.getItem('analyzer_username') || '';
  const startParam = new URLSearchParams(window.location.search).get('start');
  // Only treat start as referralCode if it's non-numeric (telegramId links are numeric)
  const referralCode = startParam && !/^\d+$/.test(startParam) ? startParam : undefined;
    const res = await fetch(`${API}/auth/web`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, username, referralCode })
    });
    if (!res.ok) {
      let detail = '';
      try { const j = await res.json(); detail = j?.error || ''; } catch {}
      throw new Error(`Web auth failed (${res.status})${detail ? `: ${detail}` : ''}`);
    }
    return res.json();
  }
  
  const res = await fetch(`${API}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  });
  if (!res.ok) throw new Error('Auth failed');
  return res.json();
}

function cryptoRandom() {
  try {
    const arr = new Uint8Array(16);
    (window.crypto || (window as any).msCrypto).getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!r.ok) {
    let message = `Request failed (${r.status})`;
    try {
      const contentType = r.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await r.json();
        message = data?.error || message;
      } else {
        const text = await r.text();
        message = text || message;
      }
    } catch {}
    throw new Error(message);
  }
  return r.json();
}

export async function apiPost<T>(path: string, body: any, token: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
  });
  if (!r.ok) {
    let message = `Request failed (${r.status})`;
    let retryAfterSeconds: number | undefined;
    try {
      const contentType = r.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await r.json();
        message = data?.error || message;
        if (typeof data?.retryAfterSeconds === 'number') {
          retryAfterSeconds = data.retryAfterSeconds;
        }
      } else {
        const text = await r.text();
        message = text || message;
      }
    } catch {}
    const err: any = new Error(message);
    if (!retryAfterSeconds) {
      const h = r.headers.get('retry-after');
      if (h && !Number.isNaN(Number(h))) retryAfterSeconds = Number(h);
    }
    if (retryAfterSeconds) (err as any).retryAfterSeconds = retryAfterSeconds;
    throw err;
  }
  return r.json();
}
