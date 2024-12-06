import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable if you want to use React Server Components
    // serverComponents: true,
    // Enable if you want to use Server Actions
    // serverActions: true,
  }
}

export default nextConfig

