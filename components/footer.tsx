"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const contactItems = [
    { icon: Mail, text: "arturo.meneses@uthh.edu.mx", href: "mailto:arturo.meneses@uthh.edu.mx" },
    { icon: Phone, text: "+52 (77) 5144 9297", href: "tel:+527751449297" },
    { icon: MapPin, text: "Huejutla de Reyes, Hidalgo, México", href: "#" },
  ]

  const navLinks = [
    { name: "Características", href: "#features" },
    { name: "Herramientas", href: "#tools" },
    // Add more links as needed
  ]

  return (
    <footer className="bg-gray-200 border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Top Section: Main content === */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Logo and Description */}
          <div className="lg:col-span-4">
            <Image
              src="/imagenes/logo_gobierno_gold_ef3adc17fb.png"
              alt="Logo de Gobierno"
              width={200}
              height={50}
              className="object-contain"
            />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-xs">
              Plataforma para la cuantificación y análisis de cuerpos de agua y cobertura vegetal.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Navegación
            </h3>
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
          
          {/* Column 3: Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              {contactItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-start group text-sm text-gray-600 transition-colors hover:text-blue-600"
                  >
                    <item.icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" aria-hidden="true" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* === Bottom Bar: Copyright and Institutional Logos === */}
        <div className="py-8 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sistema de Monitoreo de Cuerpos de Agua. Todos los derechos reservados.
          </span>
          <div className="flex items-center gap-6">
            <a href="#" aria-label="Escudo del Estado de Hidalgo">
              <Image 
                src="/imagenes/Escudo_de_Armas_Oficial_del_Estado_de_Hidalgo.png" 
                alt="Escudo de Hidalgo" 
                width={40} 
                height={40} 
                className="object-contain grayscale opacity-70 transition hover:opacity-100 hover:grayscale-0" 
              />
            </a>
            <a href="#" aria-label="Logo del Gobierno de Hidalgo">
              <Image 
                src="/imagenes/Logo_gob_hidalgo.svg" 
                alt="Logo Gobierno de Hidalgo" 
                width={120} 
                height={30} 
                className="object-contain grayscale opacity-70 transition hover:opacity-100 hover:grayscale-0"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}