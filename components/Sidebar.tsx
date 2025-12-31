
import React from 'react';
import { User, ViewType } from '../types';
import { 
  LucideLayoutDashboard, LucideCalendarDays, LucideWand2, LucideLogOut, 
  LucideSearchCode, LucideZap, LucideMicVocal, LucideUsers2, 
  LucideBot, LucideActivity, LucideShieldAlert, LucideCrown, 
  LucideBriefcase, LucideNetwork, LucideTerminal, LucideUserPlus,
  LucideDatabase, LucideCreditCard
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  profileName: string;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, profileName, user, onLogout }) => {
  const creativeItems = [
    { id: 'generate', label: 'Creative Studio', icon: LucideWand2 },
    { id: 'campaigns', label: 'Campaign Hub', icon: LucideBriefcase },
    { id: 'viral', label: 'Viral Agent', icon: LucideZap },
  ];

  const intelligenceItems = [
    { id: 'knowledge', label: 'Knowledge Vault', icon: LucideDatabase },
    { id: 'audit', label: 'Platform Audit', icon: LucideSearchCode },
    { id: 'consultant', label: 'AI Strategist', icon: LucideMicVocal },
    { id: 'reputation', label: 'Brand Protect', icon: LucideShieldAlert },
    { id: 'influencers', label: 'Influencer Pulse', icon: LucideUserPlus },
  ];

  const operationsItems = [
    { id: 'engagement', label: 'Interaction', icon: LucideBot },
    { id: 'calendar', label: 'Scheduling', icon: LucideCalendarDays },
    { id: 'accounts', label: 'Social Connect', icon: LucideUsers2 },
    { id: 'team', label: 'Workspace Team', icon: LucideNetwork },
  ];

  const NavButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => onChangeView(id)}
      className={`w-full flex items-center justify-between group px-5 py-3 rounded-[1rem] transition-all ${
        currentView === id || (id === 'campaigns' && currentView === 'campaign_detail')
          ? 'bg-white text-brand-500 shadow-xl' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className={currentView === id ? 'text-brand-gold' : ''} />
        <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
      </div>
      {currentView === id && <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>}
    </button>
  );

  return (
    <div className="flex flex-col h-full p-6 text-white">
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          SocialBoost <span className="text-brand-gold italic">Pro</span>
        </h1>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-[0.4em] font-black">Enterprise AI Suite</p>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto scrollbar-none pb-10">
        <div>
          <button onClick={() => onChangeView('dashboard')} className={`w-full flex items-center gap-4 px-5 py-3 rounded-[1rem] mb-4 ${currentView === 'dashboard' ? 'bg-white text-brand-500 shadow-xl' : 'text-white/60 hover:text-white'}`}>
             <LucideLayoutDashboard size={20} />
             <span className="font-bold text-xs uppercase tracking-tight">Command Center</span>
          </button>
          
          {(user.role === 'Admin' || user.role === 'Superuser') && (
            <button onClick={() => onChangeView('admin_panel')} className={`w-full flex items-center gap-4 px-5 py-3 rounded-[1rem] mb-4 ${currentView === 'admin_panel' ? 'bg-white text-brand-500 shadow-xl' : 'text-white/60 hover:text-white'}`}>
               <LucideTerminal size={20} />
               <span className="font-bold text-xs uppercase tracking-tight">Global Ops Hub</span>
            </button>
          )}
        </div>

        <div>
          <h5 className="px-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Creative & Growth</h5>
          <div className="space-y-1">{creativeItems.map(item => <NavButton key={item.id} {...item} />)}</div>
        </div>

        <div>
          <h5 className="px-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Intelligence AI</h5>
          <div className="space-y-1">{intelligenceItems.map(item => <NavButton key={item.id} {...item} />)}</div>
        </div>

        <div>
          <h5 className="px-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Operations</h5>
          <div className="space-y-1">{operationsItems.map(item => <NavButton key={item.id} {...item} />)}</div>
        </div>

        <div className="pt-4">
           <button onClick={() => onChangeView('billing')} className={`w-full flex items-center gap-4 px-5 py-3 rounded-[1rem] border-2 ${currentView === 'billing' ? 'bg-white text-brand-500 border-white' : 'border-white/10 text-white/60 hover:border-white/20'}`}>
              <LucideCreditCard size={20} />
              <span className="font-bold text-xs uppercase tracking-tight">Billing Node</span>
           </button>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
         <div className="bg-black/20 p-5 rounded-[1.5rem] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center font-black">
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
               <div className="text-[9px] font-black uppercase text-brand-gold tracking-widest flex items-center gap-2">
                 {user.usage.plan} Plan <LucideCrown size={10} />
               </div>
               <div className="text-sm font-black truncate">{profileName}</div>
            </div>
         </div>
         
         <div className="flex gap-2">
           <button onClick={() => onChangeView('diagnostics')} title="System Diagnostics" className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"><LucideActivity size={18} /></button>
           <button onClick={onLogout} title="Secure Logout" className="flex-1 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"><LucideLogOut size={18} /></button>
         </div>
      </div>
    </div>
  );
};
