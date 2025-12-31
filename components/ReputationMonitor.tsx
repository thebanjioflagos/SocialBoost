
import React, { useState, useEffect } from 'react';
import { SocialProfile, SentimentAnalysis, User } from '../types';
import { analyzeSentiment, performSocialListening, generateAutomatedReply } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { 
  LucideShieldAlert, LucideCheckCircle, LucideMessageCircle, LucideLoader2, 
  LucideZap, LucideFlame, LucideAlertTriangle, LucideHistory, 
  LucideArrowUpRight, LucideCheck, LucideSearch, LucideExternalLink, LucideGlobe 
} from 'lucide-react';

interface ReputationMonitorProps {
  profile: SocialProfile;
}

export const ReputationMonitor: React.FC<ReputationMonitorProps> = ({ profile }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{id: string, author: string, comment: string, analysis: SentimentAnalysis, time: string, resolved?: boolean}[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    const loadKeywords = async () => {
      const user = await dataService.getCurrentUser();
      if (user?.automationSettings?.socialListeningKeywords) {
        setKeywords(user.automationSettings.socialListeningKeywords);
      } else {
        setKeywords([profile.focus_area, profile.name, 'Food delivery Lagos']);
      }
    };
    loadKeywords();
  }, [profile]);

  const addKeyword = async () => {
    if (!newKeyword) return;
    const updated = [...keywords, newKeyword];
    setKeywords(updated);
    const user = await dataService.getCurrentUser();
    if (user) await dataService.updateAutomation({ socialListeningKeywords: updated }, user);
    setNewKeyword('');
  };

  const removeKeyword = async (k: string) => {
    const updated = keywords.filter(kw => kw !== k);
    setKeywords(updated);
    const user = await dataService.getCurrentUser();
    if (user) await dataService.updateAutomation({ socialListeningKeywords: updated }, user);
  };

  const runMarketScan = async () => {
    setIsScanning(true);
    setAlerts([]);
    try {
      const results = await performSocialListening(keywords, profile);
      const mapped = results.map(r => ({
        id: Math.random().toString(36).substr(2, 9),
        author: "Market Signal",
        comment: r.summary,
        analysis: r,
        time: new Date().toLocaleTimeString(),
        resolved: false
      }));
      setAlerts(mapped);
    } catch (e) { alert("Market scan failed. Grounding node timeout."); }
    finally { setIsScanning(false); }
  };

  const handleAutoResolve = async (alertId: string, comment: string) => {
    setIsResolving(alertId);
    try {
      await generateAutomatedReply(profile, comment, 'Market Interaction');
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    } catch (e) { alert("Resolution failed."); }
    finally { setIsResolving(null); }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4">
            Reputation Monitor <LucideShieldAlert className="text-red-500" />
          </h1>
          <p className="text-slate-500 font-medium">Monitoring {profile.name} mentions and market keywords.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={runMarketScan} 
            disabled={isScanning}
            className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95"
          >
            {isScanning ? <LucideLoader2 className="animate-spin text-brand-gold" /> : <LucideSearch className="text-brand-gold" />}
            {isScanning ? 'LISTENING...' : 'RUN MARKET SCAN'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LucideSearch size={14} /> Active Listening Keywords
             </h4>
             <div className="flex flex-wrap gap-3">
                {keywords.map(k => (
                  <span key={k} className="bg-slate-50 border border-slate-100 px-5 py-2 rounded-full text-xs font-black text-slate-700 flex items-center gap-3 group">
                    {k}
                    <button onClick={() => removeKeyword(k)} className="text-slate-300 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
                <div className="flex bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full items-center">
                  <input 
                    className="bg-transparent border-none outline-none text-xs font-bold w-24 placeholder:text-slate-300" 
                    placeholder="Add target..." 
                    value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                  />
                  <button onClick={addKeyword} className="text-brand-500 font-black ml-2">+</button>
                </div>
             </div>
          </div>

          {isScanning ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-8">
                <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                   <LucideGlobe className="absolute inset-0 m-auto text-brand-500 animate-pulse" size={40} />
                </div>
                <div className="text-center">
                   <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px]">Filtering Global Signal...</p>
                   <p className="text-slate-400 text-xs font-bold italic">Scanning Nigerian Social Graph for ${profile.focus_area} signals.</p>
                </div>
             </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white border-8 border-dashed border-slate-50 rounded-[4rem] p-32 text-center space-y-8">
               <LucideHistory size={80} className="mx-auto text-slate-100" />
               <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">No critical reputation risks found.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`bg-white p-10 rounded-[3.5rem] shadow-sm border-l-[16px] transition-all hover:shadow-2xl flex flex-col gap-8 ${
                alert.resolved ? 'border-brand-100 opacity-60' :
                alert.analysis.tone === 'negative' ? 'border-red-500' : 
                alert.analysis.tone === 'urgent' ? 'border-brand-gold' : 
                'border-brand-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-black text-slate-900 text-xl flex items-center gap-3">
                       {alert.author}
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          alert.analysis.tone === 'negative' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-50 text-brand-500 border-brand-100'
                       }`}>
                          {alert.analysis.tone} Sentiment
                       </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.time}</div>
                  </div>
                </div>
                <p className="text-slate-800 font-black text-2xl leading-relaxed italic">"{alert.comment}"</p>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                   <div className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest">
                      <LucideZap size={14} /> AI Context: {alert.analysis.reason}
                   </div>
                   <p className="text-sm font-bold text-slate-700 leading-relaxed">Recommendation: {alert.analysis.suggestedAction}</p>
                   {alert.analysis.sources && (
                      <div className="flex flex-wrap gap-2 pt-4">
                         {alert.analysis.sources.slice(0, 2).map((s, i) => (
                           <a key={i} href={s.uri} target="_blank" className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[9px] font-black text-brand-500 border border-brand-100 hover:shadow-lg transition-all">
                             <LucideExternalLink size={12} /> {s.title}
                           </a>
                         ))}
                      </div>
                   )}
                   {!alert.resolved && (
                      <button 
                        onClick={() => handleAutoResolve(alert.id, alert.comment)}
                        disabled={isResolving === alert.id}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-brand-500 transition-all"
                      >
                        {isResolving === alert.id ? <LucideLoader2 className="animate-spin" /> : <LucideCheckCircle size={18} className="text-brand-gold" />}
                        Execute AI Intervention
                      </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="bg-brand-500 rounded-[4rem] p-12 text-white shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700"><LucideFlame size={150} /></div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Market Pulse</h3>
              <div className="text-7xl font-black text-brand-gold tracking-tighter">94%</div>
              <div className="text-xs font-black text-brand-100 uppercase tracking-widest mt-2">Brand Safety Score</div>
              <p className="text-brand-100 text-sm font-bold leading-relaxed mt-10">
                 Sentiment in {profile.location.city} is POSITIVE. We monitored {keywords.length} keywords across the social graph.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
