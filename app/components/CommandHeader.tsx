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
                const response = await fetch(`${API_URL}/stats`);
                const data = await response.json();

                // Calculate Threat Level
                let level = 'LOW';
                if (data.active_incidents > 5) level = 'CRITICAL';
                else if (data.active_incidents > 2) level = 'ELEVATED';

                setStats({
                    active_incidents: data.active_incidents,
                    active_agents: data.active_agents || 0,
                    total_agents: data.total_agents || 0,
                    threat_level: level
                });
            } catch (error) { }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => clearInterval(interval);
    }, []);

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/50 animate-pulse';
            case 'ELEVATED': return 'text-orange-400 bg-orange-400/10 border-orange-400/50';
            default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50';
        }
    };

    return (
        <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-8 py-4 fixed top-0 w-full z-[100] shadow-2xl">

            {/* Brand / Title */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-xl tracking-[0.2em]">CORTEX<span className="text-blue-500">.OS</span></h1>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-mono tracking-wider">SYSTEM ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Center Stats - The "Heads Up" Display */}
            <div className="flex gap-12">
                {/* Threat Level Indicator */}
                <div className={`px-8 py-2 rounded-lg border-l-4 font-mono font-bold flex flex-col items-center justify-center bg-slate-900/50 ${getThreatColor(stats.threat_level)}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[10px] opacity-70 tracking-[0.2em]">THREAT LEVEL</span>
                    </div>
                    <span className="text-lg">{stats.threat_level}</span>
                </div>

                {/* Active Events */}
                <div className="flex flex-col items-center justify-center group">
                    <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Active Events</span>
                    </div>
                    <span className="text-3xl font-black text-white font-[Outfit] leading-none">
                        {stats.active_incidents.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Fleet Status */}
                <div className="flex flex-col items-center justify-center group">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Fleet Readiness</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-blue-400 font-[Outfit] leading-none">{stats.active_agents}</span>
                        <span className="text-sm text-gray-600 font-mono">/ {stats.total_agents}</span>
                    </div>
                </div>
            </div>

            {/* Right - Clock / Util */}
            <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-white">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-2xl font-light font-mono tracking-widest">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors group" title="Disconnect System">
                        <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
                    </Link>
                </div>
                <div className="text-[10px] text-gray-600 font-mono mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    SECURE CONNECTION • NYC-01
                </div>
            </div>

        </div>
    );
}
