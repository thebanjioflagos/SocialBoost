
import React, { useState, useEffect } from 'react';
import { SocialProfile, User, AnalyticsPoint } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LucideTrendingUp, LucidePlus, LucideSparkles, LucideGlobe, 
  LucideLoader2, LucideMapPin, LucideExternalLink, 
  LucideCrown, LucideKey, LucideLayers, LucideActivity, 
  LucideVideo, LucideShieldAlert, LucideRefreshCw, LucideClock, LucideUser, LucideBuilding2,
  LucideCreditCard, LucideArrowRight, LucideZap
} from 'lucide-react';
import { getMarketTrends, generateAnalyticsData, getLocalIntelligence, ApiKeyError } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { TrendTicker } from './TrendTicker';

interface DashboardProps {
  profile: SocialProfile | null;
  user: User;
  onNavigate: (view: any, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, user, onNavigate }) => {
  const [trends, setTrends] = useState<{title: string, detail: string, source?: string}[]>([]);
  const [localOps, setLocalOps] = useState<{name: string, uri: string, snippet: string}[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<{status?: number, message: string, isQuota?: boolean} | null>(null);
  const [stats, setStats] = useState({ campaigns: 0, posts: 0, media: 0 });

  const fetchData = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const [trendsResult, analyticsResult, localResult, raw] = await Promise.all([
        profile ? getMarketTrends(profile) : Promise.resolve([]),
        profile ? generateAnalyticsData(profile) : Promise.resolve([]),
        profile ? getLocalIntelligence(profile) : Promise.resolve([]),
        dataService.getRawStorageData()
      ]);
      const camps = await dataService.getCampaigns();
      setTrends(trendsResult);
      setAnalytics(analyticsResult);
      setLocalOps(localResult);
      setStats({ campaigns: camps.length, posts: raw.postCount, media: raw.mediaCount });
    } catch (e: any) { 
      if (e instanceof ApiKeyError) {
        setAuthError({ status: e.status, message: e.message, isQuota: e.isQuota });
      } else {
        console.error("Dashboard Load Error:", e);
      }
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleOpenKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      fetchData();
    }
  };

  const handleTrendClick = (trendTitle: string) => {
    // Navigate to generator with this trend as the pre-filled topic
    onNavigate('generate', { topic: trendTitle });
  };

  const isSolo = profile?.account_type === 'individual';

  return (
    <div className="space-y-0 animate-fade-in pb-20">
      <TrendTicker profile={profile} />
      
      <div className="p-4 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-brand-500 tracking-tighter">
                Control <span className="text-slate-300">HQ</span>
              </h1>
              <div className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-brand-gold/20">
                <LucideCrown size={12} /> {user.usage.plan} Enterprise
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                {isSolo ? <LucideUser size={14} className="text-brand-gold" /> : <LucideBuilding2 size={14} className="text-brand-gold" />}
                Intelligence Mode: {isSolo ? 'Solo Creator' : 'Enterprise Entity'}
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                <LucideMapPin size={14} className="text-brand-gold" />
                Node: <span className="text-slate-900 font-bold">
                  {profile?.location ? `${profile.location.city}, NG` : 'Global Network'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             {user.usage.plan === 'free' && (
                <button 
                  onClick={() => onNavigate('billing')}
                  className="bg-brand-gold text-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl flex items-center gap-3 transition-all hover:bg-orange-600"
                >
                  <LucideCreditCard size={20} />
                  ACTIVATE BILLING
                </button>
             )}
             <button onClick={() => onNavigate('campaigns')} className="bg-white border-2 border-slate-100 text-slate-900 px-8 py-5 rounded-[1.5rem] font-black shadow-sm flex items-center gap-3 transition-all hover:bg-slate-50">
               <LucideLayers size={20} className="text-brand-500" /> CAMPAIGNS
             </button>
             <button onClick={() => onNavigate('generate')} className="bg-brand-500 hover:bg-brand-600 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl flex items-center gap-3 transition-all hover:-translate-y-1">
               <LucidePlus size={24} className="text-brand-gold" /> FORGE ASSETS
             </button>
          </div>
        </header>

        {authError && (
          <div className="bg-brand-50 border-2 border-brand-200 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 animate-fade-in shadow-xl shadow-brand-500/10">
            <div className="p-8 bg-white rounded-full text-brand-500 shadow-xl border-4 border-brand-100">
              {authError.isQuota ? <LucideClock size={48} className="text-orange-500" /> : authError.status === 404 ? <LucideShieldAlert size={48} className="text-red-500" /> : <LucideKey size={48} />}
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-3xl font-black text-brand-900 uppercase tracking-tighter">
                  {authError.isQuota ? 'Quota Exhausted (429)' : authError.status === 404 ? 'Model Not Found (404)' : 'Enterprise Auth Required (403)'}
                </h3>
                <p className="text-brand-700 font-bold leading-relaxed">
                  {authError.message}
                </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleOpenKey} className="bg-brand-500 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl transition-all hover:bg-brand-600 active:scale-95 whitespace-nowrap">RE-SELECT PAID KEY</button>
              <button onClick={fetchData} className="text-brand-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:underline">
                <LucideRefreshCw size={14} /> Retry Now
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Active Campaigns', val: stats.campaigns, icon: LucideLayers, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: 'Total Assets', val: stats.media, icon: LucideVideo, color: 'text-brand-gold', bg: 'bg-orange-50' },
             { label: 'Cloud Schedules', val: stats.posts, icon: LucideActivity, color: 'text-brand-500', bg: 'bg-brand-50' },
             { label: 'Regional Reach', val: '4.2k', icon: LucideGlobe, color: 'text-purple-500', bg: 'bg-purple-50' },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all">
                <div className={`p-5 rounded-[1.5rem] ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={28} /></div>
                <div>
                   <div className="text-3xl font-black text-slate-900">{stat.val}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reach Momentum</h3>
                  <p className="text-slate-400 text-xs font-medium">Predictive algorithmic reach for next 7 days</p>
               </div>
               <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 font-black text-[10px] uppercase tracking-widest text-brand-500">
                  <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span> PREDICTIVE MODE
               </div>
             </div>
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analytics}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#064E3B" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#064E3B" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                   <Tooltip cursor={{stroke: '#D97706', strokeWidth: 2}} contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: '#064E3B', color: '#fff', fontWeight: 900, padding: '20px'}} />
                   <Area type="monotone" dataKey="value" stroke="#064E3B" strokeWidth={6} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-brand-500 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700"><LucideSparkles size={180} /></div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-2 text-brand-gold font-black uppercase tracking-[0.3em] text-[10px]">
                    <span className="w-2.5 h-2.5 bg-brand-gold rounded-full animate-ping"></span>
                    Market Intelligence
                  </div>
                  {isLoading ? (
                    <div className="flex items-center gap-4 py-8"><LucideLoader2 className="animate-spin text-brand-gold" /><p className="text-brand-gold font-black italic uppercase tracking-widest text-xs">Scanning Pulse...</p></div>
                  ) : trends.length === 0 ? (
                    <div className="py-8 opacity-40 italic font-bold text-sm">Waiting for profile configuration...</div>
                  ) : (
                    <div className="space-y-4">
                      {trends.map((trend, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleTrendClick(trend.title)}
                          className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-brand-gold transition-all cursor-pointer group/item relative"
                        >
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="text-xl font-black text-white leading-tight pr-8">{trend.title}</h4>
                             <LucideArrowRight size={18} className="text-brand-gold opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed font-medium line-clamp-2">{trend.detail}</p>
                          <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-brand-gold uppercase tracking-widest">
                             <LucideZap size={10} /> Forge Content from Trend
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </div>

             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                   <LucideMapPin size={12} className="text-brand-500" /> Regional Opportunities
                </h4>
                <div className="space-y-4">
                  {localOps.length === 0 ? (
                    <div className="py-4 text-xs text-slate-400 italic">No regional profile data yet...</div>
                  ) : (
                    localOps.slice(0, 3).map((op, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-brand-500 hover:bg-white transition-all group cursor-pointer">
                        <div className="flex-1 overflow-hidden pr-4">
                          <h5 className="font-black text-slate-900 text-xs uppercase tracking-tight truncate">{op.name}</h5>
                          <p className="text-[9px] text-slate-500 font-bold mt-1 truncate uppercase">{op.snippet}</p>
                        </div>
                        <LucideExternalLink size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
