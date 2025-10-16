"use client"

import Link from "next/link"
import Image from "next/image"
import { Droplets, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const contactItems = [
    { icon: Mail, text: "info@aquamonitor.gov", href: "mailto:info@aquamonitor.gov" },
    { icon: Phone, text: "+52 (55) 1234-5678", href: "tel:+525512345678" },
    { icon: MapPin, text: "Ciudad de México, México", href: "#" },
  ]

  return (
    <footer className="bg-gray-100 text-slate-700 border-t border-slate-200">
      <div className="container mx-auto px-6 py-16 max-w-7xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 items-center">
          {/* Logo y descripción */}
          <div className="space-y-5">
          <Image
              src="/imagenes/logo_gobierno_gold_ef3adc17fb.png"
              alt="Logo de Gobierno"
              width={240}
              height={60}
              className="object-contain"
            />
            <Image src="/imagenes/Logo_gob_hidalgo.svg" alt="Logo de Gobierno" width={240} height={60} className="object-contain" />
            <p className="text-slate-600 leading-relaxed text-[15px] max-w-md">
              Plataforma integral para el monitoreo y análisis de la calidad del agua en nuestra región, comprometidos
              con la transparencia y el cuidado del medio ambiente.
            </p>
          </div>

           {/* Contacto y Escudo */}
          <div className="space-y-5 flex flex-col items-end">
            {/* Escudo */}
            <Image src="/imagenes/escudo_blanco.png" alt="Escudo de Monitoreo de Agua" width={120} height={120} className="object-contain brightness-200 opacity-70" />

            {/* Contacto */}
            <div className="space-y-3 text-right">
              <h3 className="text-slate-900 font-semibold text-lg">Contacto</h3>
              {contactItems.map((item, index) => (
                <a key={index} href={item.href} className="flex items-center group transition-colors duration-200 justify-end">
                  <div className="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-[18px] h-[18px] text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-slate-600 group-hover:text-blue-600 text-[15px] transition-colors">
                    {item.text}
                  </span>
                </a>
              ))}
            </div>

          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 ">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Droplets className="w-4 h-4" />
              <span>© 2025 Sistema de Monitoreo de Cuerpos de Agua</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                Accesibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
