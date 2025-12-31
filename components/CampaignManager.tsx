
import React, { useState, useEffect } from 'react';
import { Campaign, SocialProfile } from '../types';
import { dataService } from '../services/dataService';
import { LucideBriefcase, LucidePlus, LucideLoader2, LucideCheckCircle2, LucideClock, LucideTrendingUp, LucideArrowRight, LucideMoreVertical, LucideTarget } from 'lucide-react';

interface CampaignManagerProps {
  profile: SocialProfile;
  onOpenWarRoom: (id: string) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ profile, onOpenWarRoom }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', objective: '' });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getCampaigns();
      setCampaigns(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;
    try {
      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: newCampaign.name,
        objective: newCampaign.objective,
        status: 'active',
        createdAt: new Date().toISOString(),
        postsCount: 0,
        analytics: { reach: 0, conversions: 0 }
      };
      await dataService.saveCampaign(campaign);
      dataService.logActivity("Owner", `Established Campaign: ${campaign.name}`);
      setNewCampaign({ name: '', objective: '' });
      setIsCreating(false);
      fetchCampaigns();
    } catch (e) { alert("Failed to forge campaign."); }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4">
            Campaign Hub <LucideBriefcase size={32} />
          </h1>
          <p className="text-slate-500 font-medium">Orchestrating the {profile.name} marketing war-room.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-brand-500 text-white px-10 py-5 rounded-[2.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-brand-600 transition-all active:scale-95"
        >
          <LucidePlus size={24} /> NEW CAMPAIGN
        </button>
      </header>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
           <div className="bg-white p-12 rounded-[4rem] w-full max-w-xl shadow-2xl border border-white/20 animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-brand-50 text-brand-500 rounded-[1.5rem]"><LucideTarget size={28} /></div>
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">Establish Strategy</h3>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Configure Campaign Node</p>
                </div>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Identity</label>
                    <input 
                      required type="text" placeholder="e.g. Lagos Christmas Megasale"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900"
                      value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Objective</label>
                    <textarea 
                      placeholder="What is the goal? (e.g. Reach 50k potential customers in Abuja)"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 h-28 transition-all text-slate-900"
                      value={newCampaign.objective} onChange={e => setNewCampaign({...newCampaign, objective: e.target.value})}
                    />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-[2] bg-brand-500 text-white py-5 rounded-2xl font-black shadow-2xl hover:bg-brand-600 transition-all">INITIATE FORGE</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black hover:bg-slate-200 transition-all">CANCEL</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <LucideLoader2 className="animate-spin text-brand-gold" size={48} />
              <p className="font-black uppercase tracking-[0.4em] text-[10px]">Syncing cloud campaigns...</p>
           </div>
        ) : campaigns.length === 0 ? (
           <div className="col-span-full py-24 bg-white border-8 border-dashed border-slate-50 rounded-[4rem] text-center space-y-8">
              <LucideBriefcase size={80} className="mx-auto text-slate-100" />
              <div className="space-y-2">
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">No active campaigns found.</p>
                <p className="text-slate-300 font-bold italic">Establish a strategy to start automating your brand growth.</p>
              </div>
              <button onClick={() => setIsCreating(true)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Forge First Campaign</button>
           </div>
        ) : (
          campaigns.map(camp => (
            <div key={camp.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 group hover:shadow-3xl transition-all flex flex-col justify-between hover:-translate-y-2 duration-500">
               <div className="space-y-8">
                  <div className="flex justify-between items-start">
                     <div className="px-5 py-2 bg-brand-50 text-brand-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-brand-100">
                        {camp.status}
                     </div>
                     <LucideMoreVertical className="text-slate-300 cursor-pointer hover:text-slate-900" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-slate-900 group-hover:text-brand-500 transition-colors leading-tight tracking-tighter">{camp.name}</h3>
                    <p className="text-slate-500 font-bold text-sm line-clamp-2 leading-relaxed italic">"{camp.objective}"</p>
                  </div>
               </div>
               
               <div className="mt-12 pt-8 border-t border-slate-50 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1"><LucideClock size={10} /> Date</div>
                        <div className="text-xs font-black text-slate-900">{new Date(camp.createdAt).toLocaleDateString()}</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1"><LucideTrendingUp size={10} /> Assets</div>
                        <div className="text-xs font-black text-slate-900">{camp.postsCount}</div>
                     </div>
                  </div>
                  <button 
                    onClick={() => onOpenWarRoom(camp.id)}
                    className="w-full py-6 bg-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-white flex items-center justify-center gap-3 transition-all shadow-2xl hover:bg-brand-500 active:scale-95"
                  >
                     OPEN WAR ROOM <LucideArrowRight size={16} className="text-brand-gold" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
