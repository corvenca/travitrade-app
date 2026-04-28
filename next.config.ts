import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración recomendada para despliegues en contenedores (como Railway)
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;
