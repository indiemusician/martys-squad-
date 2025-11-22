// app/admin/components/CoachChart.tsx
'use client';

interface CoachStat {
  name: string;
  count: number;
  color: string;
}

interface CoachChartProps {
  data: CoachStat[];
  title?: string;
}

const coachEmojis: Record<string, string> = {
  marty: '🎸',
  luke: '🧘',
  peter: '📱',
  riplay: '🎧',
  april: '📋',
  clarice: '💜',
};

export default function CoachChart({ data, title = 'Répartition par coach' }: CoachChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="space-y-4">
        {data.map((coach) => {
          const percentage = total > 0 ? ((coach.count / total) * 100).toFixed(1) : 0;
          const barWidth = maxCount > 0 ? (coach.count / maxCount) * 100 : 0;

          return (
            <div key={coach.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{coachEmojis[coach.name] || '🤖'}</span>
                  <span className="capitalize">{coach.name}</span>
                </span>
                <span className="text-gray-400">
                  {coach.count} ({percentage}%)
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: coach.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-center text-gray-400">
        Total: {total} conversations
      </div>
    </div>
  );
}
