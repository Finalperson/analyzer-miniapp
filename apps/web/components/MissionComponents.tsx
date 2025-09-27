'use client';

import { useState } from 'react';

interface Mission {
  id: string;
  type: 'wallet' | 'twitter' | 'discord' | 'subscription' | 'daily';
  icon: string;
  title: string;
  reward: string;
  completed: boolean;
  points: number;
}

interface MissionItemProps {
  mission: Mission;
  onComplete: (missionId: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export function InteractiveMissionItem({ mission, onComplete, isLoading = false }: MissionItemProps): JSX.Element {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleMissionComplete = async (data?: any) => {
    if (mission.completed || isProcessing || isLoading) return;
    
    setIsProcessing(true);
    try {
      await onComplete(mission.id, data);
      alert(`✅ ${mission.title} - +${mission.points} AP`);
      setShowUsernameModal(false);
      setUsername('');
    } catch (error: any) {
      console.error('Mission completion failed:', error);
      const errorMessage = error?.message || 'Failed to complete mission';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocialClick = (platform: 'twitter' | 'discord') => {
    const url = platform === 'twitter' 
      ? 'https://x.com/AnalyzerFinance' 
      : 'https://discord.com/invite/EshVc7Vm7p';
    
    window.open(url, '_blank');
    
    setTimeout(() => {
      setShowUsernameModal(true);
    }, 2000);
  };

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }
    
    handleMissionComplete({ username: username.trim() });
  };

  const handleWalletSubmit = () => {
    if (!walletAddress.trim() || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      alert('Please enter a valid EVM wallet address');
      return;
    }
    
    handleMissionComplete({ walletAddress: walletAddress.trim() });
  };

  return (
    <div className="glass card-interactive rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{mission.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white">{mission.title}</h3>
            <p className="text-white/70 text-sm">{mission.reward}</p>
          </div>
        </div>
        
        {mission.completed ? (
          <div className="flex items-center space-x-2 text-emerald-400">
            <span>✓</span>
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {mission.type === 'twitter' && (
              <button
                onClick={() => handleSocialClick('twitter')}
                disabled={isProcessing}
                className="btn-glow gradient-primary rounded-xl px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Visit Twitter
              </button>
            )}
            
            {mission.type === 'discord' && (
              <button
                onClick={() => handleSocialClick('discord')}
                disabled={isProcessing}
                className="btn-glow gradient-secondary rounded-xl px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Visit Discord
              </button>
            )}
            
            {mission.type === 'wallet' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value.trim())}
                  placeholder="0x742d35Cc6C8b6A4C8b19C23c10F...."
                  className="w-full glass rounded-lg px-3 py-3 text-sm text-white placeholder-white/40 border border-white/20 focus:border-white/40 focus:outline-none font-mono"
                />
                <button
                  onClick={handleWalletSubmit}
                  disabled={isProcessing || !walletAddress.trim()}
                  className="btn-glow gradient-primary rounded-xl px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isProcessing ? 'Submitting...' : 'Submit Wallet'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white text-center">
              {mission.type === 'twitter' ? 'Enter Twitter Username' : 'Enter Discord Username'}
            </h3>
            <p className="text-white/70 text-sm text-center">
              {mission.type === 'twitter' 
                ? 'Please enter your Twitter/X username (without @)'
                : 'Please enter your Discord username'
              }
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mission.type === 'twitter' ? 'your_username' : 'YourDiscord#1234'}
              className="w-full glass rounded-lg px-4 py-3 text-white placeholder-white/40 border border-white/20 focus:border-white/40 focus:outline-none"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUsernameModal(false);
                  setUsername('');
                }}
                className="flex-1 glass rounded-xl px-4 py-3 text-sm font-medium text-white/70 border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleUsernameSubmit}
                disabled={isProcessing || !username.trim()}
                className="flex-1 btn-glow gradient-primary rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Claim Reward'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MissionItem({ icon, title, reward, completed = false }: any) {
  return (
    <div className="glass card-interactive rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-white/70 text-sm">{reward}</p>
          </div>
        </div>
        
        {completed && (
          <div className="flex items-center space-x-2 text-emerald-400">
            <span>✓</span>
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function WalletConnectionStatus() {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <p className="text-white/70">Wallet connection not implemented in this simplified version</p>
    </div>
  );
}