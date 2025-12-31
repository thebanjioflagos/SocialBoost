
import React, { useState, useEffect } from 'react';
import { User, SubscriptionPlan, BillingTransaction } from '../types';
import { paymentService } from '../services/paymentService';
import { dataService } from '../services/dataService';
import { 
  LucideCreditCard, LucideShieldCheck, LucideCheckCircle2, 
  LucideArrowLeft, LucideLoader2, LucideGlobe, LucideZap, 
  LucideBuilding2, LucideRocket, LucideCrown, LucideLock,
  LucideHistory, LucideInfo
} from 'lucide-react';

interface SubscriptionNodeProps {
  user: User;
  setUser: (u: User) => void;
  onBack: () => void;
}

export const SubscriptionNode: React.FC<SubscriptionNodeProps> = ({ user, setUser, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'gateway' | 'success'>('selection');
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const plans = [
    { id: 'free', name: 'Starter Node', price: 'N0', desc: 'Basic AI Posting', features: ['5 AI Generations/mo', '1 Linked Account', 'Basic Insights'] },
    { id: 'pro', name: 'Growth Pro', price: 'N15,000', desc: 'SME Scale Engine', features: ['Unlimited AI Assets', '5 Linked Accounts', 'Grounded Research', 'Team Workspace'], popular: true },
    { id: 'enterprise', name: 'Elite Hub', price: 'N75,000', desc: 'The Marketing Beast', features: ['Autonomous Agents', 'Unlimited Accounts', '24/7 Reputation Guard', 'API Access'] }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setIsProcessing(true);
    setPaymentStep('gateway');
    try {
      const ref = await paymentService.initiateSubscription(planId as SubscriptionPlan, user);
      setTransactionRef(ref);
      await new Promise(res => setTimeout(res, 3500));
      const updatedUser = await paymentService.verifyPayment(ref, user);
      
      const tx: BillingTransaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toISOString(),
        plan: planId as SubscriptionPlan,
        amount: plans.find(p => p.id === planId)?.price || 'N0',
        status: 'confirmed',
        reference: ref
      };
      
      const finalUser = await dataService.addBillingTransaction(updatedUser, tx);
      setUser(finalUser);
      setPaymentStep('success');
    } catch (e) {
      alert("Payment Gateway timed out.");
      setPaymentStep('selection');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl">
            <LucideArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-brand-500 tracking-tight">Billing Node</h1>
            <p className="text-slate-500 font-bold italic text-sm">Managing SME cloud resources and regional settlement.</p>
          </div>
        </div>
        <div className="bg-slate-900 px-8 py-4 rounded-[2.5rem] flex items-center gap-4 text-white shadow-2xl border border-white/5">
           <LucideRocket className="text-brand-gold" size={24} />
           <div className="text-right">
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Plan</div>
              <div className="text-sm font-black text-brand-gold uppercase">{user.usage.plan}</div>
           </div>
        </div>
      </header>

      {paymentStep === 'selection' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             {plans.map((plan) => (
              <div key={plan.id} className={`bg-white p-12 rounded-[4.5rem] border-4 transition-all flex flex-col justify-between relative overflow-hidden ${
                user.usage.plan === plan.id ? 'border-brand-500 shadow-2xl scale-105' : plan.popular ? 'border-brand-gold/30 shadow-xl' : 'border-slate-50 shadow-sm'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-brand-gold text-white px-8 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">MARKET CHOICE</div>
                )}
                <div className="space-y-10">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{plan.name}</h3>
                     <p className="text-slate-400 font-bold text-sm italic">"{plan.desc}"</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-6xl font-black text-brand-500 tracking-tighter">{plan.price}</span>
                     <span className="text-slate-400 font-black uppercase text-xs tracking-widest">/mo</span>
                  </div>
                  <ul className="space-y-5">
                     {plan.features.map((f, i) => <li key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm"><LucideCheckCircle2 size={18} className="text-brand-500" /> {f}</li>)}
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full mt-10 py-6 rounded-[2.5rem] font-black text-xl transition-all active:scale-95 ${
                    user.usage.plan === plan.id ? 'bg-brand-50 text-brand-500 border-2 border-brand-100' : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {user.usage.plan === plan.id ? 'CURRENT NODE' : 'SELECT NODE'}
                </button>
              </div>
             ))}
          </div>

          <div className="lg:col-span-4 space-y-10">
             <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-8 border-b pb-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><LucideHistory size={16} /> Settlement Ledger</h4>
                   <LucideInfo className="text-slate-300" size={16} />
                </div>
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-4">
                   {user.usage.billingHistory?.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                         <LucideCreditCard size={64} />
                         <p className="font-black uppercase tracking-widest text-[10px]">No transaction history found.</p>
                      </div>
                   ) : (
                      user.usage.billingHistory?.map(tx => (
                        <div key={tx.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-inner group">
                           <div className="flex justify-between items-start">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</div>
                              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-100">{tx.status}</div>
                           </div>
                           <div className="flex justify-between items-baseline">
                              <div className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{tx.plan} Upgrade</div>
                              <div className="text-lg font-black text-brand-500">{tx.amount}</div>
                           </div>
                           <div className="pt-3 border-t border-slate-100 text-[8px] font-mono text-slate-400 overflow-hidden truncate">REF: {tx.reference}</div>
                        </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {paymentStep === 'gateway' && (
        <div className="bg-slate-900 rounded-[4rem] p-24 text-white text-center space-y-10 animate-fade-in shadow-3xl">
           <LucideLoader2 className="animate-spin text-brand-gold mx-auto" size={80} />
           <h2 className="text-5xl font-black italic tracking-tighter uppercase">Securing Settlement...</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest">Reference: {transactionRef}</p>
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="bg-white rounded-[4rem] p-24 text-center space-y-10 animate-fade-in shadow-2xl border-4 border-brand-500">
           <LucideShieldCheck className="text-brand-500 mx-auto" size={100} />
           <h2 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic">Access Granted</h2>
           <button onClick={onBack} className="bg-brand-500 text-white px-16 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl">ACCESS HQ</button>
        </div>
      )}
    </div>
  );
};
