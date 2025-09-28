'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: false,
      },
    },
  }), []);
  
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
