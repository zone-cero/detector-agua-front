"use client"
import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

// --- Importaciones de Componentes de la Interfaz de Usuario ---
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { HeroImage } from "../components/hero-image"

// --- CONSTANTES ---
const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const toolsData = [
  {
    title: 'Cuantificación de Cuerpos de Agua',
    description: 'Mide automáticamente las áreas de agua y vegetación en tus imágenes. Obtén resultados en metros cuadrados para evaluar el estado ambiental.',
    stats: [
      'Análisis por imagen de área de agua y cobertura vegetal',
      'Resultados cuantitativos en metros cuadrados',
      'Información para evaluación ambiental',
    ],
  },
  {
    title: 'Monitorización Histórica',
    description: 'Compara imágenes de diferentes fechas para ver los cambios en los ecosistemas. Revisa el historial de análisis y observa las tendencias.',
    stats: [
      'Acceso al historial de capturas',
      'Cálculo de cambios respecto a capturas previas',
      'Visualización de tendencias',
    ],
  },
  {
    title: 'Gestión de Metadatos',
    description: 'Organiza tu información de monitoreo. Crea registros de ecosistemas, añade fechas y guarda notas para cada análisis.',
    stats: [
      'Creación de ecosistemas a monitorizar',
      'Registro de fecha y hora',
      'Descripciones y notas adicionales',
    ],
  },
];

// --- COMPONENTE PRINCIPAL DE LA PÁGINA: HomePage ---
const HomePage: React.FC = () => {
  const [isClient, setIsClient] = useState(false)

  const featuresRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = useMemo(
    () => ({
      "#features": featuresRef,
      "#tools": toolsRef,
    }),
    [],
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleNavigation = useCallback(
    (section: string) => {
      if (!isClient) return;

      const targetHash = `#${section}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    },
    [isClient],
  );

  useEffect(() => {
    if (!isClient) return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      const targetRef = sectionRefs[hash];

      setTimeout(() => {
        targetRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [sectionRefs, isClient]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Header onNavClick={(section) => handleNavigation(section)} />

      <HeroImage />

      {/* ========================================
          SECCIÓN: CARACTERÍSTICAS PRINCIPALES
          ======================================== */}
    <section
  id="features"
  ref={featuresRef}
  className="py-20 md:py-28 lg:py-32 bg-slate-50 overflow-hidden"
  aria-labelledby="features-heading"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      className="mb-16 md:mb-20 lg:mb-24 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 id="features-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 tracking-tighter">
        Monitoreo de Ecosistemas
      </h2>
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Herramientas intuitivas para el análisis y seguimiento de cuerpos de agua.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 md:items-center">

      {/* Tarjeta 1: Imagen Compacta con contain y sombra azul */}
      {/* CAMBIO: Se añadió bg-white y se cambió la sombra. */}
      <motion.div
        className="relative rounded-xl overflow-hidden shadow-xl shadow-sky-400/25 group w-64 aspect-[3/4] justify-self-center md:justify-self-end bg-white"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* CAMBIO: Se usó bg-contain y bg-no-repeat. */}
        <div
          className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: "url('/imagenes/histori-imgs.png')" }}
        />
        <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-base font-bold text-white">Análisis Simple</h3>
          <p className="text-white/90 mt-0.5 text-xs max-w-xs">
            Mide áreas de agua y vegetación automáticamente.
          </p>
        </div>
      </motion.div>

      {/* Tarjeta 2: Solo Texto con sombra azul */}
      {/* CAMBIO: Se cambió la sombra. */}
      <motion.div
        className="bg-white p-8 rounded-3xl shadow-xl shadow-sky-400/25 flex flex-col justify-center border border-transparent"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Resultados Claros</h3>
        <p className="text-slate-600 leading-relaxed">
          Obtén mediciones detalladas en metros cuadrados para comprender los cambios en el ecosistema de manera visual.
        </p>
      </motion.div>

      {/* Tarjeta 3: Solo Texto con sombra azul */}
      {/* CAMBIO: Se cambió la sombra. */}
      <motion.div
        className="bg-white p-8 rounded-3xl shadow-xl shadow-sky-400/25 flex flex-col justify-center border border-transparent"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Seguimiento Temporal</h3>
        <p className="text-slate-600 leading-relaxed">
          Compara cómo evolucionan los cuerpos de agua a través del tiempo con análisis históricos y visualizaciones comparativas.
        </p>
      </motion.div>

      {/* Tarjeta 4: Imagen Horizontal con contain y sombra azul */}
      {/* CAMBIO: Se añadió bg-white y se cambió la sombra. */}
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-xl shadow-sky-400/25 group aspect-video bg-white"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* CAMBIO: Se usó bg-contain y bg-no-repeat. */}
        <div
          className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: "url('/imagenes/busca-ecosistema-mapa.png')" }}
        />
        <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-2xl font-bold text-white tracking-tight">Organización Sencilla</h3>
          <p className="text-white/90 mt-1 max-w-sm">
            Guarda y organiza todos tus análisis con fechas y notas.
          </p>
        </div>
      </motion.div>

    </div>
  </div>
</section>

      {/* ========================================
          SECCIÓN: HERRAMIENTAS
          ======================================== */}
      <section
        id="tools"
        ref={toolsRef}
        className="py-16 md:py-20 lg:py-24 bg-slate-50/70"
        aria-labelledby="tools-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-10 md:mb-12 lg:mb-16 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 id="tools-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 md:mb-3 lg:mb-4 tracking-tight leading-tight">
              Funcionalidades
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed">
              Todo lo que necesitas para el monitoreo de cuerpos de agua
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            initial="initial"
            whileInView="animate"
            variants={stagger}
            viewport={{ once: true, amount: 0.2 }}
          >
            {toolsData.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className="p-5 md:p-6 lg:p-8 h-full group transition-all duration-300 bg-white border border-slate-200 shadow-sm rounded-xl md:rounded-2xl hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] hover:border-blue-200"
                  role="region"
                  aria-labelledby={`feature-title-${index}`}
                >
                  <h3 id={`feature-title-${index}`} className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mb-2 md:mb-3 tracking-tight leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 md:mb-5 leading-relaxed">{feature.description}</p>

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
                    {feature.stats.map((stat, i) => (
                      <div key={i} className="flex items-start text-xs sm:text-sm lg:text-base text-slate-700">
                        <span className="text-blue-600 mr-2 flex-shrink-0">&ndash;</span>
                        <span className="font-normal">{stat}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage