'use client';
import { useEffect, useState } from 'react';
import { getStats } from '../lib/api';

export default function LiveStats() {
  const [stats, setStats] = useState<{ active_incidents: number, resolved_incidents: number } | null>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
        setTime(new Date().toLocaleTimeString());
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="text-sm">Loading stats...</div>;

  return (
    <div className="bg-green-100 p-2 my-2 rounded text-sm flex gap-4">
      <span>🕒 {time}</span>
      <span>🔥 Active: <b>{stats.active_incidents}</b></span>
      <span>✅ Resolved: <b>{stats.resolved_incidents}</b></span>
    </div>
  );
}
