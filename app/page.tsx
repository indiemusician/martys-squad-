import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-white">
          🎸 Marty&apos;s Squad
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Coaching musical multi-agents pour artistes indépendants
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">🎙️ L&apos;équipe</h2>
          <ul className="space-y-2 text-left text-gray-300">
            <li>• <strong className="text-purple-400">Marty</strong> - Manager général (orchestrateur)</li>
            <li>• <strong className="text-purple-400">Luke</strong> - Direction artistique</li>
            <li>• <strong className="text-purple-400">Peter</strong> - Réseaux sociaux</li>
            <li>• <strong className="text-purple-400">Riplay</strong> - Stratégie Spotify</li>
            <li>• <strong className="text-purple-400">April</strong> - Plan promo</li>
            <li>• <strong className="text-purple-400">Clarice</strong> - Déblocages mentaux</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/chat"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
          >
            💬 Discuter avec Marty
          </Link>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-400">
              ✅ Interface de chat fonctionnelle
            </p>
            <p className="text-sm text-gray-400">
              ✅ Powered by Claude 3 Haiku
            </p>
            <p className="text-sm text-gray-400">
              📱 WhatsApp disponible bientôt
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
