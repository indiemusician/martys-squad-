// app/admin/monitoring/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

interface PeriodStats {
  tokensInput: number;
  tokensOutput: number;
  totalTokens: number;
  cost: number;
  avgResponseTime: number;
  requests: number;
}

interface TokenStats {
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  allTime: PeriodStats;
  daily: Array<{
    date: string;
    tokensInput: number;
    tokensOutput: number;
    cost: number;
    requests: number;
  }>;
  recentResponses: Array<{
    createdAt: string;
    responseTimeMs: number;
    tokensInput: number;
    tokensOutput: number;
    coach: string;
  }>;
}

interface HealthStatus {
  status: string;
  services: {
    database: { status: 'online' | 'offline'; latency: number; name: string };
    redis: { status: 'online' | 'offline' | 'degraded'; latency: number; name: string };
    anthropic: { status: 'online' | 'offline' | 'unknown'; configured: boolean; name: string };
  };
}

export default function MonitoringPage() {
  const [tokens, setTokens] = useState<TokenStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tokensRes, healthRes] = await Promise.all([
        fetch('/api/admin/tokens'),
        fetch('/api/admin/health'),
      ]);
      const tokensData = await tokensRes.json();
      const healthData = await healthRes.json();
      setTokens(tokensData);
      setHealth(healthData);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monitoring</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Statut des services */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">État des services</h3>
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusBadge
              status={health.services.database.status}
              label={health.services.database.name}
              details={`Latence: ${health.services.database.latency}ms`}
            />
            <StatusBadge
              status={health.services.redis.status}
              label={health.services.redis.name}
              details={
                health.services.redis.status === 'degraded'
                  ? 'Mode mock actif'
                  : `Latence: ${health.services.redis.latency}ms`
              }
            />
            <StatusBadge
              status={health.services.anthropic.status}
              label={health.services.anthropic.name}
              details={health.services.anthropic.configured ? 'Configuré' : 'Mode mock'}
            />
          </div>
        )}
      </div>

      {/* Consommation tokens */}
      {tokens && (
        <>
          <h3 className="text-lg font-semibold">Consommation Claude API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Tokens aujourd'hui"
              value={`${(tokens.today.totalTokens / 1000).toFixed(1)}K`}
              subtitle={`${tokens.today.requests} requêtes`}
              icon="📊"
              color="blue"
            />
            <StatCard
              title="Coût aujourd'hui"
              value={`$${tokens.today.cost.toFixed(4)}`}
              icon="💰"
              color="green"
            />
            <StatCard
              title="Temps de réponse moy."
              value={`${tokens.today.avgResponseTime}ms`}
              icon="⚡"
              color="orange"
            />
            <StatCard
              title="Coût total (all time)"
              value={`$${tokens.allTime.cost.toFixed(2)}`}
              subtitle={`${(tokens.allTime.totalTokens / 1_000_000).toFixed(2)}M tokens`}
              icon="💵"
              color="purple"
            />
          </div>

          {/* Tableau 7 derniers jours */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">7 derniers jours</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Requêtes</th>
                  <th className="text-right p-3">Tokens In</th>
                  <th className="text-right p-3">Tokens Out</th>
                  <th className="text-right p-3">Coût</th>
                </tr>
              </thead>
              <tbody>
                {tokens.daily.map((day, i) => (
                  <tr key={day.date} className={i % 2 === 0 ? '' : 'bg-gray-800/50'}>
                    <td className="p-3">{day.date}</td>
                    <td className="text-right p-3 font-mono">{day.requests}</td>
                    <td className="text-right p-3 font-mono">
                      {(day.tokensInput / 1000).toFixed(1)}K
                    </td>
                    <td className="text-right p-3 font-mono">
                      {(day.tokensOutput / 1000).toFixed(1)}K
                    </td>
                    <td className="text-right p-3 font-mono text-green-400">
                      ${day.cost.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dernières réponses */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Dernières réponses</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {tokens.recentResponses.slice(0, 5).map((r, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="capitalize font-medium">{r.coach || 'unknown'}</span>
                    <span className="text-gray-400 text-sm ml-3">
                      {new Date(r.createdAt).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm font-mono">
                    <span className="text-gray-400">
                      {r.tokensInput}↓ / {r.tokensOutput}↑
                    </span>
                    <span className={r.responseTimeMs > 2000 ? 'text-orange-400' : 'text-green-400'}>
                      {r.responseTimeMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
