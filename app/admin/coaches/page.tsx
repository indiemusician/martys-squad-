// app/admin/coaches/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface CoachData {
  name: string;
  color: string;
  conversations: {
    allTime: number;
    week: number;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  avgResponseTime: number;
  messages: number;
}

interface CoachStats {
  coaches: CoachData[];
  handoffs: {
    total: number;
    breakdown: Array<{ to: string; count: number }>;
  };
}

const coachEmojis: Record<string, string> = {
  marty: '🎸',
  luke: '🧘',
  peter: '📱',
  riplay: '🎧',
  april: '📋',
  clarice: '💜',
};

const coachRoles: Record<string, string> = {
  marty: 'Manager & Accueil',
  luke: 'Identité artistique',
  peter: 'Réseaux sociaux',
  riplay: 'Stratégie Spotify',
  april: 'Plan promo 7 semaines',
  clarice: 'Blocages & Confiance',
};

export default function CoachesPage() {
  const [stats, setStats] = useState<CoachStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/coaches')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return <p className="text-red-400">Erreur de chargement</p>;

  const sortedCoaches = [...stats.coaches].sort(
    (a, b) => b.conversations.allTime - a.conversations.allTime
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Coaches</h2>

      {/* Tableau des coaches */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left p-4">Coach</th>
              <th className="text-right p-4">Conv. totales</th>
              <th className="text-right p-4">Cette semaine</th>
              <th className="text-right p-4">Messages</th>
              <th className="text-right p-4">Tokens</th>
              <th className="text-right p-4">Coût</th>
              <th className="text-right p-4">Temps moy.</th>
            </tr>
          </thead>
          <tbody>
            {sortedCoaches.map((coach, index) => (
              <tr
                key={coach.name}
                className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{coachEmojis[coach.name]}</span>
                    <div>
                      <p className="font-semibold capitalize">{coach.name}</p>
                      <p className="text-sm text-gray-400">{coachRoles[coach.name]}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right p-4 font-mono">
                  {coach.conversations.allTime.toLocaleString()}
                </td>
                <td className="text-right p-4 font-mono">
                  {coach.conversations.week.toLocaleString()}
                </td>
                <td className="text-right p-4 font-mono">
                  {coach.messages.toLocaleString()}
                </td>
                <td className="text-right p-4 font-mono text-sm">
                  {(coach.tokens.total / 1000).toFixed(1)}K
                </td>
                <td className="text-right p-4 font-mono text-green-400">
                  ${coach.cost.toFixed(4)}
                </td>
                <td className="text-right p-4 font-mono">
                  {coach.avgResponseTime}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Handoffs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">
            🔀 Handoffs depuis Marty
          </h3>
          <p className="text-3xl font-bold text-blue-400 mb-4">
            {stats.handoffs.total}
          </p>
          <div className="space-y-2">
            {stats.handoffs.breakdown.map((h) => (
              <div key={h.to} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span>{coachEmojis[h.to]}</span>
                  <span className="capitalize">{h.to}</span>
                </span>
                <span className="font-mono">{h.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Répartition</h3>
          <div className="space-y-3">
            {sortedCoaches.map((coach) => {
              const total = stats.coaches.reduce((s, c) => s + c.conversations.allTime, 0);
              const pct = total > 0 ? (coach.conversations.allTime / total) * 100 : 0;
              return (
                <div key={coach.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{coach.name}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: coach.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
