/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sigmaconnect.com.au',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
