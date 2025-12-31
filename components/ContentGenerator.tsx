
import React, { useState, useEffect } from 'react';
import { SocialProfile, DailyPackage, User } from '../types';
import { generateDailyPackage, generateVeoVideo, generateHighQualityImage, ApiKeyError } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { 
  LucideLoader2, LucideSparkles, LucideSmartphone, LucideGlobe,
  LucideUser, LucideBuilding2, LucideZap, LucideTarget, LucideShieldCheck, LucideInfo
} from 'lucide-react';

interface ContentGeneratorProps {
  profile: SocialProfile;
  user: User;
  onUserUpdate: (u: User) => void;
  initialTopic?: string;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ profile, user, onUserUpdate, initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<DailyPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'remix'>('text');
  
  const isSolo = profile.account_type === 'individual' || profile.account_type === 'creator';

  useEffect(() => {
    if (initialTopic) handleGenerate();
  }, [initialTopic]);

  const handleGenerate = async () => {
    setIsLoading(true); setGeneratedContent(null);
    try {
      const result = await generateDailyPackage(profile, topic);
      setGeneratedContent(result);
      onUserUpdate(await dataService.incrementUsage(user));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-brand-500 tracking-tight flex items-center gap-4 italic uppercase">
            Creative Studio <LucideZap className="text-brand-gold" size={40} />
          </h1>
          <p className="text-slate-500 font-bold text-lg">Council-Verified high-performance assets for {profile.name}.</p>
        </div>
        <div className="bg-slate-900 px-8 py-4 rounded-[2.5rem] flex items-center gap-4 shadow-2xl border border-white/10">
           {isSolo ? <LucideUser size={24} className="text-brand-gold" /> : <LucideBuilding2 size={24} className="text-brand-gold" />}
           <div className="text-right">
              <div className="text-[9px] font-black uppercase text-brand-gold tracking-[0.3em]">Identity Node</div>
              <div className="text-sm font-black text-white uppercase">{profile.account_type}</div>
           </div>
        </div>
      </header>

      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <input 
          className="flex-1 w-full pl-8 pr-6 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-brand-500 transition-all font-black text-slate-900 placeholder:text-slate-300"
          placeholder="Topic/Event (e.g. Lagos Black Friday Sale)..."
          value={topic} onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={handleGenerate} disabled={isLoading} className="bg-brand-500 hover:bg-brand-600 text-white px-14 py-6 rounded-[2rem] font-black text-lg flex items-center gap-5 shadow-3xl transition-all">
          {isLoading ? <LucideLoader2 className="animate-spin" /> : <LucideSparkles className="text-brand-gold" />} FORGE ASSETS
        </button>
      </div>

      {generatedContent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in pb-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[4.5rem] shadow-sm border border-slate-100 overflow-hidden">
               <div className="bg-slate-50 px-12 py-8 border-b flex gap-10 items-center overflow-x-auto scrollbar-none">
                   {['text', 'image', 'strategy'].map(tab => (
                     <button 
                      key={tab} onClick={() => setActiveTab(tab as any)}
                      className={`px-10 py-3 rounded-full text-[10px] font-black transition-all uppercase tracking-[0.4em] ${activeTab === tab ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       {tab}
                     </button>
                   ))}
               </div>

               <div className="p-14 min-h-[500px]">
                 {activeTab === 'text' && (
                    <div className="space-y-12">
                       <div className="bg-brand-50 p-10 rounded-[3.5rem] border-2 border-brand-100 relative group">
                          <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                             <LucideTarget size={14}/> Performance Caption
                          </h4>
                          <p className="text-slate-900 font-black text-2xl leading-relaxed italic">"{generatedContent.caption_long}"</p>
                       </div>
                    </div>
                 )}

                 {activeTab === 'strategy' && (
                    <div className="space-y-10">
                       <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><LucideZap size={150} /></div>
                          <div className="space-y-6 relative z-10">
                             <h4 className="text-brand-gold font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-2">
                                <LucideShieldCheck size={14} /> Algorithmic Reasoning
                             </h4>
                             <p className="text-slate-300 font-bold text-lg leading-relaxed italic">"{generatedContent.reasoning}"</p>
                             <div className="pt-8 border-t border-white/5 flex items-center gap-8">
                                <div>
                                   <div className="text-3xl font-black text-white">{generatedContent.confidence_score}%</div>
                                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confidence Score</div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex-1">
                                   <p className="text-[8px] font-black uppercase text-brand-gold mb-1">Council Feedback</p>
                                   <p className="text-xs text-slate-400 font-medium italic">"{generatedContent.performance_tips}"</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 sticky top-10 space-y-10">
            <div className="bg-slate-900 rounded-[4rem] p-10 text-white shadow-3xl border border-white/10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-8 flex items-center gap-2"><LucideSmartphone size={16}/> Preview Node</h4>
               <div className="mx-auto w-full max-w-[320px] bg-white rounded-[3.5rem] overflow-hidden text-slate-900 shadow-2xl min-h-[500px] flex flex-col border-[10px] border-slate-800">
                  <div className="p-5 flex items-center gap-3 border-b"><div className="w-10 h-10 bg-gradient-to-tr from-brand-gold to-brand-500 rounded-full"></div><div className="text-xs font-black uppercase tracking-widest">{profile.name}</div></div>
                  <div className="p-6 flex-1">
                     <p className="text-[13px] leading-relaxed italic line-clamp-10">"{generatedContent.caption_long}"</p>
                  </div>
               </div>
               <button className="w-full mt-10 bg-brand-gold text-white py-7 rounded-[2.5rem] font-black text-xl shadow-3xl flex items-center justify-center gap-5 transition-all hover:bg-orange-600">
                  <LucideGlobe size={24} /> DEPLOY TO CLOUD
               </button>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-start gap-4 group">
               <LucideInfo className="text-brand-500 shrink-0 mt-1" size={20} />
               <div className="space-y-1">
                  <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Brand Safety Notice</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">"Council rules: If Confidence Score is below 70%, human review is MANDATORY before deployment."</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
