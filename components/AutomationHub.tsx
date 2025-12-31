
import React, { useState, useEffect } from 'react';
import { SocialProfile } from '../types';
import { generateAutomatedReply } from '../services/geminiService';
import { LucideBot, LucideMessageCircle, LucideShieldCheck, LucideLoader2, LucideSparkles, LucideInfo, LucideHistory, LucideToggleLeft, LucideToggleRight } from 'lucide-react';

interface AutomationHubProps {
  profile: SocialProfile;
}

export const AutomationHub: React.FC<AutomationHubProps> = ({ profile }) => {
  const [autoDMs, setAutoDMs] = useState(false);
  const [autoComments, setAutoComments] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [interceptedLog, setInterceptedLog] = useState<{msg: string, reply: string, time: string}[]>([]);

  // Simulation effect to show how it works
  const simulateInbound = async () => {
    setIsSimulating(true);
    const inboundMsg = "Hello! Do you have the red dress in stock? And do you deliver to Abuja?";
    try {
      const reply = await generateAutomatedReply(profile, inboundMsg, 'DM');
      setInterceptedLog(prev => [{
        msg: inboundMsg,
        reply,
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Automation Hub <LucideBot className="text-brand-600" />
          </h1>
          <p className="text-slate-500 font-medium">Your AI agents working 24/7 while you sleep.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-200">
           <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">System Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Toggle Controls */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-brand-300 transition-all group">
              <div className="flex justify-between items-center mb-6">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                   <LucideMessageCircle size={28} />
                 </div>
                 <button onClick={() => setAutoDMs(!autoDMs)}>
                    {autoDMs ? <LucideToggleRight size={48} className="text-brand-600" /> : <LucideToggleLeft size={48} className="text-slate-300" />}
                 </button>
              </div>
              <h3 className="text-xl font-black text-slate-900">Auto-Reply DMs</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Instantly respond to inquiries with prices, delivery info, and brand steeze.</p>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-brand-300 transition-all group">
              <div className="flex justify-between items-center mb-6">
                 <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                   <LucideSparkles size={28} />
                 </div>
                 <button onClick={() => setAutoComments(!autoComments)}>
                    {autoComments ? <LucideToggleRight size={48} className="text-brand-600" /> : <LucideToggleLeft size={48} className="text-slate-300" />}
                 </button>
              </div>
              <h3 className="text-xl font-black text-slate-900">Comment Sentiment Agent</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Automatically likes and replies to comments to boost algorithmic reach.</p>
           </div>

           <button 
             onClick={simulateInbound}
             disabled={isSimulating}
             className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:border-brand-200 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
           >
             {isSimulating ? <LucideLoader2 className="animate-spin" /> : <LucideShieldCheck size={20} />}
             TEST AI RESPONSE LOGIC
           </button>
        </div>

        {/* Live Feed */}
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
           <div className="absolute top-0 right-0 p-8 opacity-5"><LucideHistory size={150} /></div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-6 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span> Automated Traffic Log
           </h4>
           
           <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-2">
              {interceptedLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                   <LucideMessageCircle size={64} />
                   <p className="font-bold italic">Waiting for incoming traffic...</p>
                </div>
              ) : (
                interceptedLog.map((log, i) => (
                  <div key={i} className="space-y-3 animate-fade-in border-l-2 border-brand-500/30 pl-4 py-1">
                     <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Intercepted Inbound</span>
                        <span>{log.time}</span>
                     </div>
                     <p className="text-xs text-slate-300 italic">"{log.msg}"</p>
                     <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20">
                        <p className="text-xs font-bold text-brand-400">AI AGENT SENT:</p>
                        <p className="text-sm mt-1 text-white font-medium leading-relaxed">"{log.reply}"</p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
         <LucideInfo className="text-blue-500 mt-1 shrink-0" />
         <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide">Trust & Safety</h4>
            <p className="text-xs text-blue-700 leading-relaxed mt-1">
              Your AI Agent follows strict brand safety guidelines. It will never share private account information or change bank details unless explicitly configured in your Pro settings.
            </p>
         </div>
      </div>
    </div>
  );
};
