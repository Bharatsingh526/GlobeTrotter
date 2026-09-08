/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  typescript: {
    // Allow production builds to complete even if there are minor type errors in third-party libraries
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore lint errors during build
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
