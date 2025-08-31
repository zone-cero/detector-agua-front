"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={`w-full fixed bg-transparent border-b border-gray-200 backdrop-blur-sm top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 shadow-sm" : ""}`}
      >
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          {/* Agrega la clase mr-auto aquí para empujar el logo a la derecha */}
          <Link href="/" className="flex items-center space-x-3 " data-aos="fade-right">
            <Image
              src="/imagenes/logo-colorido-hgo.jpg"
              alt="Logo de AquaMonitor"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className="font-serif font-black text-lg text-gray-900">Sistema de Monitoreo</h1>
              <p className="text-xs text-gray-600">Cuerpos de Agua</p>
            </div>
          </Link>

          <nav className="hidden md:flex flex-1 justify-end space-x-8" >
            <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/historico" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Histórico
            </Link>
            <Link href="/prediccion" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Predicción
            </Link>
            <Link href="/analisis" className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
              Análisis
            </Link>
          </nav>

          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          {/* Este es un espacio invisible para equilibrar el layout.
        Asegura que el logo y el botón del menú se mantengan en los extremos. */}
          <div className="hidden md:flex w-[200px]"></div>
        </div>
      </header>

      <Sidebar side="right" className="md:hidden">
        <SidebarHeader className="border-b">
          <div className="flex items-center space-x-3 p-2">
            <Image
              src="/imagenes/logo-colorido-hgo.jpg"
              alt="Logo de AquaMonitor"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-medium text-gray-900">Menú</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" className="font-medium">
                  Inicio
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/historico" className="font-medium">
                  Histórico
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/prediccion" className="font-medium">
                  Predicción
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/analisis" className="font-medium">
                  Análisis
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  )
}

export function Header() {
  return (
    <SidebarProvider>
      <HeaderContent />
    </SidebarProvider>
  )
}
