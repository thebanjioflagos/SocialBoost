
import React, { useState, useEffect } from 'react';
import { User, ActivityLog } from '../types';
import { dataService } from '../services/dataService';
import { 
  LucideLayoutDashboard, LucideUsers, LucideActivity, 
  LucideShieldAlert, LucideZap, LucideLoader2, 
  LucideServer, LucideDatabase, LucideTerminal,
  LucideUserCog, LucideTrash2, LucideGlobe, LucideKey,
  LucideFingerprint
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemLoad, setSystemLoad] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [allUsers, allLogs] = await Promise.all([
        dataService.getAllUsers(),
        dataService.getActivityLog()
      ]);
      setUsers(allUsers);
      setLogs(allLogs.reverse().slice(0, 20));
      setSystemLoad(Math.floor(Math.random() * 40) + 10);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleResolveSession = async (userId: string) => {
    if (!confirm("Force terminate this user's active session cluster?")) return;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isLoggedIn = false;
      user.sessions = [];
      await dataService.updateUser(user);
      setUsers(users.map(u => u.id === userId ? user : u));
    }
  };

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><LucideLoader2 className="animate-spin text-brand-500" size={48} /></div>;

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Command Center <LucideTerminal className="text-brand-gold" />
          </h1>
          <p className="text-slate-500 font-medium">Global Infrastructure & Identity Governance Suite.</p>
        </div>
        <div className="flex bg-slate-900 text-white px-8 py-4 rounded-3xl border border-white/10 items-center gap-4 shadow-2xl">
           <LucideServer className="text-brand-gold animate-pulse" size={20} />
           <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Load</div>
              <div className="text-sm font-black">{systemLoad}% Efficiency</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Tenant Management */}
           <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enterprise Tenants</h3>
                 <span className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{users.length} Registered</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="px-10 py-6">User Identity</th>
                          <th className="px-10 py-6">Role</th>
                          <th className="px-10 py-6">Status</th>
                          <th className="px-10 py-6">Method</th>
                          <th className="px-10 py-6">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">{u.displayName.charAt(0)}</div>
                                   <div>
                                      <div className="font-bold text-slate-900 text-sm">{u.displayName}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   u.role === 'Superuser' ? 'bg-brand-50 text-brand-500 border-brand-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>{u.role}</span>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${u.isLoggedIn ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                   <span className="text-[10px] font-bold text-slate-500 uppercase">{u.isLoggedIn ? 'Active' : 'Offline'}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-2 text-slate-400">
                                   {u.authMethod === 'passkey' ? <LucideFingerprint size={14} /> : <LucideKey size={14} />}
                                   <span className="text-[10px] font-black uppercase">{u.authMethod}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex gap-2">
                                   <button title="User Settings" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-500 transition-colors"><LucideUserCog size={18} /></button>
                                   <button 
                                      onClick={() => handleResolveSession(u.id)}
                                      title="Kill Session" 
                                      className="p-3 bg-red-50 rounded-xl text-red-300 hover:text-red-500 transition-colors"
                                   >
                                      <LucideShieldAlert size={18} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="space-y-10">
           {/* Global Health Cluster */}
           <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700"><LucideGlobe size={180} /></div>
              <h3 className="text-xl font-black uppercase tracking-widest text-brand-gold mb-10 flex items-center gap-3">
                 <LucideActivity size={20} /> Cluster Telemetry
              </h3>
              <div className="space-y-8">
                 {[
                   { label: 'Active WebHooks', val: '1,402', icon: LucideZap, color: 'text-brand-gold' },
                   { label: 'DB Connections', val: 'Synced', icon: LucideDatabase, color: 'text-brand-500' },
                   { label: 'Auth Handshakes', val: users.filter(u => u.isLoggedIn).length, icon: LucideFingerprint, color: 'text-blue-400' }
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-white/10 pb-6 last:border-0">
                      <div className="flex items-center gap-4">
                         <div className={`p-4 bg-white/5 rounded-2xl ${s.color}`}><s.icon size={24} /></div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                      </div>
                      <div className="text-2xl font-black">{s.val}</div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Global Event Stream */}
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Event Log</h4>
                 <LucideShieldAlert className="text-red-300" size={18} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-4">
                 {logs.map((log) => (
                    <div key={log.id} className="space-y-2 border-l-2 border-slate-100 pl-6 py-1 group">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-500 transition-colors">{log.user}</div>
                       <p className="text-xs font-bold text-slate-900 leading-relaxed">{log.action}</p>
                       <div className="text-[8px] font-bold text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                 ))}
              </div>
              <button className="mt-8 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all">Clear Stream</button>
           </div>
        </div>
      </div>
    </div>
  );
};
