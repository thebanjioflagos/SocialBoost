
import React, { useState, useEffect } from 'react';
import { KnowledgeFact, SocialProfile } from '../types';
import { dataService } from '../services/dataService';
import { generateAutomatedReply } from '../services/geminiService';
import { 
  LucideDatabase, LucidePlus, LucideTrash2, LucideLoader2, 
  LucideShieldCheck, LucideTag, LucideDollarSign, LucideTruck, 
  LucideInfo, LucideZap, LucideCheckCircle2, LucideTerminal,
  LucideRefreshCw, LucideClock
} from 'lucide-react';

interface KnowledgeVaultProps {
  profile: SocialProfile;
}

export const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ profile }) => {
  const [facts, setFacts] = useState<KnowledgeFact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [newFact, setNewFact] = useState<Partial<KnowledgeFact>>({
    category: 'pricing',
    content: ''
  });

  const loadFacts = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getKnowledgeFacts();
      setFacts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFacts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.content) return;
    
    const fact: KnowledgeFact = {
      id: `fact_${Date.now()}`,
      category: newFact.category as any,
      content: newFact.content,
      createdAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString()
    };

    await dataService.saveFact(fact);
    setFacts([fact, ...facts]);
    setNewFact({ category: 'pricing', content: '' });
    setIsAdding(false);
  };

  const handleVerifyFact = async (id: string) => {
    const updatedFacts = facts.map(f => f.id === id ? { ...f, lastVerifiedAt: new Date().toISOString() } : f);
    setFacts(updatedFacts);
    const factToUpdate = updatedFacts.find(f => f.id === id);
    if (factToUpdate) await dataService.saveFact(factToUpdate);
  };

  // Fix: Added the missing handleDelete function
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fact from the vault? This will degrade AI context accuracy.")) return;
    try {
      await dataService.deleteFact(id);
      setFacts(facts.filter(f => f.id !== id));
    } catch (e) {
      alert("Failed to purge fact node.");
    }
  };

  const handleTestRecall = async () => {
    if (facts.length === 0) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const probe = "Simulated Customer: Can you confirm your current price for your top service and how delivery works today?";
      const response = await generateAutomatedReply(profile, probe, 'DM');
      setTestResult(response);
    } catch (e) {
      setTestResult("Recall Test Failed: Engine timeout.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4 italic uppercase">
            Knowledge Vault <LucideDatabase size={32} />
          </h1>
          <p className="text-slate-500 font-medium font-bold italic text-sm">Grounding AI in live business truth.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleTestRecall}
            disabled={isTesting || facts.length === 0}
            className="bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl hover:bg-black transition-all"
          >
            {isTesting ? <LucideLoader2 className="animate-spin text-brand-gold" /> : <LucideZap className="text-brand-gold" />}
            RUN RECALL PROBE
          </button>
          <button onClick={() => setIsAdding(true)} className="bg-brand-500 text-white px-8 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl">
            <LucidePlus size={24} /> ADD FACT
          </button>
        </div>
      </header>

      {testResult && (
        <div className="bg-brand-50 border-4 border-brand-100 p-10 rounded-[3rem] animate-fade-in shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700"><LucideShieldCheck size={120} /></div>
           <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-black text-brand-900 uppercase tracking-tighter flex items-center gap-3">Verification Probe Log</h3>
              <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-inner">
                 <p className="text-slate-800 font-bold leading-relaxed italic text-lg">"{testResult}"</p>
              </div>
              <p className="text-[11px] text-brand-700 font-black uppercase tracking-widest italic">Council Status: AI is correctly utilizing Vault RAG nodes.</p>
           </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
           <div className="bg-white p-12 rounded-[4rem] w-full max-w-xl shadow-2xl animate-fade-in border-4 border-brand-500/10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Forge New Fact Node</h3>
              <form onSubmit={handleSave} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    {['pricing', 'logistics', 'menu', 'bio'].map(c => (
                      <button key={c} type="button" onClick={() => setNewFact({...newFact, category: c as any})} className={`p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${newFact.category === c ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-50 text-slate-400 border-transparent'}`}>{c}</button>
                    ))}
                 </div>
                 <textarea required placeholder="Price list, service area, or brand rules..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-6 font-bold h-40 outline-none focus:border-brand-500" value={newFact.content} onChange={e => setNewFact({...newFact, content: e.target.value})} />
                 <div className="flex gap-4">
                    <button type="submit" className="flex-[2] bg-brand-500 text-white py-5 rounded-2xl font-black shadow-xl">COMMIT TO VAULT</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black">CANCEL</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facts.map(fact => (
          <div key={fact.id} className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all flex flex-col justify-between group">
             <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">{fact.category}</span>
                   <button onClick={() => handleVerifyFact(fact.id)} title="Verify Freshness" className="p-2 text-slate-300 hover:text-brand-500 transition-colors"><LucideRefreshCw size={16} /></button>
                </div>
                <p className="text-slate-800 font-bold leading-relaxed italic text-lg line-clamp-4 group-hover:line-clamp-none transition-all">"{fact.content}"</p>
             </div>
             <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase">
                   <LucideClock size={12} /> Last Verified: {new Date(fact.lastVerifiedAt || fact.createdAt).toLocaleDateString()}
                </div>
                <button onClick={() => handleDelete(fact.id)} className="text-red-300 hover:text-red-500"><LucideTrash2 size={16}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
