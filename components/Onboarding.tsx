
import React, { useState } from 'react';
import { SocialProfile, AccountType } from '../types';
import { 
  LucideCheckCircle, LucideArrowRight, LucideBuilding2, LucideUser, 
  LucideMegaphone, LucideSparkles, LucideMapPin, LucideBriefcase,
  LucideMic2, LucideDollarSign, LucideZap, LucideGlobe, LucideMessageCircle,
  LucideShieldCheck, LucideArrowLeft, LucideShieldAlert
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: SocialProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SocialProfile>>({
    account_type: 'business',
    location: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
    focus_area: 'Restaurant',
    tone: 'Street-smart & relatable',
    pricing_logic: 'dm',
    automation_level: 'assist',
    growth_platforms: ['Instagram'],
    post_frequency: 'daily'
  });

  const handleChange = (field: keyof SocialProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    const current = formData.growth_platforms || [];
    if (current.includes(platform)) {
      handleChange('growth_platforms', current.filter(p => p !== platform));
    } else {
      handleChange('growth_platforms', [...current, platform]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      const finalProfile: SocialProfile = {
        profile_id: `profile_${Date.now()}`,
        account_type: formData.account_type as AccountType,
        name: formData.name || "User",
        focus_area: formData.focus_area || "General",
        target_audience: formData.target_audience || "General Audience",
        location: formData.location!,
        tone: formData.tone || "Friendly & conversational",
        forbidden_tones: formData.forbidden_tones || [],
        main_objective: formData.main_objective || "Growth and sales",
        pricing_logic: formData.pricing_logic,
        delivery_details: formData.delivery_details,
        automation_level: formData.automation_level,
        growth_platforms: formData.growth_platforms,
        post_frequency: formData.post_frequency,
        branding: { colors: [] }
      };
      onComplete(finalProfile);
    }
  };

  const isBusiness = formData.account_type === 'business';

  return (
    <div className="min-h-screen bg-brand-slate flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-500/10">
        <div 
          className="h-full bg-brand-gold transition-all duration-700 ease-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white max-w-2xl w-full rounded-[4rem] shadow-2xl p-10 md:p-14 border border-slate-100 relative">
        <header className="text-center mb-12">
          <div className="bg-brand-500 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
            <LucideSparkles className="text-brand-gold" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Strategy <span className="text-brand-gold">Onboarding</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-[0.2em]">SocialBoost Intelligence Initialization</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {step === 0 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <LucideShieldCheck className="text-brand-gold" /> Identity Cluster
                </h2>
                <p className="text-slate-500 font-medium italic">Define your core account architecture.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  type="button"
                  onClick={() => handleChange('account_type', 'business')}
                  className={`p-8 border-4 rounded-[2.5rem] text-left transition-all ${isBusiness ? 'border-brand-500 bg-brand-50' : 'border-slate-50 bg-slate-50 opacity-60 grayscale hover:grayscale-0'}`}
                >
                  <LucideBuilding2 className={`mb-4 ${isBusiness ? 'text-brand-500' : 'text-slate-400'}`} size={32} />
                  <div className="font-black text-slate-900 uppercase text-xs tracking-widest">Small Business</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Selling products or services via commerce.</div>
                </button>
                <button 
                  type="button"
                  onClick={() => handleChange('account_type', 'individual')}
                  className={`p-8 border-4 rounded-[2.5rem] text-left transition-all ${!isBusiness ? 'border-brand-500 bg-brand-50' : 'border-slate-50 bg-slate-50 opacity-60 grayscale hover:grayscale-0'}`}
                >
                  <LucideUser className={`mb-4 ${!isBusiness ? 'text-brand-500' : 'text-slate-400'}`} size={32} />
                  <div className="font-black text-slate-900 uppercase text-xs tracking-widest">Creator / Personal</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Lifestyle, personal brand, or community growth.</div>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <LucideGlobe className="text-brand-gold" /> Brand Snapshot
                </h2>
                <p className="text-slate-500 font-medium italic">Basic details to initialize the Intelligence Engine.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Media Handle / Name</label>
                  <input required type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" placeholder="e.g. MamaTunde Jollof" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Focus / Niche</label>
                    <input required type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" placeholder="e.g. Street Food, Fashion" value={formData.focus_area} onChange={(e) => handleChange('focus_area', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Audience</label>
                    <input required type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" placeholder="e.g. Lagos Students" value={formData.target_audience || ''} onChange={(e) => handleChange('target_audience', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <LucideMic2 className="text-brand-gold" /> Personality Forge
                </h2>
                <p className="text-slate-500 font-medium italic">How should I speak to your audience?</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Friendly & conversational',
                  'Professional & clean',
                  'Street-smart & relatable',
                  'Calm & premium',
                  'Energetic & sales-focused'
                ].map(tone => (
                  <button 
                    key={tone} type="button" onClick={() => handleChange('tone', tone)}
                    className={`px-8 py-5 rounded-[1.5rem] border-2 text-left flex items-center justify-between transition-all font-bold text-sm ${formData.tone === tone ? 'bg-brand-500 text-white border-brand-500 shadow-xl' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'}`}
                  >
                    {tone}
                    {formData.tone === tone && <LucideCheckCircle size={18} />}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Any Forbidden Tones? (e.g. Too much slang)</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" placeholder="e.g. sounding pushy, too corporate" onChange={(e) => handleChange('forbidden_tones', [e.target.value])} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <LucideDollarSign className="text-brand-gold" /> Commercial Logic
                </h2>
                <p className="text-slate-500 font-medium italic">Configure how I handle pricing and logistics.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">When customers ask "How much?"</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'direct', label: 'Share Directly', desc: 'Price in comment' },
                      { id: 'ask', label: 'Ask Details', desc: 'Inquiry first' },
                      { id: 'dm', label: 'Send to DM', desc: 'Private closing' }
                    ].map(opt => (
                      <button 
                        key={opt.id} type="button" onClick={() => handleChange('pricing_logic', opt.id)}
                        className={`p-6 rounded-[2rem] border-2 text-center transition-all ${formData.pricing_logic === opt.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-50 text-slate-600 border-transparent'}`}
                      >
                        <div className="font-black text-[10px] uppercase tracking-widest mb-1">{opt.label}</div>
                        <div className="text-[9px] font-bold opacity-60">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Details / Logistics</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" placeholder="e.g. Lagos only, Pickup available, 2-day shipping" value={formData.delivery_details || ''} onChange={(e) => handleChange('delivery_details', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <LucideZap className="text-brand-gold" /> Growth Protocol
                </h2>
                <p className="text-slate-500 font-medium italic">Where and how fast should we grow?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Platforms</label>
                   <div className="flex flex-wrap gap-3">
                      {['Instagram', 'TikTok', 'Facebook', 'WhatsApp', 'X (Twitter)'].map(p => (
                        <button 
                          key={p} type="button" onClick={() => togglePlatform(p)}
                          className={`px-6 py-3 rounded-xl font-bold text-xs transition-all border-2 ${formData.growth_platforms?.includes(p) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-100'}`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posting Frequency</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" value={formData.post_frequency} onChange={(e) => handleChange('post_frequency', e.target.value)}>
                        <option value="daily">Daily Posts</option>
                        <option value="thrice">3-4 times a week</option>
                        <option value="trending">Only when trending</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automation Comfort</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold outline-none focus:border-brand-500 transition-all text-slate-900" value={formData.automation_level} onChange={(e) => handleChange('automation_level', e.target.value)}>
                        <option value="suggest">Suggest Only (I approve)</option>
                        <option value="assist">Assist (AI replies, I review)</option>
                        <option value="handle">Autonomous (Do it for me)</option>
                      </select>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in space-y-10 text-center">
              <div className="space-y-4">
                 <LucideShieldCheck className="mx-auto text-brand-gold" size={64} />
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ready for Launch</h2>
                 <p className="text-slate-400 font-bold leading-relaxed px-10 italic">"SocialBoost will now speaking in your voice, answer customers correctly, and forge high-end assets."</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-left space-y-6 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><LucideZap size={100} /></div>
                 <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-brand-gold">{formData.name?.charAt(0)}</div>
                    <div>
                       <div className="text-xs font-black uppercase tracking-widest text-brand-gold">RAG Identity Confirmed</div>
                       <div className="text-lg font-black">{formData.name}</div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3"><LucideMic2 size={12} className="text-brand-gold" /> {formData.tone}</div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3"><LucideZap size={12} className="text-brand-gold" /> {formData.automation_level} Level</div>
                 </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step > 0 && (
              <button 
                type="button" onClick={() => setStep(step - 1)}
                className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-200"
              >
                <LucideArrowLeft size={18} /> BACK
              </button>
            )}
            <button 
              type="submit"
              className="flex-[2] bg-brand-500 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-600 transition-all transform active:scale-95 group"
            >
              {step === 5 ? "INITIALIZE DASHBOARD" : "CONTINUE"}
              <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-brand-gold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
