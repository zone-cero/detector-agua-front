"use client"

import Link from "next/link"
import Image from "next/image"
import { Droplets, Mail, Phone, MapIcon, ExternalLink, ChevronRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#500019] via-[#750025] to-[#A01B40] text-white overflow-hidden">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div> */}

      {/* Subtle pattern overlay */}
      {/* <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div> */}

      {/* Main content */}
      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="group">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/imagenes/logo_gobierno_gold_ef3adc17fb.png"
                  alt="Logo de Gobierno"
                  width={200} // Ajusta el tamaño según sea necesario
                  height={50} // Ajusta el tamaño según sea necesario
                  className="object-contain"
                />

              </div>
              <p className="text-white/80 leading-relaxed mb-6 text-sm hover:text-white transition-colors duration-300">
                Plataforma integral para el monitoreo y análisis de la calidad del agua en nuestra región, comprometidos
                con la transparencia y el cuidado del medio ambiente.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-lg text-white/90 mb-4 flex items-center">
                <div className="w-1 h-6 bg-white/60 rounded-full mr-3"></div>
                Contacto
              </h5>
              <div className="space-y-3">
                {[
                  { icon: Mail, text: "info@aquamonitor.gov", href: "mailto:info@aquamonitor.gov" },
                  { icon: Phone, text: "+52 (55) 1234-5678", href: "tel:+525512345678" },
                  { icon: MapIcon, text: "Ciudad de México, México", href: "#" },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center group hover:translate-x-2 transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors duration-300">
                      {item.text}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="font-semibold text-lg text-[#BC955B] flex items-center">
              <div className="w-1 h-6 bg-white/60 rounded-full mr-3"></div>
              Navegación
            </h5>
            <ul className="space-y-3">
              {[
                { name: "Inicio", href: "/" },
                { name: "Histórico", href: "/historico" },
                { name: "Predicción", href: "/prediccion" },
                { name: "Análisis", href: "/analisis" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 hover:translate-x-1"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-semibold text-lg text-[#BC955B] flex items-center">
              <div className="w-1 h-6 bg-white/60 rounded-full mr-3"></div>
              Recursos
            </h5>
            <ul className="space-y-3">
              {[
                { name: "Datos Abiertos", href: "#" },
                { name: "Documentación", href: "#" },
                { name: "API", href: "#" },
                { name: "Soporte Técnico", href: "#" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="group flex items-center text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 hover:translate-x-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-semibold text-lg text-[#BC955B] flex items-center">
              <div className="w-1 h-6 bg-white/60 rounded-full mr-3"></div>
              Legal
            </h5>
            <ul className="space-y-3">
              {[
                { name: "Términos de Uso", href: "#" },
                { name: "Política de Privacidad", href: "#" },
                { name: "Transparencia", href: "#" },
                { name: "Accesibilidad", href: "#" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="group flex items-center text-white/70 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 hover:translate-x-1"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-16 pt-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white/70" />
              </div>
              <p className="text-sm text-white/60">
                &copy; 2025 Sistema de Monitoreo de Cuerpos de Agua. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <span>Hecho con</span>
              <div className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-300">♥</span>
              </div>
              <span>para el medio ambiente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 opacity-15 pointer-events-none">
        <div className="relative group">
          <Image
            src="/imagenes/escudo_blanco.png"
            alt="Escudo de Monitoreo de Agua"
            width={200}
            height={200}
            className="w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 object-contain"
          />
        </div>
      </div>
    </footer>
  )
}
