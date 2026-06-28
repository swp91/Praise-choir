import type { NextConfig } from "next";

const isAppBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'app';

const nextConfig: NextConfig = {
  ...(isAppBuild ? { output: 'export' } : {}),
  images: {
    unoptimized: isAppBuild,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'nwgicchwkxbrbeoqzcyw.supabase.co' },
    ],
  },
};

export default nextConfig;
