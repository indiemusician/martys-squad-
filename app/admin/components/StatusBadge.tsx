// app/admin/components/StatusBadge.tsx

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  label: string;
  details?: string;
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    text: 'text-green-400',
    label: 'En ligne',
  },
  offline: {
    color: 'bg-red-500',
    text: 'text-red-400',
    label: 'Hors ligne',
  },
  degraded: {
    color: 'bg-yellow-500',
    text: 'text-yellow-400',
    label: 'Dégradé',
  },
  unknown: {
    color: 'bg-gray-500',
    text: 'text-gray-400',
    label: 'Inconnu',
  },
};

export default function StatusBadge({ status, label, details }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`} />
        <div>
          <p className="font-medium">{label}</p>
          {details && <p className="text-sm text-gray-400">{details}</p>}
        </div>
      </div>
      <span className={`text-sm ${config.text}`}>{config.label}</span>
    </div>
  );
}
