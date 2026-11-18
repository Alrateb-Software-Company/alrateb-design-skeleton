import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets you open the dev server on lvh.me / *.localhost subdomains, like our real apps.
  allowedDevOrigins: ["lvh.me", "*.lvh.me", "localhost", "*.localhost"],
};

export default nextConfig;