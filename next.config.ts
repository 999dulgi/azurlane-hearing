import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/azurlane-hearing",
  output: "export",
  /* config options here */
  images: {
    remotePatterns: [new URL('https://raw.githubusercontent.com/Fernando2603/AzurLane/main/images/**')],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ships",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
