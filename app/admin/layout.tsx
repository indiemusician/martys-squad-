// app/admin/layout.tsx
import Link from 'next/link';

export const metadata = {
  title: "Marty's Squad - Admin",
  description: 'Dashboard administrateur',
};

const navItems = [
  { href: '/admin', label: 'Vue d\'ensemble', icon: '📊' },
  { href: '/admin/coaches', label: 'Coaches', icon: '👥' },
  { href: '/admin/monitoring', label: 'Monitoring', icon: '🔧' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            🎸 Marty&apos;s Squad <span className="text-gray-400 font-normal">Admin</span>
          </h1>
          <a
            href="/chat"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Retour au chat
          </a>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
