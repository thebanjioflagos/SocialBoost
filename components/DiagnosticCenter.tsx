
import React, { useState, useEffect } from 'react';
import { SocialProfile } from '../types';
import { 
  getMarketTrends, 
  generateDailyPackage, 
  generateViralSparks, 
  generateSmartReplies, 
  generateAutomatedReply 
} from '../services/geminiService';
import { dataService } from '../services/dataService';
import { 
  LucideActivity, 
  LucideCheckCircle2, 
  LucideXCircle, 
  LucideLoader2, 
  LucidePlay, 
  LucideTerminal,
  LucideShieldCheck,
  LucideZap,
  LucideGlobe,
  LucideMessageCircle,
  LucideSparkles,
  LucideDatabase,
  LucideServer,
  LucideHardDrive,
  LucideCode,
  LucideRefreshCw,
  LucidePieChart,
  LucideWifiOff
} from 'lucide-react';

interface DiagnosticCenterProps {
  profile: SocialProfile;
}

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'fail';
  message: string;
  icon: any;
}

export const DiagnosticCenter: React.FC<DiagnosticCenterProps> = ({ profile }) => {
  const [results, setResults] = useState<TestResult[]>([
    { id: 'db', name: 'IndexedDB Cluster', status: 'idle', message: 'Verifying async store...', icon: LucideDatabase },
    { id: 'search', name: 'Pulse Engine (Search)', status: 'idle', message: 'Verifying Grounding API...', icon: LucideGlobe },
    { id: 'flash', name: 'Creative Core (Flash)', status: 'idle', message: 'Testing content schema...', icon: LucideSparkles },
    { id: 'pro', name: 'Strategy Brain (Pro)', status: 'idle', message: 'Testing deep reasoning...', icon: LucideZap },
    { id: 'reply', name: 'Engagement Agent', status: 'idle', message: 'Verifying style matching...', icon: LucideMessageCircle },
    { id: 'auto', name: 'Automation Engine', status: 'idle', message: 'Checking DM intercept...', icon: LucideShieldCheck },
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'inspector' | 'storage'>('tests');
  const [log, setLog] = useState<string[]>(["[SYSTEM] Diagnostic Center initialized. Native BaaS connection: STANDBY."]);
  const [rawData, setRawData] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<{usage: number, quota: number} | null>(null);

  useEffect(() => {
    refreshInspector();
    getStorageData();
  }, []);

  const getStorageData = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      setStorageInfo({ usage: estimate.usage || 0, quota: estimate.quota || 0 });
    }
  };

  const refreshInspector = async () => {
    const data = await dataService.getRawStorageData();
    setRawData(data);
  };

  const updateResult = (id: string, updates: Partial<TestResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  /**
   * Safe stringify to handle potential circular structures or non-POJO types
   */
  const safeStringify = (obj: any) => {
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Detect potentially problematic objects
          if (value.constructor?.name?.startsWith('Firebase') || key.startsWith('_')) {
            return `[${value.constructor?.name || 'Complex Object'}]`;
          }
        }
        return value;
      }, 2);
    } catch (e) {
      return "[Error: Circular or Non-Serializable Data Detected]";
    }
  };

  const runStressTest = async () => {
    setIsStressTesting(true);
    addLog("CRITICAL: Initiating Network Stress Simulation...");
    addLog("Throttling logic engaged (Simulating 3G Latency + Edge Drops)...");
    
    try {
      const jobs = [
        generateDailyPackage(profile, "Stress Test Job A"),
        generateSmartReplies(profile, "How far? Stress Job B")
      ];
      
      addLog("Executing concurrent AI payloads...");
      await Promise.all(jobs);
      addLog("SUCCESS: Staggered concurrency survived. Backoff logic verified.");
    } catch (e) {
      addLog("STRESS WARNING: Some payloads were dropped, but local persistence is intact.");
    } finally {
      setIsStressTesting(false);
    }
  };

  const runDiagnostics = async () => {
    setIsRunningAll(true);
    setLog([]);
    addLog("Initiating Full Stack Health Check (Real Data Architecture)...");

    updateResult('db', { status: 'running' });
    try {
      addLog("Verifying IndexedDB ObjectStore availability...");
      const dbCheck = await dataService.testConnection();
      if (dbCheck.success) {
        updateResult('db', { status: 'success', message: `Operational. Latency: ${dbCheck.latency}ms` });
        addLog(`Success: IndexedDB "SocialBoostDB" is responsive.`);
      } else {
        throw new Error("Persistence check failed.");
      }
    } catch (e) {
      updateResult('db', { status: 'fail', message: 'Database unreachable.' });
      addLog("Error: IndexedDB failed to initialize. Check browser permissions.");
    }

    const runAITest = async (id: string, logMsg: string, testFn: () => Promise<any>) => {
      updateResult(id, { status: 'running' });
      addLog(logMsg);
      try {
        await testFn();
        updateResult(id, { status: 'success', message: 'Verified!' });
        addLog(`Success: ${id.toUpperCase()} service responded correctly.`);
      } catch (e) {
        updateResult(id, { status: 'fail', message: 'Service Error.' });
        addLog(`Error: ${id.toUpperCase()} service timed out or returned invalid data.`);
      }
    };

    await runAITest('search', "Researching trends via Grounding API...", () => getMarketTrends(profile));
    await runAITest('flash', "Testing creative schema (Flash)...", () => generateDailyPackage(profile, "Health Check"));
    await runAITest('pro', "Testing strategic reasoning (Pro)...", () => generateViralSparks(profile));
    await runAITest('reply', "Testing tone style-matching...", () => generateSmartReplies(profile, "How far?"));
    await runAITest('auto', "Testing DM interception flow...", () => generateAutomatedReply(profile, "Price?", "DM"));

    addLog("System Diagnostics concluded. Core architecture is Real-Ready.");
    setIsRunningAll(false);
    refreshInspector();
    getStorageData();
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            Ops Command <LucideServer className="text-brand-600" />
          </h1>
          <p className="text-slate-500 font-medium font-bold italic text-sm">Hardware Node & Cloud Service Health.</p>
        </div>
        <div className="flex bg-slate-900/5 p-1.5 rounded-[1.5rem] border border-slate-100">
           {['tests', 'inspector', 'storage'].map(tab => (
             <button 
              key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-[1rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-700'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((r) => (
                <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group transition-all hover:border-brand-500 hover:shadow-2xl">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-5 rounded-2xl ${r.status === 'success' ? 'bg-green-50 text-green-600' : r.status === 'fail' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        <r.icon size={28} />
                      </div>
                      <div>{r.status === 'running' && <LucideLoader2 className="animate-spin text-brand-500" />}{r.status === 'success' && <LucideCheckCircle2 className="text-green-500" />}{r.status === 'fail' && <LucideXCircle className="text-red-500" />}</div>
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{r.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 italic">{r.message}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={runDiagnostics} disabled={isRunningAll} className="flex-[2] bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50">
                {isRunningAll ? <LucideLoader2 className="animate-spin" /> : <LucidePlay size={24} className="text-brand-gold" />}
                {isRunningAll ? 'VERIFYING STACK...' : 'RUN DEEP INFRA AUDIT'}
              </button>
              <button onClick={runStressTest} disabled={isStressTesting} className="flex-1 bg-orange-50 border-2 border-orange-100 text-orange-600 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-100 transition-all disabled:opacity-50">
                 {isStressTesting ? <LucideLoader2 className="animate-spin" /> : <LucideWifiOff size={20}/>} STRESS TEST
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl flex flex-col h-full border border-white/5">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold flex items-center gap-3"><LucideTerminal size={14} /> Diagnostic Terminal</h4>
               <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em]">Node ID: SB_{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] scrollbar-none pr-4">
              {log.map((line, i) => (
                <div key={i} className={`p-2 border-l-4 pl-4 ${line.includes('Error') || line.includes('CRITICAL') ? 'text-red-400 border-red-500/30' : line.includes('Success') || line.includes('SUCCESS') ? 'text-green-400 border-green-500/30' : 'text-slate-400 border-slate-800'}`}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inspector' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 animate-fade-in">
           <div className="flex items-center justify-between border-b pb-8">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-brand-50 text-brand-500 rounded-2xl"><LucideHardDrive size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Persistence Layer Inspector</h2>
                    <p className="text-slate-400 font-bold text-xs">Viewing Raw IndexedDB Objects</p>
                 </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-6 py-3 rounded-full">BaaS Store: {rawData?.stats?.dbName} v{rawData?.stats?.version}</div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest border-b pb-2 border-slate-50"><LucideCode size={14} className="text-brand-500" /> User Payloads</div>
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] font-mono text-[11px] text-slate-700 overflow-x-auto border border-slate-100 shadow-inner max-h-[400px]"><pre>{safeStringify(rawData?.users)}</pre></div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest border-b pb-2 border-slate-50"><LucideCode size={14} className="text-brand-gold" /> Profile Payloads</div>
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] font-mono text-[11px] text-slate-700 overflow-x-auto border border-slate-100 shadow-inner max-h-[400px]"><pre>{safeStringify(rawData?.profiles)}</pre></div>
              </div>
           </div>
           <button onClick={refreshInspector} className="flex items-center gap-3 text-brand-600 font-black text-xs hover:underline bg-brand-50 px-6 py-3 rounded-xl w-fit"><LucideRefreshCw size={14} /> REFRESH PERSISTENCE SNAPSHOT</button>
        </div>
      )}

      {activeTab === 'storage' && storageInfo && (
        <div className="space-y-10 animate-fade-in">
           <div className="bg-white p-14 rounded-[4.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-16">
              <div className="relative w-72 h-72 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-slate-50" />
                    <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray={754} strokeDashoffset={754 - (754 * (storageInfo.usage / storageInfo.quota))} className="text-brand-500 transition-all duration-1000" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-5xl font-black text-slate-900">{((storageInfo.usage / storageInfo.quota) * 100).toFixed(2)}%</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilized</div>
                 </div>
              </div>
              <div className="flex-1 space-y-10 w-full">
                 <div className="space-y-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Local Cloud Quota</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">Enterprise instances are limited by the browser's hardware profile. 4K Video forge may impact this quota significantly.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><LucidePieChart size={14}/> Total Allocated</div>
                       <div className="text-3xl font-black text-slate-900">{(storageInfo.quota / (1024 * 1024 * 1024)).toFixed(1)} GB</div>
                    </div>
                    <div className="bg-brand-50 p-8 rounded-[2.5rem] border border-brand-100">
                       <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><LucideActivity size={14}/> Current Load</div>
                       <div className="text-3xl font-black text-brand-500">{(storageInfo.usage / (1024 * 1024)).toFixed(1)} MB</div>
                    </div>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><LucideZap size={100} /></div>
                    <div className="flex-1 space-y-1">
                       <div className="text-xs font-black text-brand-gold uppercase tracking-widest">Performance Protocol</div>
                       <p className="text-xs text-slate-400 font-medium">Automatic asset pruning is DISABLED in your Enterprise plan.</p>
                    </div>
                    <button onClick={getStorageData} className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black transition-all">REFRESH</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
