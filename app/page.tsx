"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"

// --- Component Imports ---
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroImage } from "../components/hero-image"

// --- Animation Variants ---
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// --- Data Structure ---
const toolsData = [
  {
    title: 'Cuantificación de Cuerpos de Agua',
    description: 'Mida áreas de agua y vegetación para obtener métricas cuantitativas y evaluar el estado ambiental de forma precisa.',
    stats: [
      'Análisis por imagen de área de agua y cobertura vegetal.',
      'Resultados cuantitativos expresados en metros cuadrados.',
      'Información clave para la evaluación de impacto ambiental.',
    ],
  },
  {
    title: 'Monitorización Histórica',
    description: 'Acceda al historial de análisis para comparar la evolución de los ecosistemas a lo largo del tiempo e identificar tendencias.',
    stats: [
      'Acceso al historial completo de capturas y análisis.',
      'Cálculo automatizado de cambios respecto a mediciones previas.',
      'Visualización clara de tendencias para la toma de decisiones.',
    ],
  },
  {
    title: 'Gestión de Metadatos',
    description: 'Organice sus proyectos con metadatos detallados, incluyendo fechas, notas y descripciones para un contexto completo.',
    stats: [
      'Creación de ecosistemas y proyectos para monitorizar.',
      'Registro automático de fecha, hora y coordenadas.',
      'Descripciones y notas adicionales para un contexto enriquecido.',
    ],
  },
];


// --- Page Component ---
const HomePage: React.FC = () => {
  // Hooks and navigation logic remains unchanged
  const [isClient, setIsClient] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useMemo(() => ({ "#features": featuresRef, "#tools": toolsRef }), []);

  useEffect(() => { setIsClient(true); }, []);

  const handleNavigation = useCallback((section: string) => {
    sectionRefs[`#${section}`]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sectionRefs]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans antialiased">
      <Header onNavClick={handleNavigation} />

      <HeroImage />

      {/* ========================================
          SECTION: FEATURES
          STYLE: Sophisticated layout with a subtle "aurora" background glow.
          ======================================== */}
      <section
        id="features"
        ref={featuresRef}
        className="relative isolate py-24 sm:py-32"
        aria-labelledby="features-heading"
      >
        {/* Subtle background glow effect */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[50rem] w-[80rem] -translate-x-1/2 bg-gradient-to-tr from-blue-100/40 to-blue-300/30 opacity-20 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-20 sm:mb-24"
            initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true, amount: 0.2 }}
          >
            <h2 id="features-heading" className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
              Análisis Ambiental de Precisión
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Transformamos imágenes complejas en datos claros y accionables para el monitoreo, cuantificación y gestión de ecosistemas.
            </p>
          </motion.div>

          <div className="space-y-20 sm:space-y-24">
            {/* Feature 1 */}
            <motion.div
              className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
              initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true, amount: 0.3 }}
            >
              <div className="w-full md:w-1/2 p-2 bg-gray-100/80 border border-gray-200/60 rounded-lg ring-1 ring-inset ring-gray-900/5 shadow-sm">
                <img src="/imagenes/histori-imgs.png" alt="Visualización de datos históricos" className="rounded-md" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Cuantificación</span>
                <h3 className="mt-2 text-3xl font-semibold text-gray-900 tracking-tight">Resultados Cuantitativos</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Obtenga mediciones exactas en metros cuadrados de áreas de agua y cobertura vegetal. Exporte datos claros para informes y análisis detallados.
                </p>
              </div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div
              className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16"
              initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true, amount: 0.3 }}
            >
              <div className="w-full md:w-1/2 p-2 bg-gray-100/80 border border-gray-200/60 rounded-lg ring-1 ring-inset ring-gray-900/5 shadow-sm">
                <img src="/imagenes/busca-ecosistema-mapa.png" alt="Mapa de organización de ecosistemas" className="rounded-md" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Organización</span>
                <h3 className="mt-2 text-3xl font-semibold text-gray-900 tracking-tight">Gestión Centralizada</h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Cree proyectos para cada ecosistema, almacene un historial de análisis y adjunte metadatos. Mantenga toda su información ordenada y accesible.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================
          SECTION: TOOLS
          STYLE: Premium cards with gradient borders and polished list items.
          ======================================== */}
      <section
        id="tools"
        ref={toolsRef}
        className="py-24 sm:py-32 bg-gradient-to-b from-gray-50/70 to-white border-y border-gray-200/80"
        aria-labelledby="tools-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16 sm:mb-20"
            initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true, amount: 0.2 }}
          >
            <h2 id="tools-heading" className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
              Funcionalidades Diseñadas para la Eficiencia
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Cada herramienta está diseñada para maximizar su productividad, desde la cuantificación de datos hasta el seguimiento a largo plazo.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial" whileInView="animate" variants={stagger} viewport={{ once: true, amount: 0.1 }}
          >
            {toolsData.map((tool) => (
              <motion.div
                key={tool.title}
                variants={fadeInUp}
                className="group relative rounded-lg p-[1px] bg-gradient-to-br from-gray-200/80 to-gray-200/50 transition-all duration-300 hover:from-blue-300/70 hover:to-blue-200/50 shadow-sm hover:shadow-lg"
              >
                <div className="relative flex flex-col h-full bg-white rounded-[7px] p-8">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 flex-grow">
                    {tool.description}
                  </p>
                  <ul className="mt-6 space-y-3 border-t border-gray-200/80 pt-6">
                    {tool.stats.map((stat) => (
                      <li key={stat} className="flex items-start text-sm">
                        <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 mr-3 mt-0.5 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-inset ring-blue-200/50">
                          <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{stat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;