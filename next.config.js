/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack 설정 추가 (webpack 충돌 해결)
  turbopack: {},
  // Prisma 클라이언트를 번들에 포함
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
  // Turbopack 비활성화 (한글 경로 문제 해결)
  // Next.js 16에서는 --webpack 플래그로 webpack 사용
}

module.exports = nextConfig

