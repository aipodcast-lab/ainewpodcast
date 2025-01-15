/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'server',
  eslint: {
    ignoreDuringBuilds: true
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Add handling for undici module
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false // Disable undici in client-side code
    }

    return config
  },
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig
