import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "true" && {
    output: "export",
    images: { unoptimized: true },
  }),
  ...(process.env.BASE_PATH && {
    basePath: process.env.BASE_PATH,
    assetPrefix: `${process.env.BASE_PATH}/`,
  }),

  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

export default nextConfig;
