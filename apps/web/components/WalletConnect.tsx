'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

interface WalletConnectProps {
  onConnected?: (address: string) => void;
  className?: string;
}

export default function WalletConnect({ onConnected, className = '' }: WalletConnectProps) {
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  useEffect(() => {
    if (isConnected && address && onConnected) {
      onConnected(address);
    }
  }, [isConnected, address, onConnected]);

  if (isConnected && address) {
    return (
      <div className={`glass card-elevated rounded-xl p-4 space-y-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="text-3xl">✅</div>
          <div>
            <h3 className="font-semibold text-white">Wallet Connected</h3>
            <p className="text-sm text-white/70 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="w-full btn-glow glass rounded-xl py-3 text-sm font-medium text-white/80 hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`glass card-elevated rounded-xl p-4 space-y-3 ${className}`}>
      <div className="text-center space-y-3">
        <div className="text-4xl">🔗</div>
        <div>
          <h3 className="font-semibold text-white">Connect Your Wallet</h3>
          <p className="text-sm text-white/70">
            Connect your EVM wallet to earn +100 AP
          </p>
        </div>

        {!showConnectors ? (
          <button
            onClick={() => setShowConnectors(true)}
            disabled={isPending}
            className="w-full btn-glow gradient-primary rounded-xl py-4 font-bold text-white touch-target"
          >
            {isPending ? 'Connecting...' : '🔗 Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                disabled={isPending}
                className="w-full glass-hover rounded-xl py-3 px-4 text-sm font-medium text-white flex items-center space-x-3 transition-all"
              >
                <span className="text-lg">
                  {connector.name === 'MetaMask' ? '🦊' : 
                   connector.name === 'WalletConnect' ? '🔗' : '💼'}
                </span>
                <span>{connector.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowConnectors(false)}
              className="w-full text-sm text-white/50 py-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}