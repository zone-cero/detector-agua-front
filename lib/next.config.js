// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de rewrites para redirigir la llamada al backend real
  async rewrites() {
    return [
      {
        // Esta es la ruta que se llama desde React: /api/backend/images/upload-multiple/
        source: '/api/backend/:path*', 
        // Next.js lo redirige internamente a la API de Django:
        destination: 'http://72.60.127.75/api/monitoring/:path*',
      },
    ];
  },
};

module.exports = nextConfig;