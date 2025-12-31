
import React, { useState, useEffect } from 'react';
import { SocialProfile, SmartReply, User } from '../types';
import { dataService } from '../services/dataService';
import { generateSmartReplies, generateAutomatedReply } from '../services/geminiService';
import { 
  LucideBot, LucideMessageCircle, LucideLoader2, LucideSparkles, LucideInfo, 
  LucideHistory, LucideToggleLeft, LucideToggleRight, LucideMessageSquareText, 
  LucideCopy, LucideCheck, LucideZap, LucideShieldCheck, LucideShieldAlert,
  LucideAlertCircle, LucideSend
} from 'lucide-react';

interface EngagementHubProps {
  profile: SocialProfile;
  user: User;
  setUser: (user: User) => void;
}

export const EngagementHub: React.FC<EngagementHubProps> = ({ profile, user, setUser }) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [interceptedLog, setInterceptedLog] = useState<{msg: string, reply: string, time: string, confidence: number, status: 'pending' | 'sent' | 'blocked'}[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [replies, setReplies] = useState<SmartReply | null>(null);

  const settings = user.automationSettings || { autoReplyDMs: false, autoReplyComments: false, preferredLanguage: 'Mixed', safety_threshold: 0.85 };

  const toggleAutomation = async (field: 'autoReplyDMs' | 'autoReplyComments') => {
    setIsUpdating(field);
    try {
      const updatedUser = await dataService.updateAutomation({ [field]: !settings[field] }, user);
      setUser(updatedUser);
    } finally {
      setIsUpdating(null);
    }
  };

  const simulateInbound = async () => {
    const mockMsgs = ["How much for delivery?", "Do you have this in blue?", "Bad service!"];
    const inboundMsg = mockMsgs[Math.floor(Math.random() * mockMsgs.length)];
    const result = await generateSmartReplies(profile, inboundMsg);
    
    const status = result.confidence_score >= settings.safety_threshold ? 'sent' : 'pending';
    
    setInterceptedLog(prev => [{
      msg: inboundMsg,
      reply: result.relatable,
      time: new Date().toLocaleTimeString(),
      confidence: result.confidence_score,
      status
    }, ...prev]);
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4 italic uppercase">
            Interaction Engine <LucideBot size={32} />
          </h1>
          <p className="text-slate-500 font-medium font-bold italic">Human-sounding automation with Council-grade safety gates.</p>
        </div>
        <div className="flex bg-slate-900 text-white px-8 py-4 rounded-[2.5rem] items-center gap-4 shadow-2xl">
           <LucideShieldCheck className="text-brand-gold" size={20} />
           <div className="text-right">
              <div className="text-[9px] font-black uppercase text-slate-400">Safety Gate: {settings.safety_threshold * 100}%</div>
              <div className="text-xs font-black">Autonomy: {settings.autoReplyDMs ? 'ACTIVE' : 'LOCKED'}</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* Review Queue (Council Hardening) */}
           <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                 <h3 className="text-xl font-black uppercase tracking-widest text-brand-gold flex items-center gap-3">
                   <LucideHistory size={20} /> Live Interaction Node
                 </h3>
                 <button onClick={simulateInbound} className="text-[10px] font-black text-brand-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all">
                    <LucideZap size={14}/> SIMULATE INBOUND
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-8 scrollbar-none">
                 {interceptedLog.map((log, i) => (
                    <div key={i} className={`p-8 rounded-[3rem] border-2 transition-all ${log.status === 'pending' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>
                       <div className="flex justify-between items-center mb-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.time} • Confidence: {(log.confidence * 100).toFixed(0)}%</div>
                          <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${log.status === 'sent' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>{log.status}</span>
                       </div>
                       <p className="text-slate-400 font-bold italic mb-4">Customer: "{log.msg}"</p>
                       <div className="bg-white/5 p-6 rounded-2xl border border-white/10 italic font-medium text-white mb-6">"{log.reply}"</div>
                       {log.status === 'pending' && (
                          <div className="flex gap-4">
                             <button className="flex-1 bg-brand-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-600 transition-all"><LucideSend size={14}/> Approve & Dispatch</button>
                             <button className="flex-1 bg-white/10 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Edit Draft</button>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-10">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Autonomous Protocols</h4>
              <div className="space-y-6">
                 {[{ id: 'autoReplyDMs', label: 'DM Sentry', icon: LucideMessageCircle }, { id: 'autoReplyComments', label: 'Comment Agent', icon: LucideZap }].map(node => (
                   <div key={node.id} className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border-2 border-transparent hover:border-brand-100">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white rounded-xl shadow-sm text-brand-500"><node.icon size={20} /></div>
                         <div className="text-sm font-black text-slate-900">{node.label}</div>
                      </div>
                      <button onClick={() => toggleAutomation(node.id as any)}>{settings[node.id] ? <LucideToggleRight size={44} className="text-brand-500" /> : <LucideToggleLeft size={44} className="text-slate-300" />}</button>
                   </div>
                 ))}
              </div>
              <div className="pt-8 border-t border-slate-100 flex items-start gap-4 text-brand-700 bg-brand-50 p-6 rounded-3xl">
                 <LucideAlertCircle className="shrink-0" size={24}/>
                 <p className="text-[11px] font-bold leading-relaxed italic">"HITL Protocol Active: Automated replies with confidence below 85% will wait for your manual approval."</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
