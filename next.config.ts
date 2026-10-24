import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV !== "development"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  allowedDevOrigins: [
    "https://kitchen-amy-equality-uploaded.trycloudflare.com",
    "https://cinema-remindful-boxer.ngrok-free.dev",
  ],
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
