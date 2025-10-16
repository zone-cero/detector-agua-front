"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setIsScrolled(currentScrollY > 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      <header
        className={`w-full fixed top-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
        ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
        : "bg-white"
        } ${isVisible ? "transform translate-y-0" : "transform -translate-y-full"}`}
      >
        <div className="bg-white border-b border-gray-50">
          <div className="container mx-auto px-33 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-4 group transition-all duration-500 hover:scale-105">
                <div className="relative">
                  <Image
                    src="/imagenes/Logo_gob_hidalgo.svg"
                    alt="Logo"
                    width={300}
                    height={50}
                    className="transition-all duration-500"
                  />
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/historico", label: "Histórico" },
                  { href: "/prediccion", label: "Predicción" },
                  { href: "/analisis", label: "Análisis" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-red-800 hover:text-white hover:bg-red-800 font-medium px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-red-800 hover:text-white hover:bg-red-800 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-red-800">Menú</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="text-red-800 hover:text-white hover:bg-red-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <nav className="p-6">
              <div className="space-y-4">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/historico", label: "Histórico" },
                  { href: "/prediccion", label: "Predicción" },
                  { href: "/analisis", label: "Análisis" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="block text-red-800 hover:text-white hover:bg-red-800 font-medium px-4 py-3 rounded-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Contacto</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
