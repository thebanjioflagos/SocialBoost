
import React, { useState, useEffect } from 'react';
import { Campaign, ScheduledPost, SocialProfile, MediaAsset } from '../types';
import { dataService } from '../services/dataService';
import { generateHighQualityImage, generateVeoVideo, ApiKeyError } from '../services/geminiService';
import { 
  LucideArrowLeft, LucideTarget, LucideActivity, LucideLayoutDashboard, 
  LucideVideo, LucideImage, LucideLoader2, LucideSparkles, LucidePlus, 
  LucideZap, LucideCheckCircle2, LucideDownload, LucidePlay, LucideLayers,
  LucideGlobe, LucideMoreHorizontal, LucideCalendar
} from 'lucide-react';

interface CampaignWarRoomProps {
  profile: SocialProfile;
  campaignId: string;
  onBack: () => void;
}

export const CampaignWarRoom: React.FC<CampaignWarRoomProps> = ({ profile, campaignId, onBack }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isRemixing, setIsRemixing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'scheduling'>('overview');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [c, p, m] = await Promise.all([
          dataService.getCampaignById(campaignId),
          dataService.getPostsByCampaign(campaignId),
          dataService.getAllMedia()
        ]);
        setCampaign(c);
        setPosts(p);
        setMedia(m.slice(0, 12));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [campaignId]);

  const handleRemixToVideo = async (asset: MediaAsset) => {
    setIsRemixing(asset.id);
    try {
      const prompt = `Turn this image of ${asset.prompt} into a high-energy cinematic social media ad for ${profile.name} in Nigeria. Cinematic lighting, professional motion.`;
      // Fix: Correct arguments for generateVeoVideo (prompt, profile, startImageBase64)
      const videoUrl = await generateVeoVideo(prompt, profile, asset.data);
      const videoId = `media_${Date.now()}`;
      await dataService.saveMedia({
        id: videoId, type: 'video', data: videoUrl, prompt, createdAt: new Date().toISOString()
      });
      alert("Asset Remixed! Check the media vault.");
    } catch (e: any) { alert(e.message); }
    finally { setIsRemixing(null); }
  };

  if (isLoading || !campaign) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
        <LucideLoader2 className="animate-spin text-brand-gold" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading War Room Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <LucideArrowLeft size={24} />
          </button>
          <div className="space-y-1">
             <div className="flex items-center gap-3">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">{campaign.name}</h1>
               <span className="px-4 py-1.5 bg-brand-50 text-brand-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-brand-100">Live Strategy</span>
             </div>
             <p className="text-slate-500 font-bold flex items-center gap-2"><LucideTarget size={16} className="text-brand-gold" /> {campaign.objective}</p>
          </div>
        </div>
        <div className="flex bg-slate-900/5 p-1.5 rounded-[1.5rem] border border-slate-100">
           {['overview', 'assets', 'scheduling'].map((t) => (
             <button 
              key={t} onClick={() => setActiveTab(t as any)}
              className={`px-8 py-3 rounded-[1rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-700'}`}
             >
               {t}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Cloud Momentum', val: '72%', icon: LucideActivity, color: 'text-brand-500', bg: 'bg-brand-50' },
                { label: 'Regional Reach', val: '14.2k', icon: LucideGlobe, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Asset Utilization', val: posts.length, icon: LucideLayers, color: 'text-brand-gold', bg: 'bg-orange-50' },
                { label: 'Goal Progress', val: 'Active', icon: LucideTarget, color: 'text-purple-500', bg: 'bg-purple-50' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
                   <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}><s.icon size={28} /></div>
                   <div>
                      <div className="text-2xl font-black text-slate-900">{s.val}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                   </div>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-slate-900 rounded-[4rem] p-14 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-700"><LucideSparkles size={180} /></div>
                 <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-center">
                       <h3 className="text-4xl font-black italic tracking-tighter">Strategic Execution</h3>
                       <LucideZap className="text-brand-gold animate-pulse" size={32} />
                    </div>
                    <div className="space-y-6">
                       <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-2xl">Based on regional search intelligence, this campaign is performing best during peak Lagos commute hours (7:30 AM). Content should lean heavily on "Quality of Life" Pidgin hooks for maximum viral weight.</p>
                       <div className="flex flex-wrap gap-4">
                          {['#LagosLiving', '#PremiumHustle', '#SocialBoostPro'].map(t => <span key={t} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-brand-gold">{t}</span>)}
                       </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex gap-8">
                       <div className="flex-1">
                          <div className="text-4xl font-black text-white">8.4%</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Conversion Edge</div>
                       </div>
                       <div className="flex-1">
                          <div className="text-4xl font-black text-brand-gold">TOP</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Regional Ranking</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-4 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-tight">Active Timeline</h3>
                    <LucideCalendar size={20} className="text-slate-300" />
                 </div>
                 <div className="space-y-6">
                    {posts.length === 0 ? (
                       <p className="text-slate-400 italic text-sm py-10 text-center">No posts scheduled for this war room yet.</p>
                    ) : (
                      posts.slice(0, 4).map(p => (
                        <div key={p.id} className="flex gap-4 group cursor-pointer">
                           <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors"><LucideCheckCircle2 size={18} /></div>
                           <div>
                              <div className="font-black text-xs text-slate-900 uppercase tracking-tight">{p.title}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.platform} • {new Date(p.date).toLocaleDateString()}</div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
                 <button className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all">Add Execution Post</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-12 animate-fade-in">
           <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Asset Forge</h3>
              <div className="flex gap-4">
                 <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3"><LucidePlus size={18} /> New Photo</button>
                 <button className="bg-brand-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3"><LucidePlus size={18} /> New Video</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {media.map(asset => (
                <div key={asset.id} className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-3xl transition-all flex flex-col hover:-translate-y-2">
                   <div className="aspect-square relative overflow-hidden bg-slate-50">
                      {asset.type === 'image' ? (
                        <img src={asset.data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><LucideVideo size={64} /></div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <button className="p-4 bg-white rounded-2xl text-slate-900 shadow-xl hover:scale-110 transition-transform"><LucideDownload size={20} /></button>
                         {asset.type === 'image' && (
                           <button 
                             onClick={() => handleRemixToVideo(asset)}
                             disabled={isRemixing === asset.id}
                             className="p-4 bg-brand-500 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform flex items-center gap-2 font-black text-xs"
                           >
                             {isRemixing === asset.id ? <LucideLoader2 className="animate-spin" size={20} /> : <LucidePlay size={20} />}
                             REMIX
                           </button>
                         )}
                      </div>
                   </div>
                   <div className="p-8 space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                         <span>{asset.type} Forge</span>
                         <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed italic">"{asset.prompt}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
