import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
      { hostname: "logo.clearbit.com" },
    ],
  },
};

export default nextConfig;
