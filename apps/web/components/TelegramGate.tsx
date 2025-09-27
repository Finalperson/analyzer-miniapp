'use client';

import { useEffect, useState } from 'react';

export default function TelegramGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setOk(true);
    } else {
      // allow in browser for local dev
      setOk(true);
    }
  }, []);
  return ok ? <>{children}</> : null;
}
