'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Eye, ArrowRight } from 'lucide-react' // Solo mantenemos los iconos de los botones principales
import { Button } from './ui/button'
import { useRef } from 'react'

// Se eliminaron: Droplets, TrendingUp, BarChart3, Image (iconos de las tarjetas)
// Se eliminó: Card (componente de las tarjetas)

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
}

export function HeroImage() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  // Ajusta estos valores para controlar la intensidad del paralaje
  const yBackground = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const yMap = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  // Se eliminaron las variables yCardX ya que las tarjetas han sido eliminadas.

  // Función para redirigir a la sección del analizador de fotos
  const handleRedirectToAnalyzer = () => {
    // Tanto Explorar Datos como Ver Demostración ahora redirigen aquí
    window.location.href = '/#photo-analyzer'
  }

  return (
    <section ref={ref} className="pt-20 pb-24 px-6 relative overflow-hidden">
      {/* Background Elements con Paralaje */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/30"
        style={{ y: yBackground }}
      ></motion.div>
      <motion.div
        className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"
        style={{ y: yBackground }}
      ></motion.div>
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-100/30 rounded-full blur-3xl"
        style={{ y: yBackground }}
      ></motion.div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="grid lg:grid-cols-2 gap-20 items-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Columna Izquierda - Título y contenido */}
          <motion.div className="space-y-6 max-w-4xl" variants={fadeInUp}>
            <div className="space-y-3">
              <h1 className="text-7xl lg:text-6xl font-light text-slate-900 leading-tight relative">
                {/* Gradiente de fondo con blur */}
                <div className="absolute left-32 top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 opacity-30 blur-xl"></div>

                <span className="block font-semibold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent relative z-10">
                  Sistema de Gestión
                </span>
                <span className="block font-semibold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent relative z-10">
                  de Áreas Naturales
                </span>
                <span className="block font-light text-slate-600 relative z-10">
                  Protegidas
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                Plataforma avanzada que combina análisis predictivo, visualización de datos y monitoreo continuo para la gestión inteligente de recursos hídricos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <Button 
                className="bg-gray-500 hover:bg-gray-600 text-white border-0 hover:border" 
                style={{ borderColor: '#D4B483' }}
                size="lg"
                onClick={handleRedirectToAnalyzer} // Redirige al Analizador
              >
                <Eye className="w-5 h-5 mr-2" />
                Explorar Datos
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="border border-gray-300 hover:border"
                style={{ borderColor: '#D4B483' }}
                onClick={handleRedirectToAnalyzer} // ¡Ver Demostración ahora redirige aquí!
              >
                Ver Demostración
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Columna Derecha - Imagen de Hidalgo con Paralaje */}
          <motion.div
            className="relative p-8"
            variants={fadeInUp}
          >
            {/* Mapa de Hidalgo como imagen principal */}
            <motion.div
              className="relative z-10 w-full rounded-xl overflow-hidden "
              style={{
                y: yMap, // Aplicar paralaje
              }}
            >
                <img
                    src="/imagenes/Blank_map_of_Hidalgo_1_.png"
                    alt="Mapa de Hidalgo"
                    className="w-full h-auto object-cover opacity-90"
                />
            </motion.div>
            
            {/* Se eliminó todo el bloque de las tarjetas y el grid de la derecha */}

          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}