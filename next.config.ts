import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'nwgicchwkxbrbeoqzcyw.supabase.co' },
    ],
  },
};

export default nextConfig;
