// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StatCard from './components/StatCard';
import CoachChart from './components/CoachChart';

interface Stats {
  overview: {
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsersToday: number;
    activeUsersWeek: number;
  };
  messages: {
    today: number;
    yesterday: number;
    trend: number;
  };
  coaches: Array<{ name: string; count: number; color: string }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400">Erreur: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vue d&apos;ensemble</h2>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Artistes total"
          value={stats.overview.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Artistes actifs (24h)"
          value={stats.overview.activeUsersToday}
          subtitle={`${stats.overview.activeUsersWeek} cette semaine`}
          icon="🔥"
          color="orange"
        />
        <StatCard
          title="Conversations"
          value={stats.overview.totalConversations}
          icon="💬"
          color="purple"
        />
        <StatCard
          title="Messages aujourd'hui"
          value={stats.messages.today}
          trend={
            stats.messages.trend !== 0
              ? { value: stats.messages.trend, isPositive: stats.messages.trend > 0 }
              : undefined
          }
          icon="📝"
          color="green"
        />
      </div>

      {/* Graphique coaches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoachChart data={stats.coaches} title="Conversations par coach" />

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Résumé</h3>
          <div className="space-y-4 text-gray-300">
            <p>
              <span className="text-gray-500">Total messages:</span>{' '}
              <span className="font-bold">{stats.overview.totalMessages.toLocaleString()}</span>
            </p>
            <p>
              <span className="text-gray-500">Messages hier:</span>{' '}
              {stats.messages.yesterday}
            </p>
            <p>
              <span className="text-gray-500">Coach le plus sollicité:</span>{' '}
              <span className="capitalize font-bold">
                {stats.coaches.sort((a, b) => b.count - a.count)[0]?.name || '-'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
