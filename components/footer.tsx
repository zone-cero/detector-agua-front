"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Droplets, Mail, Phone, MapIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-[#dbcaa3] py-8 md:py-12">
    {/* <footer className="relative bg-[#730621] text-white border-t border-[#8D1330] py-8 md:py-12"> */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
        <Image
          src="/imagenes/escudo_blanco.png"
          alt="Escudo de Monitoreo de Agua"
          width={192} 
          height={192}
          className="w-32 h-32 md:w-48 md:h-48 object-contain"
        />
      </div>
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sección principal */}
          <div data-aos="fade-up">
            <div className="flex items-center space-x-2 mb-4">
              {/* <div className="w-8 h-8 md:w-10 md:h-10 bg-[#8D1330] rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div> */}
              <span className="font-serif font-bold text-xl md:text-2xl text-gray-700">AquaMonitor</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Plataforma integral para el monitoreo y análisis de la calidad del agua en nuestra región.
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-2 text-white" />
                <span>info@aquamonitor.gov</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-2 text-white" />
                <span>+52 (55) 1234-5678</span>
              </div>
              <div className="flex items-center">
                <MapIcon className="w-3 h-3 mr-2 text-white" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>

          {/* Secciones, Recursos y Legal */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h5 className="font-semibold text-base mb-4 text-gray-700">Secciones</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/historico" className="hover:text-white transition-colors">Histórico</Link></li>
              <li><Link href="/prediccion" className="hover:text-white transition-colors">Predicción</Link></li>
              <li><Link href="/analisis" className="hover:text-white transition-colors">Análisis</Link></li>
            </ul>
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <h5 className="font-semibold text-base mb-4 text-gray-700">Recursos</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-white transition-colors">Datos Abiertos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Soporte Técnico</a></li>
            </ul>
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            <h5 className="font-semibold text-base mb-4 text-gray-700">Legal</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-white transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Transparencia</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accesibilidad</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#b49861] mt-8 pt-4 text-center text-sm text-gray-600">
          <p>&copy; 2024 Sistema de Monitoreo de Cuerpos de Agua. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}