import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/svm/exact/client": false,
      "@x402/svm": false,
      "@base-org/account": false,
    };
    return config;
  },
};

export default nextConfig;
