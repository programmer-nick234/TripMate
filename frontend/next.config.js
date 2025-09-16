/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'dist'
}

module.exports = nextConfig
