import Link from 'next/link';
import { Building2, Activity, Cpu, ShieldCheck, ArrowRight, Zap, CheckCircle2, BrainCircuit, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans text-slate-300 selection:bg-amber-500/30">

      {/* Noir Background */}
      <div className="fixed inset-0 z-0 bg-[#02040a]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-8 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-slate-700 bg-slate-900 rounded-sm flex items-center justify-center">
            <Shield className="text-slate-400 w-5 h-5" />
          </div>
          <span className="font-bold tracking-[0.3em] text-lg text-white">SENTINEL<span className="text-amber-600">.V4</span></span>
        </div>
        <div className="flex items-center gap-8 text-xs font-mono tracking-widest text-slate-500 uppercase">
          <span className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-700 animate-pulse" />
            System Optimal
          </span>
          <span>Build 9.2.14</span>
          <span className="text-amber-700/50">Restricted Access</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-32 pb-12 flex flex-col items-start text-left max-w-7xl">

        <div className="inline-flex items-center gap-3 px-4 py-2 border-l-2 border-amber-600 bg-amber-900/10 text-amber-500 text-xs font-mono mb-10 tracking-[0.2em] uppercase">
          <span>Protocol Zero Active</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter text-white leading-[0.85] opacity-90">
          SENTINEL<br />
          <span className="text-slate-800 text-stroke-white">COMMAND</span>
        </h1>

        <p className="text-2xl text-slate-500 max-w-2xl mb-16 font-light leading-relaxed border-l border-slate-800 pl-6">
          Advanced city-wide surveillance and autonomous dispatch grid.
          <br />Intelligent emergency response coordination powered by <span className="text-slate-300 font-bold tracking-widest uppercase">Neural Networks</span>.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <Link
            href="/dashboard"
            className="group relative px-12 py-6 bg-white text-black font-bold text-lg overflow-hidden hover:bg-amber-500 transition-colors duration-300 rounded-sm"
          >
            <span className="relative z-10 flex items-center gap-4 tracking-widest uppercase">
              Initialize Interface <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Feature Grid (Industrial style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full border-t border-slate-800 pt-16">

          <div className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition duration-500 group">
            <BrainCircuit className="w-10 h-10 text-slate-600 mb-6 group-hover:text-amber-500 transition-colors" />
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Predictive Justice</h3>
            <p className="text-slate-500 text-sm leading-7">
              Algorithmic crime prediction utilizing historical data points and real-time stress analysis of the populace.
            </p>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition duration-500 group">
            <ShieldCheck className="w-10 h-10 text-slate-600 mb-6 group-hover:text-blue-500 transition-colors" />
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Automated Dispatch</h3>
            <p className="text-slate-500 text-sm leading-7">
              Zero-latency unit deployment. The system identifies optimal response vectors for Fire, Medical, and Riot Control.
            </p>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition duration-500 group">
            <Cpu className="w-10 h-10 text-slate-600 mb-6 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Global Grid</h3>
            <p className="text-slate-500 text-sm leading-7">
              Scalable architecture capable of monitoring multiple metropolises simultaneously via satellite uplink.
            </p>
          </div>

        </div>

        <div className="mt-32 w-full flex justify-between items-end text-[10px] text-slate-700 font-mono tracking-widest uppercase">
          <div>
            SECURE CONNECTION ESTABLISHED<br />
            NODE: GOTHAM-CENTRAL-01
          </div>
          <div className="text-right">
            (C) 2025 SENTINEL SYSTEMS<br />
            MILITARY GRADE ENCRYPTION
          </div>
        </div>

      </main>
    </div>
  );
}
