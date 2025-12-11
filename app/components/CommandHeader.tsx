'use client'

import { useState, useEffect } from 'react';

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
        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 fixed top-0 w-full z-40">

            {/* Brand / Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
                    🏙️
                </div>
                <div>
                    <h1 className="text-white font-black text-lg tracking-wider">CORTEX CONTROL</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-green-400 font-mono">SYSTEM ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Center Stats - The "Heads Up" Display */}
            <div className="flex gap-8">
                {/* Threat Level Indicator */}
                <div className={`px-6 py-2 rounded-lg border-2 font-mono font-bold flex flex-col items-center ${getThreatColor(stats.threat_level)}`}>
                    <span className="text-[10px] opacity-70 tracking-[0.2em]">THREAT LEVEL</span>
                    <span className="text-xl">{stats.threat_level}</span>
                </div>

                {/* Active Events */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Active Events</span>
                    <span className="text-2xl font-black text-white font-[Outfit]">
                        {stats.active_incidents.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Fleet Status */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Fleet Readiness</span>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-blue-400 font-[Outfit]">{stats.active_agents}</span>
                        <span className="text-sm text-gray-500 font-mono mb-1">/ {stats.total_agents}</span>
                    </div>
                </div>
            </div>

            {/* Right - Clock / Util */}
            <div className="text-right">
                <div className="text-2xl font-mono text-white tracking-widest">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                    SECURE CONNECTION • NYC-01
                </div>
            </div>

        </div>
    );
}
