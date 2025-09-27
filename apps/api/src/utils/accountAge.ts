// Simple estimation via ID thresholds (example values; replace with curated table)
export function estimateTelegramCreationDate(telegramId: bigint): Date {
  // Placeholder: map ranges to rough dates; in production, use curated data
  const id = Number(telegramId);
  const y2020 = 5_000_000_000; // fake threshold example
  if (id < y2020) return new Date('2019-06-01');
  const y2022 = 7_000_000_000;
  if (id < y2022) return new Date('2021-06-01');
  const y2024 = 9_000_000_000;
  if (id < y2024) return new Date('2023-06-01');
  return new Date('2024-12-01');
}

export function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
