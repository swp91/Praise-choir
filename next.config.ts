import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'nwgicchwkxbrbeoqzcyw.supabase.co' },
    ],
  },
};

export default nextConfig;
