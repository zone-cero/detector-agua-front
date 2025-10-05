"use client"

import Link from "next/link"
import Image from "next/image"
import { Droplets, Mail, Phone, MapIcon, ChevronRight } from "lucide-react"

export function Footer() {
  
  // Lista de Contacto y Detalles
  const contactItems = [
    { icon: Mail, text: "info@aquamonitor.gov", href: "mailto:info@aquamonitor.gov" },
    { icon: Phone, text: "+52 (55) 1234-5678", href: "tel:+525512345678" },
    { icon: MapIcon, text: "Ciudad de México, México", href: "#" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-[#500019] via-[#750025] to-[#A01B40] text-white overflow-hidden">
      
      {/* 🛡️ Elemento decorativo del escudo de fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-end z-0">
        <div className="w-[80vw] max-w-lg h-[50vh] max-h-[300px] relative">
            <Image
                src="/imagenes/escudo_blanco.png"
                alt="Escudo de Monitoreo de Agua"
                fill
                style={{ objectFit: "contain", objectPosition: "bottom" }}
                className="scale-150 transform translate-y-1/4"
            />
        </div>
      </div>

      {/* 💧 Main content */}
      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        
        {/*
          CAMBIO CLAVE: Utilizamos un GRID de dos columnas (md:grid-cols-2) 
          para dividir el logo y el contacto.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Columna Izquierda: Logo y Descripción */}
          <div className="space-y-6">
            <div className="group space-y-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/imagenes/logo_gobierno_gold_ef3adc17fb.png"
                  alt="Logo de Gobierno"
                  width={250}
                  height={60}
                  className="object-contain"
                />
              </div>
              <p className="text-white/80 leading-relaxed text-sm transition-colors duration-300 max-w-md">
                Plataforma integral para el monitoreo y análisis de la calidad del agua en nuestra región, comprometidos 
                con la **transparencia** y el **cuidado del medio ambiente**.
              </p>
            </div>
          </div>
          
          {/* Columna Derecha: Bloque de Contacto (MOVIMIENTO HECHO AQUÍ) */}
          <div className="space-y-4 md:pt-0 pt-4"> {/* md:pt-0 asegura que el contacto se alinee mejor con la descripción en móvil */}
            <h5 className="font-semibold text-xl text-white flex items-center border-l-4 border-[#BC955B] pl-3">
              Contacto
            </h5>
            <div className="space-y-3">
              {contactItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center group hover:translate-x-1 transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
                >
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors duration-300">
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* -------------------- */}
        
        {/* Barra de Copyright y Créditos */}
        <div className="relative mt-16 pt-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <Droplets className="w-3 h-3 text-white/70" />
              </div>
              <p className="text-sm text-white/60">
                &copy; 2025 Sistema de Monitoreo de Cuerpos de Agua. Todos los derechos reservados.
              </p>
            </div>
            
            {/* Créditos */}
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
    </footer>
  )
}