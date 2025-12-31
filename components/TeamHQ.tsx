
import React, { useState, useEffect } from 'react';
import { User, TeamMember, ActivityLog } from '../types';
import { dataService } from '../services/dataService';
import { LucideNetwork, LucidePlus, LucideUserPlus, LucideShieldCheck, LucideActivity, LucideClock, LucideMail, LucideMoreHorizontal, LucideLoader2 } from 'lucide-react';

interface TeamHQProps {
  user: User;
  onUserUpdate: (u: User) => void;
}

export const TeamHQ: React.FC<TeamHQProps> = ({ user, onUserUpdate }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'Creator' as any });

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getActivityLog();
      setLogs(data.reverse());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email) return;
    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: inviteData.name,
      email: inviteData.email,
      role: inviteData.role,
      status: 'pending'
    };
    const updatedUser = {
      ...user,
      workspaceMembers: [...(user.workspaceMembers || []), newMember]
    };
    await dataService.updateUser(updatedUser);
    await dataService.logActivity("Owner", `Invited ${inviteData.email} as ${inviteData.role}`);
    onUserUpdate(updatedUser);
    setInviteData({ name: '', email: '', role: 'Creator' });
    setIsInviteOpen(false);
    fetchLogs();
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-500 tracking-tight flex items-center gap-4">
            Workspace Team <LucideNetwork size={32} />
          </h1>
          <p className="text-slate-500 font-medium">Managing collaboration and permission hierarchies.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="bg-brand-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-brand-600 transition-all"
        >
          <LucideUserPlus size={20} /> INVITE COLLABORATOR
        </button>
      </header>

      {isInviteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100 animate-fade-in">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Invite to HQ</h3>
              <form onSubmit={handleInvite} className="space-y-5">
                 <input 
                   required placeholder="Full Name"
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold outline-none focus:border-brand-500 transition-all"
                   value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})}
                 />
                 <input 
                   required type="email" placeholder="email@business.com"
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold outline-none focus:border-brand-500 transition-all"
                   value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})}
                 />
                 <select 
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold outline-none focus:border-brand-500 transition-all"
                   value={inviteData.role} onChange={e => setInviteData({...inviteData, role: e.target.value as any})}
                 >
                    <option value="Creator">AI Creator</option>
                    <option value="Analyst">Business Analyst</option>
                    <option value="Owner">Co-Owner</option>
                 </select>
                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-brand-500 text-white py-4 rounded-2xl font-black shadow-xl">SEND INVITE</button>
                    <button type="button" onClick={() => setIsInviteOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">CANCEL</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Active Collaborators</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.workspaceMembers?.length || 0} TOTAL</span>
              </div>
              <div className="divide-y divide-slate-50">
                 {user.workspaceMembers?.map(member => (
                    <div key={member.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                             {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900">{member.name}</h4>
                             <p className="text-xs font-medium text-slate-400 flex items-center gap-2"><LucideMail size={12} /> {member.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                             member.role === 'Owner' ? 'bg-brand-50 text-brand-500 border-brand-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                             {member.role}
                          </div>
                          <button className="p-2 text-slate-300 hover:text-slate-900"><LucideMoreHorizontal size={20} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
              <div className="absolute top-0 right-0 p-10 opacity-5"><LucideActivity size={120} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-8 flex items-center gap-2">
                 <LucideClock size={14} /> Global Workspace Activity
              </h4>
              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-2">
                 {isLoading ? (
                    <div className="flex items-center justify-center py-10"><LucideLoader2 className="animate-spin text-brand-gold" /></div>
                 ) : logs.length === 0 ? (
                    <p className="text-slate-500 italic text-xs text-center py-10">Waiting for first activity...</p>
                 ) : (
                    logs.map(log => (
                       <div key={log.id} className="space-y-2 border-l-2 border-brand-gold/20 pl-4 py-1 animate-fade-in">
                          <div className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{log.user}</div>
                          <p className="text-sm font-medium leading-relaxed">{log.action}</p>
                          <div className="text-[9px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="p-4 bg-brand-50 text-brand-500 rounded-2xl"><LucideShieldCheck size={28} /></div>
              <div>
                 <h4 className="font-black text-slate-900 mb-1 text-sm uppercase">Governance Pro</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">Enterprise instances support full RBAC (Role Based Access Control). Only Owners can delete Campaign data.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
