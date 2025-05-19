import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  webpack: (config) => {
    // Fix for leaflet icons with webpack 5
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  // Explicitly set i18n to undefined to avoid type conflicts
  i18n: undefined,
};

// Use require for next-pwa to avoid type conflicts
const withPWAConfig = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// Export the final config
module.exports = withPWAConfig(nextConfig);