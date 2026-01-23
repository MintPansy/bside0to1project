/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack 설정 추가 (webpack과 충돌 방지)
  turbopack: {},
  // Prisma 클라이언트를 번들에 포함
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
}

module.exports = nextConfig

