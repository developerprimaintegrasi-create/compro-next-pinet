import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sequelize', 'mysql2', 'pg-hstore'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use Turbopack config instead of webpack (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
