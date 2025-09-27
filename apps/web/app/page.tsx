"use client";
import TelegramGate from '../components/TelegramGate';
import { useEffect, useState } from 'react';
import { authWithTelegram, apiGet, apiPost } from '../lib/api';
import { InteractiveMissionItem, WalletConnectionStatus } from '../components/MissionComponents';

type Tab = 'dashboard' | 'missions' | 'referrals' | 'links';

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [referral, setReferral] = useState<{ totalReferrals: number; referralLink: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);

  // Mission completion handler
  const handleMissionComplete = async (missionId: string, data?: any) => {
    if (!token) return;
    
    try {
      let endpoint = '';
      let payload: any = {};
      
      switch (missionId) {
        case 'connect_wallet':
          endpoint = '/missions/wallet';
          payload = { walletAddress: data?.walletAddress };
          break;
        case 'follow_twitter':
          endpoint = '/missions/twitter';
          payload = { username: data?.username };
          break;
        case 'join_discord':
          endpoint = '/missions/discord';
          payload = { username: data?.username };
          break;
        default:
          throw new Error('Unknown mission type');
      }
      
      const result = await apiPost(endpoint, payload, token);
      
      // Update user data and missions
      const updatedMe = await apiGet<any>('/me', token);
      setMe(updatedMe.user);
      
      // Update mission completion status
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, completed: true }
          : mission
      ));
      
      console.log('Mission completed:', result);
    } catch (error) {
      console.error('Mission completion failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Initialize missions data immediately (don't wait for API)
    const missionsList = [
      {
        id: 'connect_wallet',
        type: 'wallet' as const,
        icon: '🔗',
        title: 'Submit EVM Address',
        reward: '+100 AP',
        completed: false, // Will be updated after API call
        points: 100
      },
      {
        id: 'follow_twitter',
        type: 'twitter' as const,
        icon: '🐦',
        title: 'Follow on X',
        reward: '+50 AP',
        completed: false, // Will be updated after API call
        points: 50
      },
      {
        id: 'join_discord',
        type: 'discord' as const,
        icon: '💬',
        title: 'Join Discord',
        reward: '+50 AP',
        completed: false, // Will be updated after API call
        points: 50
      }
    ];
    setMissions(missionsList);

    (async () => {
      try {
  const { token } = await authWithTelegram();
  setToken(token);
  // expose for child components (simple signal only)
  ;(window as any).__ANALYZER_AUTH__ = token;
        const me = await apiGet<any>('/me', token);
        setMe(me.user);
  const rd = await apiGet<any>('/referral', token);
  setReferral(rd);
        
        // Update missions completion status based on user data
        setMissions(prevMissions => prevMissions.map(mission => {
          switch (mission.id) {
            case 'connect_wallet':
              return { ...mission, completed: !!me.user.walletAddress };
            case 'follow_twitter':
              return { ...mission, completed: !!me.user.twitterUsername };
            case 'join_discord':
              return { ...mission, completed: !!me.user.discordUsername };
            default:
              return mission;
          }
        }));
      } catch (e: any) {
        console.error('App initialization error:', e);
        setError(e?.message || 'Failed to initialize app.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const StatCard = ({ icon, label, value, gradient = "gradient-primary", action }: any) => (
    <div className={`glass card-interactive rounded-2xl p-6 ${gradient} relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{icon}</span>
          {action && (
            <button className="btn-glow glass rounded-xl px-4 py-2 text-sm font-medium transition-all">
              {action}
            </button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  const TabButton = ({ id, icon, label, active }: any) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 glass-hover rounded-2xl p-4 transition-all duration-300 relative overflow-hidden ${
        active ? 'gradient-primary pulse-glow' : 'glass'
      }`}
    >
      <div className="relative z-10 text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xs font-medium text-white/90">{label}</div>
      </div>
      {active && (
        <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
      )}
    </button>
  );

  const MissionItem = ({ icon, title, reward, completed = false }: any) => (
    <div className={`glass card-interactive rounded-xl p-4 flex items-center space-x-4 ${completed ? 'gradient-success' : ''}`}>
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70">{reward}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        completed ? 'bg-white text-green-500' : 'border-white/30'
      }`}>
        {completed && <span className="text-sm">✓</span>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <TelegramGate>
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gradient-secondary">👥 Referrals</h2>
              <p className="text-white/70">Invite friends, earn milestone rewards</p>
            </div>
        </main>
      </TelegramGate>
    );
  }

  // NOTE: Do not block the UI if there's an auth error; we'll show a banner instead below

  return (
    <TelegramGate>
      {error && (
        <div className="fixed top-0 inset-x-0 z-50 p-3">
          <div className="mx-auto max-w-3xl glass rounded-xl border border-amber-400/30 bg-amber-500/10 backdrop-blur px-4 py-3 shadow-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Authentication error</p>
                <p className="text-xs text-white/80 break-words">{error}</p>
              </div>
              <button onClick={()=>location.reload()} className="text-xs text-white/80 hover:text-white">Reload</button>
            </div>
          </div>
        </div>
      )}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <main className="container-custom min-h-screen py-8 pb-12 space-y-6 px-4 pt-safe-top pb-safe-bottom">
        {/* Header */}
        <div className="slide-up text-center space-y-2 pt-4">
          <h1 className="text-4xl font-black text-gradient">
            Analyzer Hub
          </h1>
          <p className="text-white/70 text-sm">
            Welcome back, {me?.firstName || me?.username || 'Explorer'}
          </p>
        </div>

        {/* Navigation */}
        <div className="slide-up flex space-x-2">
          <TabButton id="dashboard" icon="🏠" label="Dashboard" active={tab === 'dashboard'} />
          <TabButton id="missions" icon="🎯" label="Missions" active={tab === 'missions'} />
            <TabButton id="referrals" icon="👥" label="Referrals" active={tab === 'referrals'} />
          <TabButton id="links" icon="🔗" label="Links" active={tab === 'links'} />
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <section className="slide-up space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon="💎"
                label="Analyzer Points"
                value={`${me?.apBalance ?? 0} AP`}
                gradient="gradient-primary"
              />
              <StatCard
                icon="⚡"
                label="Status"
                value={me?.isPremium ? "Premium" : "Free"}
                gradient={me?.isPremium ? "gradient-success" : "gradient-secondary"}
                action={!me?.isPremium ? "Upgrade" : null}
              />
            </div>

            {/* Referral quick glance */}
            <StatCard
              icon="�"
              label="Total Referrals"
              value={`${referral?.totalReferrals ?? 0}`}
              gradient="gradient-secondary"
            />

            {/* Daily Claim */}
            <div className="glass card-elevated rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">🎁</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Reward</h3>
                  <p className="text-white/70">Claim your daily points</p>
                </div>
              </div>
              
              {me?.isPremium ? (
                <div className="glass rounded-xl p-4 gradient-success">
                  <p className="text-center text-white font-medium">
                    ✨ Premium users get +10 AP automatically!
                  </p>
                </div>
              ) : (
                <button
                  disabled={!token}
                  onClick={async () => {
                    if (!token) return;
                    try {
                      const r = await apiPost<any>('/points/claim-daily', {}, token);
                      setMe((prev: any) => ({ ...prev, apBalance: (prev?.apBalance ?? 0) + (r.added ?? 0) }));
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full btn-glow gradient-primary rounded-xl py-4 font-bold text-white touch-target"
                >
                  🎁 Claim +10 AP
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_SIGNAL_CENTER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glass card-interactive rounded-xl p-4 text-center space-y-2"
                >
                  <div className="text-3xl">📊</div>
                  <p className="text-sm font-medium text-white">Signal Center</p>
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_SITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glass card-interactive rounded-xl p-4 text-center space-y-2"
                >
                  <div className="text-3xl">🌐</div>
                  <p className="text-sm font-medium text-white">Main Site</p>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Missions Tab */}
        {tab === 'missions' && (
          <section className="slide-up space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gradient">🎯 Missions</h2>
              <p className="text-white/70">Complete tasks to earn AP</p>
            </div>

            {/* Wallet Connection Status */}
            <WalletConnectionStatus />

            <div className="space-y-3">
              {/* Static missions */}
              <MissionItem
                icon="🎉"
                title="Telegram Loyalty Bonus"
                reward="Account age bonus applied"
                completed={true}
              />
              
              {/* Interactive missions */}
              {missions.map((mission) => (
                <InteractiveMissionItem
                  key={mission.id}
                  mission={mission}
                  onComplete={handleMissionComplete}
                />
              ))}
              
              {/* Static missions */}
              <MissionItem
                icon="💎"
                title="Active Subscription Verification"
                reward="+200 AP (Admin Verified)"
              />
              <MissionItem
                icon="📅"
                title="Daily Check-in"
                reward="+10 AP daily"
              />
            </div>
          </section>
        )}

        {/* Referrals Tab */}
        {tab === 'referrals' && (
          <section className="slide-up space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gradient-secondary">� Referrals</h2>
              <p className="text-white/70">Invite friends, earn milestone rewards</p>
            </div>

            <div className="glass card-elevated rounded-2xl p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-5xl">🔗</div>
                <h3 className="text-xl font-bold text-white">Your Referral Link</h3>
                <div className="glass rounded-xl p-4 font-mono text-sm text-white/90 break-all">
              {referral?.referralLink || (me?.telegramId ? `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=${me?.telegramId}` : '')}
                </div>
                <button
                  onClick={() => {
                    const link = referral?.referralLink || (me?.telegramId ? `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=${me?.telegramId}` : '');
                    if (link) navigator.clipboard.writeText(link);
                  }}
                  className="btn-glow gradient-secondary rounded-xl px-6 py-3 font-medium text-white"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon="👥"
                label="Total Referrals"
                value={`${referral?.totalReferrals ?? 0}`}
                gradient="gradient-primary"
              />
            </div>

            <div className="glass card-elevated rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">🏆 Milestones</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">3 Referrals</span>
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">+100 AP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">10 Referrals</span>
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full">+500 AP</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Links Tab */}
        {tab === 'links' && (
          <section className="slide-up space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gradient">🔗 Links</h2>
              <p className="text-white/70">Connect with our community</p>
            </div>

            <div className="space-y-3">
              <a
                href={process.env.NEXT_PUBLIC_LINKS_URL}
                target="_blank"
                rel="noreferrer"
                className="glass card-interactive rounded-2xl p-6 flex items-center space-x-4"
              >
                <div className="text-4xl">🌐</div>
                <div>
                  <h3 className="text-lg font-bold text-white">All Links</h3>
                  <p className="text-white/70">Complete link collection</p>
                </div>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_TWITTER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glass card-interactive rounded-xl p-4 text-center space-y-2"
                >
                  <div className="text-3xl">🐦</div>
                  <p className="text-sm font-medium text-white">Twitter</p>
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glass card-interactive rounded-xl p-4 text-center space-y-2"
                >
                  <div className="text-3xl">💬</div>
                  <p className="text-sm font-medium text-white">Discord</p>
                </a>
              </div>

              <a
                href={process.env.NEXT_PUBLIC_LINEA_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="glass card-interactive rounded-2xl p-6 flex items-center space-x-4 gradient-primary"
              >
                <div className="text-4xl">⚡</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Linea Ecosystem</h3>
                  <p className="text-white/90">Official app page</p>
                </div>
              </a>
            </div>
          </section>
        )}
      </main>
    </TelegramGate>
  );
}
