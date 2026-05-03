/** @type {import('next').NextConfig} */
const vite = require('./helpers/vite');

const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Turbopack replaces webpack in Next.js 16
  // Alias react/react-dom to prevent duplicate instances (@suiet/wallet-kit fix)
  turbopack: {
    resolveAlias: {
      'react': './node_modules/react',
      'react-dom': './node_modules/react-dom',
    },
  },
  async rewrites() {
    return [
      {
        source: "/battlemon-api/:path*",
        destination: "https://api.battlemon.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;