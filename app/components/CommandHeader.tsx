'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, Shield, Cpu, Clock, Layers, LogOut } from 'lucide-react';

export default function CommandHeader() {
    const [stats, setStats] = useState({
        active_incidents: 0,
        active_agents: 0,
        total_agents: 0,
        threat_level: 'ANALYZING...'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/stats`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                const data = await response.json();

                // Calculate Threat Level based on ACTIVE incidents
                let level = 'LOW';
                if (data.active_incidents > 5) level = 'CRITICAL';
                else if (data.active_incidents > 2) level = 'ELEVATED';
                else if (data.active_incidents === 0) level = 'SECURE';

                setStats({
                    active_incidents: data.active_incidents,
                    active_agents: data.active_agents || 0,
                    total_agents: data.total_agents || 0,
                    threat_level: level
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => clearInterval(interval);
    }, []);

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/50 animate-pulse';
            case 'ELEVATED': return 'text-orange-400 bg-orange-400/10 border-orange-400/50';
            case 'SECURE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50';
            default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50';
        }
    };

    return (
        <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-8 py-4 fixed top-0 w-full z-[100] shadow-2xl">

            {/* Brand / Title */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-black border border-slate-700/50 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-white font-black text-2xl tracking-[0.25em] font-mono">SENTINEL<span className="text-amber-500">.V4</span></h1>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
                        <span className="text-[10px] text-amber-500/80 font-mono tracking-widest uppercase">NETWORK ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Center Stats - The "Heads Up" Display */}
            <div className="flex gap-12">
                {/* Threat Level Indicator */}
                <div className={`px-8 py-2 rounded-sm border-l-2 font-mono font-bold flex flex-col items-center justify-center bg-black/40 ${getThreatColor(stats.threat_level)}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[10px] opacity-70 tracking-[0.2em] uppercase">Threat Level</span>
                    </div>
                    <span className="text-lg tracking-widest">{stats.threat_level}</span>
                </div>

                {/* Active Events */}
                <div className="flex flex-col items-center justify-center group">
                    <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-3 h-3 text-slate-500 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Events</span>
                    </div>
                    <span className="text-3xl font-black text-slate-200 font-mono leading-none">
                        {stats.active_incidents.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Fleet Status */}
                <div className="flex flex-col items-center justify-center group">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Units Available</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-200 font-mono leading-none">
                            {Math.max(0, stats.total_agents - stats.active_agents)}
                        </span>
                        <span className="text-sm text-slate-600 font-mono">/ {stats.total_agents}</span>
                    </div>
                </div>
            </div>

            {/* Right - Clock / Util */}
            <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-white">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-2xl font-bold font-mono tracking-widest text-slate-300">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={async () => {
                            if (!confirm("⚠️ INITIATE PROTOCOL ZERO: Wipe all system data?")) return;
                            try {
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                await fetch(`${API_URL}/reset`, { method: 'POST' });
                                window.location.reload();
                            } catch (e) { alert("Protocol Failed: " + e); }
                        }}
                        className="p-2 hover:bg-red-900/40 rounded-sm transition-colors group mr-2 border border-transparent hover:border-red-900"
                        title="Hard Reset System"
                    >
                        <Layers className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition-colors" />
                    </button>
                    <Link href="/" className="p-2 hover:bg-slate-800 rounded-sm transition-colors group" title="Disconnect System">
                        <LogOut className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                    </Link>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-1 flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-pulse shadow-[0_0_5px_#059669]"></span>
                    SECURE • {Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                </div>
            </div>

        </div>
    );
}
