export type APBalance = {
  total: number;
};

export type MeResponse = {
  user: {
    id: string;
    telegramId: bigint;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isPremium: boolean;
    apBalance: number;
  };
};

export type AuthTelegramResponse = {
  token: string;
  user: MeResponse['user'];
};
