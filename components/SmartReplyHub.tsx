
import React, { useState } from 'react';
import { SocialProfile, SmartReply } from '../types';
import { generateSmartReplies } from '../services/geminiService';
import { LucideMessageSquareText, LucideLoader2, LucideCopy, LucideCheck, LucideSparkles, LucideInfo } from 'lucide-react';

interface SmartReplyHubProps {
  profile: SocialProfile;
}

export const SmartReplyHub: React.FC<SmartReplyHubProps> = ({ profile }) => {
  const [comment, setComment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replies, setReplies] = useState<SmartReply | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!comment.trim()) return;
    setIsGenerating(true);
    setReplies(null);
    try {
      const result = await generateSmartReplies(profile, comment);
      setReplies(result);
    } catch (e) {
      alert("Error generating replies. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          Smart Reply Assistant <LucideSparkles className="text-brand-500" />
        </h1>
        <p className="text-slate-500">Never get tongue-tied again. Handle every comment with the perfect steeze.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Paste Customer Comment</label>
        <textarea 
          className="w-full h-32 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium resize-none"
          placeholder="e.g. 'How much is this jollof rice? Do you deliver to Lekki?'"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !comment.trim()}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          {isGenerating ? <LucideLoader2 className="animate-spin" /> : <LucideMessageSquareText size={20} />}
          {isGenerating ? 'ANALYSING TONE...' : 'DRAFT WINNING REPLIES'}
        </button>
      </div>

      {replies && (
        <div className="grid grid-cols-1 gap-6 animate-fade-in pb-12">
          {[
            { id: 'prof', title: 'Professional', text: replies.professional, icon: '💼', color: 'bg-blue-50 text-blue-700' },
            { id: 'rel', title: 'Relatable (Vibe)', text: replies.relatable, icon: '🔥', color: 'bg-orange-50 text-orange-700' },
            { id: 'sales', title: 'Sales Closer', text: replies.sales_closer, icon: '💰', color: 'bg-green-50 text-green-700' }
          ].map((type) => (
            <div key={type.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 group relative overflow-hidden">
               <div className="flex justify-between items-center">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${type.color}`}>
                     {type.icon} {type.title}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(type.text, type.id)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    {copiedId === type.id ? <LucideCheck size={18} className="text-green-500" /> : <LucideCopy size={18} />}
                  </button>
               </div>
               <p className="text-slate-800 font-medium leading-relaxed italic">"{type.text}"</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-3xl flex gap-4 items-start border border-blue-100">
         <LucideInfo className="text-blue-500 shrink-0 mt-1" />
         <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide">Brand Strategy Tip</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">Responding to comments within the first 60 minutes signals to the algorithm that your post is worth boosting. Use the 'Sales Closer' reply to drive traffic to your bio link!</p>
         </div>
      </div>
    </div>
  );
};
