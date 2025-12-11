import Link from 'next/link';
import { Building2, Activity, Cpu, Globe, ShieldCheck, Play, ArrowRight, Zap, CheckCircle2, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden font-[Outfit] text-white selection:bg-purple-500/30">

      {/* Background Grid & glows */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,30,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,30,0.9)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="font-bold tracking-widest text-lg">CORTEX<span className="text-purple-400">.AI</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            SYSTEM ONLINE
          </span>
          <span>v2.4.0-RC</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-12 flex flex-col items-center text-center">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          NEURAL NETWORK DEPLOYED LIVE
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
          SENTIENT CITY<br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">OPERATING SYSTEM</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          The world's first autonomous emergency response grid.
          <br />coordinate fire, medical, and police units with <span className="text-white font-bold">zero latency</span> using our advanced neural dispatch engine.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <Link
            href="/dashboard"
            className="group relative px-10 py-5 bg-white text-black font-black text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 flex items-center gap-2">
              INITIALIZE SYSTEM <ArrowRight className="w-5 h-5" />
            </span>
          </Link>

          {/* Simulation button removed as requested */}
        </div>

        {/* Feature Grid (Holographic style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl text-left">

          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition border border-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Neural Dispatch</h3>
            <p className="text-gray-400 leading-relaxed">
              Proprietary AI analyzes stress levels, fuel, and traffic patterns to assign the optimal unit in milliseconds.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-cyan-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition border border-cyan-500/20">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute top-8 right-8 text-cyan-500 text-xs font-mono opacity-50">GLOBAL_READY</div>
            <h3 className="text-xl font-bold mb-3 text-white">Dynamic Sectors</h3>
            <p className="text-gray-400 leading-relaxed">
              Infinite scaling. The system auto-spawns task forces in any geohash sector worldwide upon incident detection.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-pink-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition border border-pink-500/20">
              <ShieldCheck className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Civilian Safety</h3>
            <p className="text-gray-400 leading-relaxed">
              Real-time tracking of safety indices. Prioritize human life with our ethically-aligned reinforcement learning model.
            </p>
          </div>

        </div>

        <div className="mt-20 pt-10 border-t border-white/5 w-full flex justify-between items-center text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> SYSTEM INTEGRITY: 100%</div>
          <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500" /> ENCRYPTED CONNECTION</div>
          <div>(C) 2025 CORTEX SYSTEMS</div>
        </div>

      </main>
    </div>
  );
}
