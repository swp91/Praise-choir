import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'nwgicchwkxbrbeoqzcyw.supabase.co' },
    ],
  },
};

export default nextConfig;
