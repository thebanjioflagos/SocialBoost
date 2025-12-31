
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { 
  LucideFingerprint, LucideShieldCheck, LucideKey, 
  LucideMail, LucideArrowRight, LucideBuilding2, 
  LucideLoader2, LucideLock, LucideSmartphone,
  LucidePhone, LucideUser, LucideEye, LucideEyeOff,
  LucideGlobe, LucideServer, LucideShield
} from 'lucide-react';

interface AuthPortalProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<'landing' | 'signup' | 'login'>('landing');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.register({ email, name, password, phoneNumber: phone, method: 'password' });
      onAuthSuccess(user);
    } catch (e: any) {
      setErrorMessage(e.message || "Cloud connection refused. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.login({ email, password, method: 'password' });
      if (user) onAuthSuccess(user);
      else setErrorMessage("Identity mismatch. Check credentials.");
    } catch (e: any) {
      setErrorMessage("Authentication Node Offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-slate flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-500/10">
        <div className={`h-full bg-brand-gold transition-all duration-1000 ${loading ? 'w-full' : 'w-0'}`}></div>
      </div>

      <div className="bg-white max-w-lg w-full rounded-[4rem] shadow-2xl p-10 md:p-14 border border-slate-100 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="bg-brand-500 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/30">
            <LucideShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-brand-500 mb-1 tracking-tighter">SocialBoost <span className="text-brand-gold italic">Pro</span></h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Cloud Identity Node Active</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest text-center animate-shake">
             {errorMessage}
          </div>
        )}

        {step === 'landing' && (
          <div className="space-y-6 animate-fade-in">
            <button 
              onClick={() => setStep('signup')}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-black transition-all group shadow-xl"
            >
              CREATE IDENTITY <LucideArrowRight className="group-hover:translate-x-1 transition-transform text-brand-gold" />
            </button>
            <button 
              onClick={() => setStep('login')}
              className="w-full bg-white border-2 border-slate-100 text-slate-900 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:border-brand-500 transition-all"
            >
              SIGN IN <LucideLock size={20} className="text-brand-gold" />
            </button>
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Biometric Backup</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>
            <button onClick={() => authService.login({method: 'passkey'}).then(u => u && onAuthSuccess(u))} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm hover:bg-slate-100 transition-all">
              <LucideFingerprint size={20} className="text-brand-gold" /> Use Device Passkey
            </button>
          </div>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
            <div className="relative group">
              <LucideUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-gold" size={20} />
              <input required type="text" placeholder="Full Brand Name" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold transition-all text-slate-900" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="relative group">
              <LucideMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-gold" size={20} />
              <input required type="email" placeholder="work@business.com" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold transition-all text-slate-900" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative group">
              <LucideLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-gold" size={20} />
              <input required type={showPassword ? "text" : "password"} placeholder="Secure Password" className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold transition-all text-slate-900" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <LucideEyeOff size={20} /> : <LucideEye size={20} />}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-500 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-brand-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <LucideLoader2 className="animate-spin" /> : <LucideServer size={20} className="text-brand-gold" />}
              PROVISION ACCOUNT
            </button>
            <button type="button" onClick={() => setStep('landing')} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Back</button>
          </form>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <div className="relative group">
              <LucideMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-gold" size={20} />
              <input required type="email" placeholder="Email Address" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold transition-all text-slate-900" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative group">
              <LucideLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-gold" size={20} />
              <input required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold transition-all text-slate-900" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <LucideEyeOff size={20} /> : <LucideEye size={20} />}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <LucideLoader2 className="animate-spin" /> : <LucideShield size={20} className="text-brand-gold" />}
              SECURE LOGIN
            </button>
            <button type="button" onClick={() => setStep('landing')} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Back</button>
          </form>
        )}

        <div className="mt-14 pt-8 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
           <LucideShieldCheck size={14} className="text-brand-gold" /> NIST LEVEL 3 SECURED
        </div>
      </div>
    </div>
  );
};
