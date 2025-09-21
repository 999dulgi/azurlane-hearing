import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/**')],
  },
};

export default nextConfig;
