/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
