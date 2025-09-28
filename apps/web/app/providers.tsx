'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Completely disable Wagmi on server-side
const WagmiWrapper = dynamic(
  async () => {
    const { WagmiProvider } = await import('wagmi');
    const { config } = await import('../lib/wagmi');
    
    return function WagmiWrapperComponent({ children }: { children: ReactNode }) {
      return <WagmiProvider config={config}>{children}</WagmiProvider>;
    };
  },
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: false,
      },
    },
  }), []);
  
  if (!mounted) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    );
  }
  
  return (
    <WagmiWrapper>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </WagmiWrapper>
  );
}
