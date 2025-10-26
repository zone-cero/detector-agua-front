"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const contactItems = [
    { icon: Mail, text: "arturo.meneses@uthh.edu.mx", href: "mailto:arturo.meneses@uthh.edu.mx" },
    { icon: Phone, text: "+52 (77) 5144 9297", href: "tel:+527751449297" },
    { icon: MapPin, text: "Huejutla de Reyes, Hidalgo, México", href: "#" },
  ]

  const navLinks = [
    { name: "Características", href: "#features" },
    { name: "Herramientas", href: "#tools" },
  ]

  return (
    <footer className="bg-gray-200 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === Zona 1: Logo Principal y Descripción === */}
        <div className="py-12 flex flex-col md:flex-row items-start justify-between gap-8 border-b border-gray-300">
          <div className="flex-shrink-0">
            <Image
              src="/imagenes/logo_gobierno_gold_ef3adc17fb.png"
              alt="Logo del Sistema de Monitoreo"
              width={240}
              height={60}
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md md:text-right">
            Plataforma integral para la cuantificación y el análisis del área de cuerpos de agua y cobertura vegetal, promoviendo la gestión precisa de los recursos naturales.
          </p>
        </div>

        {/* === Zona 2: Columnas de Navegación, Contacto y Respaldo === */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-gray-800 tracking-wider uppercase">Navegación</h3>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold text-gray-800 tracking-wider uppercase">Contacto</h3>
            <ul className="mt-4 space-y-4">
              {contactItems.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="flex items-start group text-sm text-gray-600 transition-colors hover:text-blue-600">
                    <item.icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-gray-500 group-hover:text-blue-500" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5 md:pl-8">
            <h3 className="text-xs font-semibold text-gray-800 tracking-wider uppercase">Respaldo Institucional</h3>
            <div className="mt-4 flex items-center gap-8">
              <a href="#" aria-label="Logo del Gobierno de Hidalgo">
                <Image 
                  src="/imagenes/Logo_gob_hidalgo.svg" 
                  alt="Logo Gobierno de Hidalgo" 
                  width={160} 
                  height={40} 
                  className="object-contain"
                />
              </a>
              <a href="#" aria-label="Escudo del Estado de Hidalgo">
                <Image 
                  src="/imagenes/Escudo_de_Armas_Oficial_del_Estado_de_Hidalgo.png" 
                  alt="Escudo de Hidalgo" 
                  width={60} 
                  height={60} 
                  className="object-contain" 
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* === Zona 3: Barra Inferior de Copyright y Redes Sociales === */}
      <div className="bg-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 text-center sm:text-left">
            © {new Date().getFullYear()} Sistema de Monitoreo de Cuerpos de Agua.
          </span>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}