
import React, { useState } from 'react';
import { SocialProfile, Influencer } from '../types';
import { discoverInfluencers, ApiKeyError } from '../services/geminiService';
import { 
  LucideUserPlus, LucideLoader2, LucideZap, LucideExternalLink, 
  LucideCrown, LucideGlobe, LucideTarget, LucideStar, LucideShieldAlert, LucideKey
} from 'lucide-react';

interface InfluencerPulseProps {
  profile: SocialProfile;
}

export const InfluencerPulse: React.FC<InfluencerPulseProps> = ({ profile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [authError, setAuthError] = useState(false);

  const handleScan = async () => {
    setIsLoading(true);
    setAuthError(false);
    try {
      const data = await discoverInfluencers(profile);
      setInfluencers(data);
    } catch (e) {
      if (e instanceof ApiKeyError) setAuthError(true);
      else alert("Regional scan failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      handleScan();
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4">
            Influencer Pulse <LucideUserPlus size={32} />
          </h1>
          <p className="text-slate-500 font-medium font-bold italic text-sm">Discover regional creators in {profile.location.city}.</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isLoading}
          className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95"
        >
          {isLoading ? <LucideLoader2 className="animate-spin text-brand-gold" /> : <LucideZap size={24} className="text-brand-gold" />}
          {isLoading ? 'SCANNING PULSE...' : 'START REGIONAL SCAN'}
        </button>
      </header>

      {authError && (
        <div className="bg-brand-50 border-2 border-brand-200 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 animate-fade-in shadow-xl shadow-brand-500/10">
           <div className="p-8 bg-white rounded-full text-brand-500 shadow-xl border-4 border-brand-100"><LucideKey size={44} /></div>
           <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black text-brand-900 uppercase tracking-tighter">Enterprise Intelligence Required</h3>
              <p className="text-brand-700 font-bold leading-relaxed">Grounded influencer discovery requires an active Paid GCP Project key for real-time web access.</p>
           </div>
           <button onClick={handleOpenKey} className="bg-brand-500 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl transition-all">RE-SELECT PAID KEY</button>
        </div>
      )}

      {influencers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {influencers.map((inf, i) => (
            <div key={i} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all flex flex-col justify-between hover:-translate-y-2">
               <div className="space-y-8">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                        {inf.name.charAt(0)}
                     </div>
                     <div className="flex items-center gap-1 text-brand-gold">
                        <LucideStar size={16} fill="currentColor" />
                        <span className="font-black text-sm">{inf.relevance_score}/100</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{inf.name}</h3>
                     <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{inf.platform} • {inf.handle}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Niche</h4>
                     <p className="text-xs font-bold text-slate-700">{inf.niche || "Content Creator"}</p>
                  </div>
               </div>
               <a 
                href={inf.uri} target="_blank" rel="noopener noreferrer"
                className="mt-10 w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-brand-500"
               >
                 VIEW PROFILE <LucideExternalLink size={16} />
               </a>
            </div>
          ))}
        </div>
      )}

      {influencers.length === 0 && !isLoading && (
        <div className="bg-white border-8 border-dashed border-slate-50 rounded-[4.5rem] p-32 text-center space-y-8">
           <LucideGlobe size={80} className="mx-auto text-slate-100" />
           <div className="space-y-2">
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">Discover Regional Collaborators.</p>
             <p className="text-slate-300 font-bold italic">Use the Gemini 3 Intelligence Engine to find influencers in {profile.location.city}.</p>
           </div>
        </div>
      )}
    </div>
  );
};
