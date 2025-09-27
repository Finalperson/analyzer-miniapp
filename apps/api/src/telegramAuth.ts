import crypto from 'crypto';

type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type InitData = {
  user: TelegramUser;
  auth_date: string;
  hash: string;
  start_param?: string;
  [k: string]: any;
};

function parseInitData(initData: string): InitData | null {
  const params = new URLSearchParams(initData);
  const obj: any = {};
  for (const [key, value] of params.entries()) {
    if (key === 'user') obj.user = JSON.parse(value);
    else obj[key] = value;
  }
  if (!obj.user || !obj.auth_date || !obj.hash) return null;
  return obj as InitData;
}

export function verifyTelegramInitData(initData: string, botToken: string): InitData | null {
  const data = parseInitData(initData);
  if (!data) return null;
  const encoder = new TextEncoder();
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const checkString = Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${k === 'user' ? JSON.stringify((data as any).user) : (data as any)[k]}`)
    .join('\n');
  const computed = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  if (computed !== data.hash) return null;
  // Optional: check auth_date age (e.g., <= 24h)
  return data;
}
