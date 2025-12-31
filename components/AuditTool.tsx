
import React, { useState, useEffect } from 'react';
import { performSocialAudit, performCompetitorBenchmark, ApiKeyError } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { AuditResult, BenchmarkResult, MediaAsset, SocialProfile } from '../types';
import { 
  LucideSearch, LucideLoader2, LucideShieldCheck, LucideExternalLink, 
  LucideZap, LucideAlertTriangle, LucideCheckCircle2, LucideGlobe, 
  LucideArrowLeftRight, LucideTrophy, LucideTrendingDown, LucideHardDrive, 
  LucideImage, LucideVideo, LucideCalendar, LucideKey, LucideLayoutDashboard,
  LucideBarChart4, LucideArrowUpRight, LucideTarget, LucideActivity,
  LucideSparkles
} from 'lucide-react';

export const AuditTool: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [compHandle, setCompHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [activeTab, setActiveTab] = useState<'audit' | 'benchmark' | 'vault'>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [profile, setProfile] = useState<SocialProfile | null>(null);

  // Vault State
  const [mediaVault, setMediaVault] = useState<MediaAsset[]>([]);
  const [isVaultLoading, setIsVaultLoading] = useState(false);

  useEffect(() => {
    dataService.getProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (activeTab === 'vault') loadVault();
  }, [activeTab]);

  const loadVault = async () => {
    setIsVaultLoading(true);
    try {
      const assets = await dataService.getAllMedia();
      setMediaVault(assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) { console.error(e); }
    finally { setIsVaultLoading(false); }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    
    setIsLoading(true);
    setAuditResult(null);
    setBenchmarkResult(null);
    setAuthRequired(false);
    try {
      if (activeTab === 'benchmark' && compHandle) {
        const result = await performCompetitorBenchmark(handle, compHandle, platform, profile);
        setBenchmarkResult(result);
      } else {
        const result = await performSocialAudit(handle, platform, profile);
        setAuditResult(result);
      }
    } catch (error) {
      if (error instanceof ApiKeyError) setAuthRequired(true);
      else alert("Intelligence scan failed. Service may be under high load.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setAuthRequired(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4">
            Intelligence Suite <LucideBarChart4 size={32} />
          </h1>
          <p className="text-slate-500 font-medium">Verified platform auditing and competitor pulse monitoring.</p>
        </div>
        <div className="flex bg-slate-900/5 p-1.5 rounded-[1.5rem] border border-slate-100">
          <button 
            onClick={() => { setActiveTab('audit'); setAuditResult(null); setBenchmarkResult(null); }}
            className={`px-8 py-3 rounded-[1rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Social Audit
          </button>
          <button 
            onClick={() => { setActiveTab('benchmark'); setAuditResult(null); setBenchmarkResult(null); }}
            className={`px-8 py-3 rounded-[1rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === 'benchmark' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Benchmarking
          </button>
          <button 
            onClick={() => setActiveTab('vault')}
            className={`px-8 py-3 rounded-[1rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === 'vault' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-700'}`}
          >
            Media Vault
          </button>
        </div>
      </header>

      {authRequired && (
        <div className="bg-brand-50 border-2 border-brand-200 p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 animate-fade-in shadow-xl shadow-brand-500/10">
           <div className="p-8 bg-white rounded-full text-brand-500 shadow-xl border-4 border-brand-100"><LucideKey size={44} /></div>
           <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-2xl font-black text-brand-900 uppercase tracking-tighter">Paid Project Key Required</h3>
              <p className="text-brand-700 font-bold leading-relaxed">External platform auditing via Google Search requires an active GCP project key.</p>
           </div>
           <button 
            onClick={handleOpenKey}
            className="bg-brand-500 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl flex items-center gap-4 hover:bg-brand-600 transition-all"
           >
             SELECT KEY <LucideExternalLink size={20} />
           </button>
        </div>
      )}

      {activeTab !== 'vault' ? (
        <>
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
            <form onSubmit={handleAction} className="flex flex-col md:flex-row gap-6">
              <div className="flex-[2] flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                  <LucideSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                  <input 
                    type="text" required
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-brand-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    placeholder="Enter Handle (e.g. @Nike)"
                    value={handle} onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
                {activeTab === 'benchmark' && (
                  <div className="flex-1 relative">
                    <LucideArrowLeftRight className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    <input 
                      type="text" required
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-brand-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      placeholder="Competitor Handle"
                      value={compHandle} onChange={(e) => setCompHandle(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <select 
                className="px-8 py-5 border-2 border-slate-50 rounded-[2rem] outline-none bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest"
                value={platform} onChange={(e) => setPlatform(e.target.value)}
              >
                <option>Instagram</option><option>Facebook</option><option>Twitter</option><option>LinkedIn</option><option>TikTok</option>
              </select>
              <button 
                type="submit" disabled={isLoading}
                className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-2xl"
              >
                {isLoading ? <LucideLoader2 className="animate-spin" size={24} /> : <LucideZap size={24} className="text-brand-gold" />}
                {isLoading ? 'ANALYZING...' : activeTab === 'benchmark' ? 'BENCHMARK' : 'START AUDIT'}
              </button>
            </form>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-8">
              <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                 <LucideGlobe className="absolute inset-0 m-auto text-brand-500 animate-pulse" size={40} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px]">Grounded Platform Scan in Progress</p>
                <p className="text-slate-400 text-xs font-bold italic">Extracting real-time visibility and engagement markers...</p>
              </div>
            </div>
          )}

          {benchmarkResult && (
            <div className="space-y-12 animate-fade-in pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 text-center space-y-6 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><LucideTarget size={120} /></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{benchmarkResult.user_handle} Pulse</div>
                  <div className="text-8xl font-black text-brand-500 tabular-nums tracking-tighter">{benchmarkResult.comparison.user_score}%</div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${benchmarkResult.comparison.user_score}%` }}></div>
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 text-center space-y-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><LucideActivity size={120} /></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{benchmarkResult.competitor_handle} Pulse</div>
                  <div className="text-8xl font-black text-slate-900 tabular-nums tracking-tighter">{benchmarkResult.comparison.competitor_score}%</div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${benchmarkResult.comparison.competitor_score}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-14 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 shadow-2xl relative overflow-hidden">
                <div className="bg-brand-gold/10 p-10 rounded-[2.5rem] border border-brand-gold/20 text-brand-gold animate-bounce-slow"><LucideTrophy size={64} /></div>
                <div className="space-y-4 relative z-10 flex-1">
                  <h3 className="text-3xl font-black italic tracking-tight">Verdict: {benchmarkResult.comparison.winner} holds the narrative edge.</h3>
                  <p className="text-slate-400 leading-relaxed font-bold text-lg">{benchmarkResult.comparison.detailed_diff}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm">
                   <h4 className="flex items-center gap-3 font-black text-brand-500 uppercase tracking-widest text-xs"><LucideZap size={20} /> Strategic Advantage</h4>
                   <ul className="space-y-4">
                     {benchmarkResult.competitive_advantage.map((a, i) => <li key={i} className="text-slate-800 flex gap-4 font-bold"><LucideCheckCircle2 size={24} className="text-brand-500 shrink-0 mt-0.5" /> {a}</li>)}
                   </ul>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm">
                   <h4 className="flex items-center gap-3 font-black text-orange-500 uppercase tracking-widest text-xs"><LucideTarget size={20} /> Competitive Gaps</h4>
                   <ul className="space-y-4">
                     {benchmarkResult.missing_gaps.map((a, i) => <li key={i} className="text-slate-800 flex gap-4 font-bold"><LucideTrendingDown size={24} className="text-orange-500 shrink-0 mt-0.5" /> {a}</li>)}
                   </ul>
                </div>
              </div>

              <div className="bg-[#064E3B] p-14 rounded-[4rem] border-4 border-brand-500 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-brand-gold opacity-0 group-hover:opacity-5 transition-opacity"></div>
                 <h4 className="text-brand-gold font-black mb-6 uppercase tracking-[0.4em] text-[10px]">Execution Directive</h4>
                 <p className="text-white leading-relaxed font-black text-2xl italic">"{benchmarkResult.strategy_to_beat}"</p>
              </div>

              {/* Fix: Display web sources for competitor benchmark to satisfy grounding requirements */}
              {benchmarkResult.sources && benchmarkResult.sources.length > 0 && (
                <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3"><LucideGlobe size={18} /> Verified Intelligence Grounding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benchmarkResult.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="flex items-center justify-between bg-white px-8 py-5 rounded-[1.5rem] text-xs font-black text-slate-700 border border-slate-100 hover:border-brand-500 hover:shadow-xl transition-all group">
                        <span className="truncate pr-4">{s.title}</span>
                        <LucideExternalLink size={18} className="text-brand-500 opacity-30 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {auditResult && (
            <div className="space-y-12 animate-fade-in pb-12">
              <div className="bg-white p-12 rounded-[4.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-16">
                   <div className="relative w-64 h-64 flex items-center justify-center bg-slate-900 rounded-full shadow-2xl border-[16px] border-slate-50">
                      <div className="text-center">
                        <div className="text-7xl font-black text-brand-500">{auditResult.health_score}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-[0.3em]">Health</div>
                      </div>
                      <div className="absolute -inset-4 border-4 border-brand-gold rounded-full opacity-20 animate-pulse"></div>
                   </div>
                   <div className="flex-1 space-y-8 w-full">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{auditResult.handle}</h2>
                           <div className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] flex items-center gap-2">
                              <span className="w-2 h-2 bg-brand-500 rounded-full"></span> {auditResult.platform} Verified Scan
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-100 text-center">
                              <div className="text-xl font-black text-slate-900">{auditResult.follower_count}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Followers</div>
                           </div>
                           <div className="bg-brand-50 px-6 py-4 rounded-[1.5rem] border border-brand-100 text-center">
                              <div className="text-xl font-black text-brand-500 uppercase">{auditResult.engagement_status}</div>
                              <div className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Sentiment</div>
                           </div>
                        </div>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                         <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Found Identity</h4>
                         <p className="text-slate-800 font-bold text-lg leading-relaxed italic">"{auditResult.found_bio}"</p>
                      </div>
                   </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8 shadow-sm">
                   <h4 className="flex items-center gap-3 font-black text-brand-500 uppercase tracking-widest text-[10px]"><LucideActivity size={20} /> Opportunity Scan</h4>
                   <ul className="space-y-4">
                     {auditResult.analysis.opportunities.map((o, i) => (
                       <li key={i} className="text-slate-800 flex gap-4 font-bold group">
                         <LucideArrowUpRight size={24} className="text-brand-500 shrink-0 mt-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {o}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="bg-slate-900 p-12 rounded-[4rem] space-y-8 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700"><LucideSparkles size={120} /></div>
                   <h4 className="flex items-center gap-3 font-black text-brand-500 uppercase tracking-widest text-[10px]">AI Refactored Persona</h4>
                   <p className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] text-white font-black text-xl leading-relaxed italic shadow-inner">"{auditResult.ai_optimized_bio}"</p>
                </div>
              </div>

              {auditResult.sources && auditResult.sources.length > 0 && (
                <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3"><LucideGlobe size={18} /> Verified Intelligence Grounding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auditResult.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="flex items-center justify-between bg-white px-8 py-5 rounded-[1.5rem] text-xs font-black text-slate-700 border border-slate-100 hover:border-brand-500 hover:shadow-xl transition-all group">
                        <span className="truncate pr-4">{s.title}</span>
                        <LucideExternalLink size={18} className="text-brand-500 opacity-30 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-10 animate-fade-in">
           <div className="bg-slate-900 p-14 rounded-[4.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 opacity-5"><LucideHardDrive size={200} /></div>
              <div className="space-y-4 relative z-10">
                 <h2 className="text-5xl font-black tracking-tighter">Media Vault</h2>
                 <p className="text-slate-400 font-bold text-lg">Central repository for all AI-Forged campaign assets.</p>
              </div>
              <div className="bg-white/5 px-10 py-8 rounded-[3rem] border border-white/10 flex items-center gap-8 shadow-inner">
                 <div className="text-center">
                    <div className="text-5xl font-black text-brand-gold">{mediaVault.length}</div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Active Assets</div>
                 </div>
                 <LucideHardDrive className="text-brand-gold opacity-50" size={56} />
              </div>
           </div>

           {isVaultLoading ? (
             <div className="flex flex-col items-center justify-center py-24"><LucideLoader2 className="animate-spin text-brand-500" size={64} /></div>
           ) : mediaVault.length === 0 ? (
             <div className="bg-white border-8 border-dashed border-slate-50 rounded-[4.5rem] p-32 text-center space-y-8">
                <LucideImage size={80} className="mx-auto text-slate-100" />
                <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Vault is Empty. Generate assets in the Creative Studio.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-12">
                {mediaVault.map((asset) => (
                  <div key={asset.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-3xl transition-all flex flex-col hover:-translate-y-2">
                     <div className="aspect-square relative overflow-hidden bg-slate-50">
                        {asset.type === 'image' ? (
                          <img src={asset.data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Forged Asset" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200"><LucideVideo size={64} /></div>
                        )}
                        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-xl text-white px-5 py-3 rounded-[1.5rem] text-[9px] font-black flex items-center gap-2 uppercase tracking-widest shadow-2xl">
                           <LucideShieldCheck size={14} className="text-brand-gold" /> Pro Node Forge
                        </div>
                     </div>
                     <div className="p-10 space-y-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                           <div className="flex items-center gap-2"><LucideCalendar size={14} /> {new Date(asset.createdAt).toLocaleDateString()}</div>
                           <div className="flex items-center gap-2">{asset.type} <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span></div>
                        </div>
                        <p className="text-sm text-slate-800 font-bold italic line-clamp-3 leading-relaxed flex-1">"{asset.prompt}"</p>
                        <button onClick={() => {
                          const link = document.createElement('a');
                          link.href = asset.data;
                          link.download = `SocialBoost_HQ_${asset.id}.png`;
                          link.click();
                        }} className="w-full bg-slate-50 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Export to HQ</button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
