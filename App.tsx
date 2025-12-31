
import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ContentGenerator } from './components/ContentGenerator';
import { CalendarView } from './components/CalendarView';
import { AuditTool } from './components/AuditTool';
import { ViralAgent } from './components/ViralAgent';
import { Sidebar } from './components/Sidebar';
import { ConsultantRoom } from './components/ConsultantRoom';
import { EngagementHub } from './components/EngagementHub';
import { SocialAccounts } from './components/SocialAccounts';
import { DiagnosticCenter } from './components/DiagnosticCenter';
import { ReputationMonitor } from './components/ReputationMonitor';
import { CampaignManager } from './components/CampaignManager';
import { CampaignWarRoom } from './components/CampaignWarRoom';
import { TeamHQ } from './components/TeamHQ';
import { AuthPortal } from './components/AuthPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { InfluencerPulse } from './components/InfluencerPulse';
import { KnowledgeVault } from './components/KnowledgeVault';
import { SubscriptionNode } from './components/SubscriptionNode';
import { SocialProfile, User, ViewType } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { LucideMenu, LucideX, LucideLoader2, LucideCloudSync, LucideWifi, LucideBuilding2, LucideShieldCheck, LucideCrown, LucideShieldAlert, LucideInfo } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [viewParams, setViewParams] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');

  const syncState = async () => {
    setCloudStatus('syncing');
    const sessionUser = await authService.verifySession();
    if (sessionUser) {
      setUser(sessionUser);
      // Real pull from Firebase
      await dataService.syncWithCloud();
      const fetchedProfile = await dataService.getProfile();
      setProfile(fetchedProfile);
      setCloudStatus('connected');
    } else {
      setCloudStatus('offline');
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setIsSyncing(true);
      try {
        await syncState();
      } catch (e) { 
        console.error("Critical Boot Error:", e);
        setCloudStatus('offline');
      } finally { 
        setIsSyncing(false); 
      }
    };
    initApp();

    dataService.onRemoteUpdate((type) => {
      console.log(`[SYNC-CHANNEL] ${type} Received. Updating local node...`);
      syncState();
    });

  }, []);

  const handleAuthSuccess = async (newUser: User) => {
    setUser(newUser);
    setCloudStatus('syncing');
    await dataService.syncWithCloud();
    const p = await dataService.getProfile();
    setProfile(p);
    setCloudStatus('connected');
    dataService.logActivity(newUser.displayName, "Provisioned Secure Cloud Context");
  };

  const handleCompleteOnboarding = async (newProfile: SocialProfile) => {
    setIsSyncing(true);
    try {
      const saved = await dataService.saveProfile(newProfile);
      setProfile(saved);
      setCurrentView('dashboard');
    } catch (e) { alert("Setup failed."); } finally { setIsSyncing(false); }
  };

  const updateGlobalUser = async (updatedUser: User) => {
    setIsSyncing(true);
    try {
      const saved = await dataService.updateUser(updatedUser);
      setUser(saved);
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleLogout = async () => {
    if (!user) return;
    setIsLoggingOut(true);
    try {
      await authService.logout(user);
    } finally {
      setIsLoggingOut(false);
      setUser(null);
    }
  };

  const handleOpenWarRoom = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCurrentView('campaign_detail');
  };

  const navigateToView = (view: ViewType, params: any = null) => {
    setCurrentView(view);
    setViewParams(params);
    setIsMobileMenuOpen(false);
  };

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
        <LucideLoader2 className="text-brand-gold animate-spin" size={64} />
        <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Revoking Identity Nodes...</p>
      </div>
    );
  }

  if (isSyncing && !user) {
    return (
      <div className="min-h-screen bg-brand-500 flex flex-col items-center justify-center space-y-8 p-6">
        <div className="relative">
          <LucideLoader2 className="text-brand-gold animate-spin" size={80} />
          <LucideShieldCheck className="absolute inset-0 m-auto text-white opacity-50" size={32} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-black uppercase tracking-[0.5em] text-sm">Provisioning HQ Node</p>
          <p className="text-white/40 font-bold text-xs italic">Syncing with Secure Identity Bridge...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  if (!profile && user.role !== 'Superuser') {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard profile={profile} user={user} onNavigate={navigateToView} />;
      case 'generate': return <ContentGenerator profile={profile!} user={user} onUserUpdate={updateGlobalUser} initialTopic={viewParams?.topic} />;
      case 'audit': return <AuditTool />;
      case 'viral': return <ViralAgent profile={profile!} />;
      case 'calendar': return <CalendarView profile={profile!} />;
      case 'consultant': return <ConsultantRoom profile={profile!} />;
      case 'engagement': return <EngagementHub profile={profile!} user={user} setUser={updateGlobalUser} />;
      case 'accounts': return <SocialAccounts user={user} setUser={updateGlobalUser} />;
      case 'diagnostics': return <DiagnosticCenter profile={profile!} />;
      case 'reputation': return <ReputationMonitor profile={profile!} />;
      case 'campaigns': return <CampaignManager profile={profile!} onOpenWarRoom={handleOpenWarRoom} />;
      case 'campaign_detail': return <CampaignWarRoom profile={profile!} campaignId={selectedCampaignId!} onBack={() => navigateToView('campaigns')} />;
      case 'team': return <TeamHQ user={user} onUserUpdate={updateGlobalUser} />;
      case 'admin_panel': return <AdminDashboard />;
      case 'influencers': return <InfluencerPulse profile={profile!} />;
      case 'knowledge': return <KnowledgeVault profile={profile!} />;
      case 'billing': return <SubscriptionNode user={user} setUser={updateGlobalUser} onBack={() => navigateToView('dashboard')} />;
      default: return <Dashboard profile={profile} user={user} onNavigate={navigateToView} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-slate overflow-hidden relative font-sans">
      <div className={`fixed top-6 right-6 z-[60] px-8 py-3 rounded-full flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all border-2 ${
        cloudStatus === 'syncing' ? 'bg-slate-900 text-white border-white/10' : 
        cloudStatus === 'connected' ? 'bg-white text-brand-500 border-slate-100' :
        'bg-red-50 text-red-600 border-red-100'
      }`}>
         {cloudStatus === 'syncing' ? (
           <><LucideCloudSync size={18} className="animate-spin text-brand-gold" /> CLOUD SYNC ACTIVE</>
         ) : cloudStatus === 'connected' ? (
           <><LucideWifi size={18} className="text-brand-gold" /> ENCRYPTED CONNECTION</>
         ) : (
           <><LucideShieldAlert size={18} /> LOCAL-ONLY MODE</>
         )}
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-24 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-8">
        <div className="font-black text-2xl text-brand-500">SB <span className="text-brand-gold">PRO</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-4 text-slate-900">{isMobileMenuOpen ? <LucideX size={32} /> : <LucideMenu size={32} />}</button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-brand-500 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <Sidebar 
          currentView={currentView} 
          onChangeView={(view) => navigateToView(view as ViewType)} 
          profileName={profile?.name || user?.displayName || 'Brand'} 
          user={user!}
          onLogout={handleLogout}
        />
      </div>

      <main className="flex-1 overflow-y-auto pt-24 lg:pt-0">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
