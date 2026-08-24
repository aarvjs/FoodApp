import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable disk cache in dev mode to prevent LevelDB compaction lock conflicts
      config.cache = false;
    }
    return config;
  },
};


export default nextConfig;

