
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SystemStatus, LogEntry, DeploymentRecord } from './types';
import { SCRIPTS as INITIAL_SCRIPTS, INITIAL_HEALTH } from './constants';
import { 
  Terminal, Server, ArrowRight, X, ShieldAlert, FileCode, Save, 
  CheckCircle2, Play, Settings2, Activity, Cpu, Database, History, 
  Copy, Zap, HardDrive, ShieldCheck, RefreshCw, BarChart3
} from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.HEALTHY);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<DeploymentRecord[]>([]);
  const [vitals, setVitals] = useState(INITIAL_HEALTH);
  const [chaosMode, setChaosMode] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [scripts, setScripts] = useState(INITIAL_SCRIPTS);
  const [activeModal, setActiveModal] = useState<{ title: string; key: keyof typeof INITIAL_SCRIPTS } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 4 - 2))),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() * 2 - 1)))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = async (message: string, type: LogEntry['type'] = 'info', delay = 0) => {
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const runDeployment = async () => {
    if (status === SystemStatus.DEPLOYING) return;
    setStatus(SystemStatus.DEPLOYING);
    setLogs([]);
    setSecurityAlert(null);
    setVitals(v => ({ ...v, cpu: 55 }));
    
    await addLog("⚡ INITIALIZING ATOMIC DEPLOYMENT", "command");
    await addLog(`+ BUILD_MANIFEST: rel_${Date.now().toString(36).toUpperCase()}`, "info", 300);
    await addLog("→ Creating immutable snapshot of current mount...", "command", 500);
    setVitals(v => ({ ...v, memory: 70 }));

    await addLog("→ Running automated integrity checks...", "info", 700);

    if (chaosMode) {
      await addLog("⚠️ WARNING: Chaos mode detected. Injecting entropy...", "warning", 800);
      setVitals(v => ({ ...v, cpu: 99 }));
      await addLog("✖ ERROR: [PID 1042] Health check failed - SIGABRT", "error", 1000);
      await addLog("↻ RECOVERY: Rolling back symlink to stable snapshot...", "warning", 500);
      
      setStatus(SystemStatus.ROLLING_BACK);
      setSecurityAlert("CRITICAL: DEPLOYMENT CORRUPTION DETECTED");
      
      setHistory(prev => [{
        id: Math.random().toString(),
        version: `v2.0.${prev.length + 101}`,
        timestamp: new Date(),
        status: 'rollback',
        duration: '4.8s'
      }, ...prev]);

      setTimeout(() => {
        setStatus(SystemStatus.UNHEALTHY);
        setVitals(v => ({ ...v, cpu: 20, memory: 45 }));
      }, 1500);
    } else {
      await addLog("✔ Health check: 200 OK", "success", 800);
      await addLog("→ Swapping production traffic to new build...", "command", 400);
      await addLog("✓ DEPLOYMENT COMPLETE: System is green.", "success", 400);
      
      setHistory(prev => [{
        id: Math.random().toString(),
        version: `v2.0.${prev.length + 101}`,
        timestamp: new Date(),
        status: 'success',
        duration: '3.2s'
      }, ...prev]);

      setStatus(SystemStatus.HEALTHY);
      setVitals(v => ({ ...v, cpu: 15, memory: 38 }));
    }
  };

  const genericAction = async (name: string) => {
    setLogs([]);
    const key = name.toUpperCase().replace(/\s/g, '_');
    await addLog(`🚀 TASK_TRIGGER: ${key}`, "command");
    if (dryRun) await addLog("ℹ MODE: DRY_RUN (SIMULATION ONLY)", "warning", 200);
    
    setVitals(v => ({ ...v, cpu: 65 }));
    await addLog(`Executing ${name} procedures...`, "info", 700);
    
    setVitals(v => ({ ...v, cpu: 15 }));
    await addLog(`✔ ${name} process finalized. Status: Success.`, "success", 400);
    setStatus(SystemStatus.HEALTHY);
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 lg:p-8">
      {/* Top Navigation HUD */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 shrink-0 w-full max-w-[1600px] mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col bg-black/40 px-6 py-3 rounded-lg border border-white/10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-white uppercase italic">
              BAMBANG <span className="text-cyan-400">HUTAGALUNG</span>
            </h1>
            <div className="flex items-center space-x-3 text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>Ops Architecture 4.0</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-8 mt-6 md:mt-0">
          {[
            { label: 'CPU LOAD', value: Math.round(vitals.cpu), color: 'from-cyan-500 to-blue-500', icon: Cpu },
            { label: 'MEM UTIL', value: Math.round(vitals.memory), color: 'from-purple-500 to-pink-500', icon: HardDrive }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-end min-w-[120px]">
              <div className="flex items-center space-x-2 mb-1.5">
                <stat.icon className="w-3 h-3 text-white/30" />
                <span className="text-[9px] uppercase text-white/30 font-extrabold tracking-widest">{stat.label}</span>
              </div>
              <div className="flex items-center space-x-3 w-full">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-700 ease-out`} 
                    style={{ width: `${stat.value}%` }} 
                  />
                </div>
                <span className="text-xs font-mono font-bold text-white/80 tabular-nums">{stat.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Control Center */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* The Machine: Terminal (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-0">
          <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border border-white/10 ring-1 ring-white/5">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Production_Shell:/usr/bin/zsh</span>
              </div>
              <button 
                onClick={() => {
                  const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
                  navigator.clipboard.writeText(text);
                }}
                className="group flex items-center space-x-2 text-white/20 hover:text-cyan-400 transition-all duration-300"
              >
                <span className="text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Export</span>
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="terminal-container flex-1 overflow-hidden p-8 font-mono text-[12px] md:text-[14px] leading-relaxed custom-scrollbar bg-[#050505]">
              <div className="scanline" />
              <div className="overflow-y-auto h-full space-y-1.5">
                {logs.length === 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-500 font-bold">λ</span>
                    <span className="text-white/20 animate-pulse">Waiting for system call...</span>
                  </div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex space-x-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-white/10 shrink-0 select-none font-bold text-[10px] pt-0.5">{log.timestamp}</span>
                    <span className={`${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warning' ? 'text-orange-300' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'command' ? 'text-cyan-400 font-bold' : 'text-slate-300'
                    }`}>
                      {log.type === 'command' && <span className="mr-2 opacity-50">λ</span>}
                      {log.message}
                    </span>
                  </div>
                ))}
                {status === SystemStatus.DEPLOYING && (
                  <div className="flex items-center space-x-3 text-cyan-400 animate-pulse pt-2 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="tracking-widest">EXECUTING_BUILD_SWAP...</span>
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 shrink-0">
              <div className="grid grid-cols-3 gap-6">
                <button 
                  onClick={runDeployment}
                  disabled={status === SystemStatus.DEPLOYING}
                  className="group relative h-12 overflow-hidden rounded-lg bg-cyan-600 font-bold uppercase tracking-widest text-[11px] text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Build</span>
                  </span>
                </button>
                <button 
                  onClick={() => setChaosMode(!chaosMode)}
                  className={`group relative h-12 rounded-lg border font-bold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 ${
                    chaosMode 
                    ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{chaosMode ? 'Chaos Active' : 'Inject Error'}</span>
                </button>
                <button 
                  onClick={() => setDryRun(!dryRun)}
                  className={`group relative h-12 rounded-lg border font-bold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 ${
                    dryRun 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{dryRun ? 'Simulation' : 'Dry Run'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Visualizer & Topology (5 cols) */}
        <section className="lg:col-span-5 flex flex-col h-full min-h-0">
          <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border border-white/10 ring-1 ring-white/5">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-white/60">System Topology</span>
              <Activity className="w-4 h-4 text-cyan-500/50" />
            </div>

            <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
              
              {/* Dynamic SVG Topology Map */}
              <div className="relative h-48 mb-8 shrink-0 bg-black/20 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <path d="M 50 100 Q 150 100 250 100" stroke="url(#grad1)" strokeWidth="1" fill="none" className="data-flow" />
                  <path d="M 250 100 Q 350 100 450 100" stroke="url(#grad1)" strokeWidth="1" fill="none" className="data-flow" />
                </svg>

                <div className="flex justify-around items-center w-full max-w-sm px-4">
                  <div className={`flex flex-col items-center group transition-all duration-700 ${status === SystemStatus.ROLLING_BACK ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:border-cyan-500/50 transition-colors">
                      <Database className={`w-6 h-6 ${status === SystemStatus.ROLLING_BACK ? 'text-orange-400' : 'text-white/40'}`} />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Vault</span>
                  </div>

                  <div className="relative">
                    <div className={`w-20 h-20 rounded-2xl bg-white/5 border flex items-center justify-center transition-all duration-700 ${
                      status === SystemStatus.UNHEALTHY ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                      status === SystemStatus.DEPLOYING ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.2)]' :
                      'border-emerald-500/30 bg-emerald-500/5'
                    }`}>
                      <Server className={`w-10 h-10 ${
                        status === SystemStatus.UNHEALTHY ? 'text-red-500' : 
                        status === SystemStatus.DEPLOYING ? 'text-cyan-400' : 
                        'text-emerald-400'
                      }`} />
                    </div>
                    {status === SystemStatus.HEALTHY && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-[#050505]">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                      <Zap className="w-6 h-6 text-white/40" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Edge</span>
                  </div>
                </div>
              </div>

              {/* Advanced History List */}
              <div className="flex-1 bg-black/30 rounded-xl border border-white/5 p-5 mb-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 shrink-0">
                  <div className="flex items-center space-x-2">
                    <History className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[9px] uppercase font-extrabold text-white/60 tracking-widest">Global Event Log</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/20">RETENTION: 24H</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <Activity className="w-8 h-8 mb-2" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">System Idle</span>
                    </div>
                  ) : (
                    history.map(rec => (
                      <div key={rec.id} className="group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`w-1 h-8 rounded-full ${rec.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white/80">{rec.version}</span>
                            <span className="text-[8px] font-mono text-white/30">{rec.timestamp.toLocaleTimeString()} &bull; {rec.duration}</span>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded border tracking-[0.1em] ${
                          rec.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Integrated Control Center */}
              <div className="mt-auto space-y-4 shrink-0">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 ml-1 mb-1">
                        <Activity className="w-3 h-3 text-cyan-500" />
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Automation</span>
                      </div>
                      <button onClick={() => genericAction('Log Rotation')} className="w-full bg-white/5 hover:bg-white/10 text-[9px] py-3 rounded-lg border border-white/5 text-white/60 uppercase font-bold tracking-widest transition-all">Rotate_Logs</button>
                      <button onClick={() => genericAction('Safe Cleanup')} className="w-full bg-white/5 hover:bg-white/10 text-[9px] py-3 rounded-lg border border-white/5 text-white/60 uppercase font-bold tracking-widest transition-all">FS_Purge</button>
                      <button onClick={() => genericAction('Automated Backup')} className="w-full bg-white/5 hover:bg-white/10 text-[9px] py-3 rounded-lg border border-white/5 text-white/60 uppercase font-bold tracking-widest transition-all">Sync_Snapshot</button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 ml-1 mb-1">
                        <Settings2 className="w-3 h-3 text-purple-500" />
                        <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Configuration</span>
                      </div>
                      <button onClick={() => setActiveModal({ title: 'Modify: Log Rotation Logic', key: 'logRotation' })} className="w-full bg-cyan-500/5 hover:bg-cyan-500/10 text-[9px] py-3 rounded-lg border border-cyan-500/10 text-cyan-400/80 uppercase font-bold tracking-widest transition-all">Edit_Policy</button>
                      <button onClick={() => setActiveModal({ title: 'Modify: Purge Criteria', key: 'cleanup' })} className="w-full bg-cyan-500/5 hover:bg-cyan-500/10 text-[9px] py-3 rounded-lg border border-cyan-500/10 text-cyan-400/80 uppercase font-bold tracking-widest transition-all">Edit_Cleanup</button>
                      <button onClick={() => setActiveModal({ title: 'Modify: Backup Strategy', key: 'backup' })} className="w-full bg-cyan-500/5 hover:bg-cyan-500/10 text-[9px] py-3 rounded-lg border border-cyan-500/10 text-cyan-400/80 uppercase font-bold tracking-widest transition-all">Edit_Backup</button>
                    </div>
                 </div>
                 
                 {securityAlert && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center space-x-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em]">{securityAlert}</span>
                  </div>
                 )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Branding Overlay */}
      <footer className="w-full max-w-[1600px] mx-auto flex items-center justify-between mt-6 shrink-0 border-t border-white/5 pt-4">
        <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">
          Automated Infrastructure Simulation &bull; v4.0.2 Stable
        </div>
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2 text-[9px] font-bold text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>CLOUD_SYNC: READY</span>
          </div>
          <div className="flex items-center space-x-2 text-[9px] font-bold text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>NODE_PROD: ONLINE</span>
          </div>
        </div>
      </footer>

      {/* Code Architect Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-8">
          <div className="glass-panel w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10 ring-1 ring-white/10">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white text-sm font-black tracking-widest uppercase">
                    {activeModal.title}
                  </h3>
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Runtime Script Editor v2.1</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setActiveModal(null);
                      addLog(`SYSTEM: ${activeModal.key}.sh recompiled and applied.`, "success");
                    }, 1200);
                  }}
                  className="group relative h-10 px-8 rounded-lg bg-emerald-600 font-bold uppercase tracking-widest text-[10px] text-white shadow-lg transition-all hover:scale-105"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Deploying...' : 'Apply Config'}</span>
                  </span>
                </button>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative bg-black/40 flex-1 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-black/40 border-r border-white/5 flex flex-col items-center pt-10 text-[11px] font-mono text-white/10 pointer-events-none z-10">
                {Array.from({ length: 40 }).map((_, i) => <div key={i} className="leading-7">{i + 1}</div>)}
              </div>
              <textarea 
                className="w-full h-full pl-20 pr-10 py-10 bg-transparent text-cyan-100/70 font-mono text-[14px] leading-7 focus:outline-none resize-none custom-scrollbar"
                value={scripts[activeModal.key]}
                onChange={(e) => setScripts(prev => ({ ...prev, [activeModal.key!]: e.target.value }))}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
