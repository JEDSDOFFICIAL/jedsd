/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // SEO optimizations
  
  allowedDevOrigins: ['10.95.23.180'],

  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Enable strict CSP for better security and SEO
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
        ],
      },
      {
        // Cache PDFs and static assets
        source: '/papers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
