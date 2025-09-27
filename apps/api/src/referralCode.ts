/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Validate referral code format
 */
export function validateReferralCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code);
}

/**
 * Generate referral link for user
 */
export function generateReferralLink(telegramId: string, botName: string): string {
  return `https://t.me/${botName}?start=${telegramId}`;
}