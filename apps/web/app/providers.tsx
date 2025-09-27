'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '../lib/wagmi';
import { ReactNode, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Prevent SSR for wallet components
const WagmiProviderSSR = dynamic(
  () => Promise.resolve(WagmiProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }), []);
  
  return (
    <WagmiProviderSSR config={config}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </WagmiProviderSSR>
  );
}
