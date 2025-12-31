
import React, { useState, useEffect } from 'react';
import { generateViralSparks, getEngagementSuggestions } from '../services/geminiService';
import { SocialProfile, ViralSpark, EngagementSuggestion } from '../types';
import { LucideZap, LucideLoader2, LucideFlame, LucideSparkles, LucideMessageSquare, LucideTarget, LucideCopy, LucideExternalLink, LucideShieldCheck, LucideCheck, LucideInfo, LucideGlobe, LucideRefreshCw } from 'lucide-react';

interface ViralAgentProps {
  profile: SocialProfile;
}

export const ViralAgent: React.FC<ViralAgentProps> = ({ profile }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [spark, setSpark] = useState<ViralSpark | null>(null);
  const [activeView, setActiveView] = useState<'agent' | 'engagement'>('agent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isEngagementLoading, setIsEngagementLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<EngagementSuggestion[]>([]);

  const handleSpark = async () => {
    setIsGenerating(true);
    setSpark(null);
    try {
      const result = await generateViralSparks(profile);
      setSpark(result);
    } catch (e) { alert("Virality engine overheated! Trend pulse is too fast."); }
    finally { setIsGenerating(false); }
  };

  const loadEngagement = async () => {
    setIsEngagementLoading(true);
    try {
      const results = await getEngagementSuggestions(profile);
      setSuggestions(results);
    } catch (e) { alert("Engagement agent handshake failed."); }
    finally { setIsEngagementLoading(false); }
  };

  useEffect(() => {
    if (activeView === 'engagement' && suggestions.length === 0) loadEngagement();
  }, [activeView]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-6xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 flex items-center gap-4 tracking-tighter italic">
            Growth Center <LucideFlame className="text-orange-600 animate-pulse" size={40} />
          </h1>
          <p className="text-slate-500 font-bold text-lg">Predicting and hijacking the social graph for {profile.name}.</p>
        </div>
        <div className="flex bg-slate-900/5 p-2 rounded-[1.5rem] border-2 border-slate-100 shadow-inner">
           <button onClick={() => setActiveView('agent')} className={`px-8 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all ${activeView === 'agent' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>Viral Sparks</button>
           <button onClick={() => setActiveView('engagement')} className={`px-8 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all ${activeView === 'engagement' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>Auto-Engagement</button>
        </div>
      </header>

      {activeView === 'agent' ? (
        <div className="space-y-10">
           <button 
            onClick={handleSpark} disabled={isGenerating}
            className="w-full bg-slate-900 text-white p-12 rounded-[3.5rem] font-black text-3xl shadow-3xl hover:bg-black transition-all group overflow-hidden relative border-4 border-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-brand-500/20 to-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
            <span className="flex items-center justify-center gap-6 relative z-10">
              {isGenerating ? <LucideLoader2 className="animate-spin" size={40} /> : <LucideZap className="text-brand-gold" size={40} />}
              {isGenerating ? 'MINING GROUNDED TRENDS...' : 'IGNITE VIRAL SPARK'}
            </span>
            <div className="mt-4 text-xs font-black text-slate-500 uppercase tracking-[0.4em] relative z-10">Powered by Gemini 3 Grounding</div>
          </button>

          {spark && (
             <div className="animate-fade-in space-y-10 pb-12">
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><LucideSparkles size={200} /></div>
                   <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Core Viral concept
                   </div>
                   <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">{spark.viral_concept}</h2>
                   <div className="mt-10 p-8 bg-brand-50 rounded-[2.5rem] border-2 border-brand-100 italic font-bold text-brand-800 text-xl shadow-inner">
                     "Why it works: {spark.reason_for_virality}"
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {Object.entries(spark.hook_options || {}).map(([key, val]) => (
                      <div key={key} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all hover:-translate-y-2">
                        <div className="flex justify-between items-center">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{key} Trigger</div>
                           <LucideTarget size={18} className="text-brand-gold" />
                        </div>
                        <p className="font-black text-slate-900 text-2xl leading-snug italic group-hover:text-brand-500 transition-colors">"{val}"</p>
                        <button 
                          onClick={() => copyToClipboard(val as string, key)}
                          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            copiedId === key ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          {copiedId === key ? <LucideCheck size={14} /> : <LucideCopy size={14} />}
                          {copiedId === key ? 'COPIED TO FORGE' : 'USE THIS HOOK'}
                        </button>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      ) : (
        <div className="space-y-10 animate-fade-in pb-12">
           <div className="bg-brand-500 text-white p-14 rounded-[4.5rem] shadow-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:rotate-12 transition-transform duration-1000"><LucideTarget size={220} /></div>
             <div className="relative z-10 max-w-2xl space-y-6">
                <div className="flex items-center gap-3 bg-white/10 w-fit px-6 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
                   <LucideShieldCheck size={14} /> Grounded Algorithm Hijack
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter">Community Interaction Agent</h3>
                <p className="text-brand-100 font-bold text-xl leading-relaxed">
                  We are scanning real-time {profile.focus_area} conversations in {profile.location.city}. Join these trending threads with our AI-Suggested scripts to pull "Human" traffic back to your node.
                </p>
             </div>
           </div>

           {isEngagementLoading ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-8">
                <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-brand-100 border-t-brand-gold rounded-full animate-spin"></div>
                   <LucideGlobe className="absolute inset-0 m-auto text-brand-gold animate-pulse" size={40} />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 uppercase tracking-[0.4em] text-[11px]">Syncing with Social Graph...</p>
                  <p className="text-slate-400 font-bold text-sm italic">Identifying high-visibility threads to dominate.</p>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {suggestions.map((s, i) => (
                   <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between hover:shadow-3xl transition-all group">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            <LucideExternalLink size={14} className="text-brand-gold" /> Trending Context
                         </div>
                         <p className="text-slate-900 font-black text-xl leading-tight tracking-tight italic">"{s.target_post_desc}"</p>
                         <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 relative shadow-inner">
                            <LucideMessageSquare size={24} className="absolute -top-4 -right-4 text-brand-500 bg-white rounded-full p-1.5 border shadow-xl" />
                            <p className="text-slate-700 font-bold leading-relaxed text-lg italic">"{s.suggested_comment}"</p>
                         </div>
                      </div>
                      <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                         <div className="px-5 py-2 bg-brand-50 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                            Psychology: {s.psychological_angle}
                         </div>
                         <button 
                          onClick={() => copyToClipboard(s.suggested_comment, `eng-${i}`)}
                          className={`flex items-center gap-2 font-black text-xs transition-colors ${copiedId === `eng-${i}` ? 'text-green-600' : 'text-brand-600 hover:text-brand-900'}`}
                         >
                            {copiedId === `eng-${i}` ? <LucideCheck size={14} /> : <LucideCopy size={14} />}
                            {copiedId === `eng-${i}` ? 'COPIED' : 'COPY SCRIPT'}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
           )}
           <button onClick={loadEngagement} className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black hover:border-brand-500 hover:text-brand-500 transition-all uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4">
              <LucideRefreshCw size={20} /> Refresh Grounded Targets
           </button>

           <div className="bg-[#064E3B] p-12 rounded-[4rem] text-white shadow-3xl flex flex-col md:flex-row items-center gap-10">
              <div className="p-8 bg-white/10 rounded-3xl border border-white/10"><LucideInfo size={48} className="text-brand-gold" /></div>
              <div className="space-y-2">
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase">Why Auto-Engagement?</h4>
                 <p className="text-brand-100 font-medium text-lg leading-relaxed opacity-80">
                   "Posting is only 50% of the battle. By joining high-performance threads in the ${profile.focus_area} space, you're signaling to the algorithm that your brand is an active authority. Use these scripts to stay relatable without spending 4 hours on Instagram."
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
