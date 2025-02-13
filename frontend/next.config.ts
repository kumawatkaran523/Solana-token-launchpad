import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['gateway.pinata.cloud'], 
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
