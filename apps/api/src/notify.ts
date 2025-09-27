const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId: bigint | number | string, text: string) {
  if (!BOT_TOKEN) {
    console.warn('Telegram bot token not set; skipping notification');
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId.toString(), text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
  } catch (e) {
    console.warn('Telegram sendMessage error', e);
  }
}

export const Notifications = {
  referral: (referrerTgId: bigint | string) =>
    sendTelegramMessage(referrerTgId, '🎉 New user joined with your link. Your referral points increased!'),
  milestone: (referrerTgId: bigint | string, title: string, amountEth?: string) =>
    sendTelegramMessage(referrerTgId, `🏆 Congrats! You reached <b>${title}</b> and received a milestone reward.`),
  dailyPoints: (userTgId: bigint | string, newBalance: number) =>
    sendTelegramMessage(userTgId, `☀️ Daily +10 AP added. New balance: 💎 ${newBalance} AP.`),
  subscription: (userTgId: bigint | string) =>
    sendTelegramMessage(userTgId, '🎉 Premium subscription activated. Enjoy Analyzer!'),
};

export default Notifications;
