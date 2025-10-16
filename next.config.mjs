/** @type {import('next').NextConfig} */
const nextConfig = {
  // AÑADE ESTE BLOQUE
  experimental: {
    // Aumenta el límite del cuerpo de la solicitud a 50MB (o el que necesites)
    // El límite por defecto es 1MB, lo que causa el error.
    serverActions: {
      bodySizeLimit: '50mb', 
    },
  },
  // FIN DEL BLOQUE AÑADIDO
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig