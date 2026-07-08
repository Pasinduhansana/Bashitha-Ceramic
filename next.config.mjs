/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ["pg", "pg-pool", "pg-native"],
};

export default nextConfig;
