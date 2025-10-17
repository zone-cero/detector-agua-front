"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from 'next/dynamic'
import { TrendingUp, ArrowRight, Database, ImageIcon, Map, Sparkles } from "lucide-react"

// Component Imports
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HeroImage } from "../components/hero-image"
import PhotoAnalyzer from "@/components/PhotoAnalyzer" 

// 🎯 SOLUCIÓN: Carga dinámica con ssr: false para evitar el error de "window is not defined"
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'),
  {
    ssr: false, 
    loading: () => (
        <div className="w-full h-[600px] flex items-center justify-center text-slate-500 bg-slate-50">
            <Sparkles className="h-6 w-6 mr-2 animate-pulse text-blue-500" /> Cargando mapa geoespacial...
        </div>
    )
  }
)

// --- ENUMS AND TYPES ---

enum DashboardView {
  Map = "map",
  PhotoAnalyzer = "photo_analyzer",
}

type ToolFeature = {
  icon: React.ElementType
  title: string
  description: string
  stats: string[]
  gradient: string
  section: string
  view: DashboardView | null
  accentColor: string
}

// --- CONSTANTES ---

const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const viewVariants = {
  initial: { opacity: 0, scale: 0.98 },
  in: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  out: { opacity: 0, scale: 0.98, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
}

const dashboardOptions: {
  id: DashboardView
  title: string
  description: string
  lucideIcon: React.ElementType 
  imageBaseName: "ubicacion" | "monitor" 
}[] = [
  
  {
    id: DashboardView.PhotoAnalyzer,
    title: "Análisis de Imágenes",
    description: "Procesamiento inteligente con visión por computadora",
    lucideIcon: Sparkles,
    imageBaseName: "monitor",
  },
  {
    id: DashboardView.Map,
    title: "Visualizador Geoespacial",
    description: "Explora datos en tiempo real con mapas interactivos",
    lucideIcon: Map,
    imageBaseName: "ubicacion",
  }
]

const toolsData = [
  {
    title: 'Cuantificación de Agua y Vegetación',
    description: 'Ejecuta la IA para medir el área (m²) y porcentaje de agua y cobertura vegetal en tus imágenes.',
    section: 'analisis',
    view: 'cuantificacion',
    stats: [
      'Análisis por Imagen',
      'Resultado en m² y porcentaje (%)',
    
    ],
  },
  {
    title: 'Monitoreo Histórico y Comparativas',
    description: 'Revisa métricas pasadas y compara automáticamente las tendencias de cambio entre capturas.',
    section: 'historial',
    view: 'comparativa',
    stats: [
      'Historial de Capturas por Ecosistema',
      'Cálculo automático de Δ (Cambio) vs. captura anterior',
      'Indicadores visuales de aumento o disminución',
    ],
  },
  {
    title: 'Gestión de Ecosistemas y Metadata',
    description: 'Configura el cuerpo de agua a monitorear y asegura la calidad del registro de cada captura.',
    section: 'configuracion',
    view: 'metadata',
    stats: [
      'Creación o selección de Ecosistemas (Cuerpos de Agua)',
      'Ajuste de Fecha y hora de Captura',
      'Campo de Descripción para contexto adicional',
    ],
  },
];

// Componente DashboardTabIcon
interface DashboardTabIconProps {
  imageBaseName: "ubicacion" | "monitor"
  isSelected: boolean
}

const ICON_PATH = "/imgs-gifs/"

const DashboardTabIcon: React.FC<DashboardTabIconProps> = ({
  imageBaseName,
  isSelected,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const containerClasses = `w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 overflow-hidden relative bg-transparent ${
    isSelected ? "" : ""
  }`

  const showGif = isSelected || isHovered

  return (
    <div
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen PNG (estática) */}
      <Image
        src={`${ICON_PATH}${imageBaseName}.png`}
        alt={`${imageBaseName} icon`}
        width={56} 
        height={56} 
        className={`transition-all duration-300 ${showGif ? "opacity-0" : "opacity-100 filter grayscale"}`}
        style={{ objectFit: "contain" }}
      />
      {/* Imagen GIF (animada) */}
      <Image
        src={`${ICON_PATH}${imageBaseName}.gif`}
        alt={`${imageBaseName} animated icon`}
        width={56}
        height={56} 
        className={`absolute transition-all duration-300 ${showGif ? "opacity-100" : "opacity-0"}`}
        style={{ objectFit: "contain" }}
        unoptimized 
      />
    </div>
  )
}

// --- COMPONENTE PRINCIPAL CORREGIDO ---

const HomePage: React.FC = () => { 
    const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.PhotoAnalyzer)
    const [isLoadingView, setIsLoadingView] = useState(false)
    const [isClient, setIsClient] = useState(false) // 🆕 Estado para detectar cliente
    const integratedDashboardRef = useRef<HTMLDivElement>(null)
    const toolsRef = useRef<HTMLDivElement>(null)
    const updatesRef = useRef<HTMLDivElement>(null)
  
    const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = useMemo(
      () => ({
        "#dashboard": integratedDashboardRef,
        "#tools": toolsRef,
        "#updates": updatesRef,
      }),
      [],
    )

    // 🆕 Detectar cuando estamos en el cliente
    useEffect(() => {
      setIsClient(true)
    }, [])
  
    const handleNavigation = useCallback(
      (section: string, view: DashboardView | null) => {
        // 🆕 Solo ejecutar en el cliente
        if (!isClient) return

        const targetHash = `#${section}`
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash
        }
  
        if (view && section === "dashboard" && view !== currentView) {
          setIsLoadingView(true)
          setTimeout(() => {
            setCurrentView(view)
            setIsLoadingView(false)
          }, 300)
        }
      },
      [currentView, isClient], // 🆕 Agregar isClient como dependencia
    )
  
    useEffect(() => {
      // 🆕 Solo ejecutar en el cliente
      if (!isClient) return

      const handleHashChange = () => {
        const hash = window.location.hash
        const targetRef = sectionRefs[hash]
  
        setTimeout(() => {
          targetRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 100)
      }
  
      handleHashChange()
      window.addEventListener("hashchange", handleHashChange)
  
      return () => {
        window.removeEventListener("hashchange", handleHashChange)
      }
    }, [sectionRefs, isClient]) // 🆕 Agregar isClient como dependencia
  
    const currentOption = dashboardOptions.find((o) => o.id === currentView)
  
    return ( 
      <div className="min-h-screen bg-white">
        <Header onNavClick={(section) => handleNavigation(section, null)} />
  
        <HeroImage />
  
        {/* ========================================
            PANEL DE CONTROL INTEGRADO (DASHBOARD)
            ========================================
        */}
        <section id="dashboard" ref={integratedDashboardRef} className="py-24 bg-white relative overflow-hidden">
          <div className="absolute left-32 top-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-300/40 to-pink-200/50 blur-3xl pointer-events-none"></div>
          <div className="absolute right-20 bottom-32 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-purple-300/30 to-blue-300/30  pointer-events-none"></div>
  
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-[44px] font-normal text-slate-900 mb-4 tracking-tight leading-tight">
                Panel de Control
              </h2>
              <p className="text-[17px] text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                Accede a la visualización geoespacial en tiempo real o al motor de análisis de IA
              </p>
            </motion.div>
  
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {dashboardOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => handleNavigation("dashboard", option.id)}
                    className={`p-6 cursor-pointer transition-all duration-300 border-1 ${
                      currentView === option.id
                        ? "border-blue-200 bg-blue-50/40 shadow-lg shadow-blue-100/50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Componente para el efecto PNG/GIF */}
                      <DashboardTabIcon 
                        imageBaseName={option.imageBaseName} 
                        isSelected={currentView === option.id}
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-[18px] font-medium mb-1.5 transition-colors ${
                            currentView === option.id ? "text-blue-700" : "text-slate-900"
                          }`}
                        >
                          {option.title}
                        </h3>
                        <p className="text-[14px] text-slate-600 leading-relaxed">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
  
            <motion.div
              className="min-h-[650px] border-1 border-slate-100 rounded-2xl shadow-lg overflow-hidden bg-white relative"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true, amount: 0.1 }}
            >
              {/* ENCABEZADO DEL DASHBOARD: Usando Lucide Icons */}
              <div className="p-5 bg-blue-100 text-slate-700 font-medium flex items-center justify-between border-b-1 border-slate-200 relative backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[16px] font-medium text-slate-900">
                    {currentOption?.title}
                  </span>
                </div>
              
                <AnimatePresence>
                  {isLoadingView && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      exit={{ width: "0%", transition: { duration: 0.15 } }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                </AnimatePresence>
              </div>
  
              <div className="relative bg-white">
                <AnimatePresence mode="wait">
                  {currentView === DashboardView.Map && (
                    <motion.div
                      key="map"
                      variants={viewVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      className="w-full h-[600px]"
                    >
                      {/* 🎯 USO DEL COMPONENTE DINÁMICO */}
                      <DynamicMapComponent />
                    </motion.div>
                  )}
                  {currentView === DashboardView.PhotoAnalyzer && (
                    <motion.div
                      key="analyzer"
                      variants={viewVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      className="w-full p-8"
                    >
                      <PhotoAnalyzer />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
  
        {/* ========================================
            HERRAMIENTAS ESPECIALIZADAS
            ========================================
        */}
       <section id="tools" ref={toolsRef} className="py-24 bg-slate-50/50">
    <div className="max-w-7xl mx-auto px-6">
        <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-[44px] font-normal text-slate-900 mb-4 tracking-tight leading-tight">
                Módulos de Análisis
            </h2>
            <p className="text-[17px] text-slate-600 max-w-2xl font-normal leading-relaxed">
                Capacidades especializadas para la toma de decisiones estratégicas en conservación
            </p>
        </motion.div>

        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            variants={stagger}
            viewport={{ once: true, amount: 0.2 }}
        >
            {toolsData.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                    <Card
                        // CLASES MODIFICADAS: Eliminados 'cursor-pointer' y 'hover:shadow-md'
                        className="p-7 h-full group transition-all duration-200 bg-white border border-slate-200 shadow-sm rounded-xl"
                        // LÓGICA ELIMINADA: Removido onClick
                    >
                        
                        <h3 className="text-[22px] font-medium text-slate-900 mb-3 tracking-tight leading-snug">
                            {feature.title}
                        </h3>
                        <p className="text-[15px] text-slate-600 mb-6 leading-relaxed">{feature.description}</p>

                        <div className="space-y-2.5 mb-6">
                            {feature.stats.map((stat, i) => (
                                <div key={i} className="flex items-center text-[14px] text-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-3 flex-shrink-0" />
                                    <span className="font-normal">{stat}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* BOTÓN ELIMINADO: Se removió todo el componente Button y su contenido. */}

                    </Card>
                </motion.div>
            ))}
        </motion.div>
    </div>
</section>
        {/* Footer */}
        <Footer />
      </div>
    ) 
  } 

export default HomePage