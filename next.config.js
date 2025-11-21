/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode strict React
  reactStrictMode: true,

  // Optimisations de build
  swcMinify: true,

  // Variables d'environnement exposées au client (préfixées par NEXT_PUBLIC_)
  env: {
    // Rien pour l'instant - toutes nos variables sont côté serveur
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },

  // Configuration pour Railway
  output: 'standalone',

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
