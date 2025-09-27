'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '../lib/wagmi';
import { ReactNode, useMemo } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
