/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 콘솔 경고 억제
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // 실험적 기능
  experimental: {
    // 불필요한 preload 최적화
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Webpack 설정
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }

    // 개발 모드에서 특정 경고 무시
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase/ },
      { message: /Deprecated API/ },
    ]

    return config
  },
}

module.exports = nextConfig
