import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // ლიმიტის გაზრდა 50 მეგაბაიტამდე
    },
  },
};

export default nextConfig;