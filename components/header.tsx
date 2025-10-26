"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// Helper Icon Components
const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setIsScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Main navigation links
  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/historico", label: "Histórico" },
    { href: "/mapa-panel", label: "Panel Mapa" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
          ${isScrolled ? "bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm" : "bg-white"}
          ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* Decorative geometric shape - Left */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" aria-hidden="true">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0 0 L 100 0 L 0 100 Z" fill="currentColor" className="text-gray-500/20" />
          </svg>
        </div>

        {/* Decorative geometric shape - Right */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" aria-hidden="true">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 100 0 L 0 0 L 100 100 Z" fill="currentColor" className="text-gray-500/20" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <Image
                src="/imagenes/Logo_gob_hidalgo.svg"
                alt="Logo Gobierno de Hidalgo"
                width={180}
                height={32}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-md transition-colors hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <IconMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <span className="font-semibold text-gray-800">Menú</span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <IconX className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-grow p-4">
                  <ul className="flex flex-col gap-2">
                    {navLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className="block px-4 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}