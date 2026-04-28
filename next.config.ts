import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración recomendada para despliegues en contenedores (como Railway)
  output: "standalone",
};

export default nextConfig;
