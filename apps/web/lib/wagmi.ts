import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains'
import { injected, walletConnect, metaMask } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Analyzer Hub',
        description: 'Connect your wallet to Analyzer Hub',
        url: 'https://analyzer.finance',
        icons: ['https://analyzer.finance/icon.png']
      }
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}