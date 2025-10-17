'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Eye, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // NUEVO: Importar useRouter


const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 5.0, ease: [0.4, 0, 0.5, 1] }, 
};

export function HeroImage() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })
  const router = useRouter() // NUEVO: Obtener el router

  // Estado para la posición del cursor
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringButton, setIsHoveringButton] = useState(false)

  // Efecto para seguir el cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const yBackground = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const yMap = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  // NUEVO: Funciones de redirección separadas
  const handleRedirectToAnalyzer = () => {
    // Redirige al analizador de imágenes
    window.location.href = '/#dashboard'
  }

  const handleRedirectToHistory = () => {
    // Redirige a la página de histórico
    router.push('/historico')
  }

  return (
    <section ref={ref} className="pt-20 pb-0 px-6 relative overflow-hidden">
      {/* Bolita que sigue el cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 15, // Centrar la bolita
          y: mousePosition.y - 15,
          scale: isHoveringButton ? 1.5 : 1, // Efecto al hacer hover en botones
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 28,
          mass: 0.5
        }}
      >
        <div className={`w-8 h-8 rounded-full ${
          isHoveringButton 
            ? 'bg-purple-400 blur-[1px]' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        } transition-all duration-300 ${
          isHoveringButton ? 'opacity-80' : 'opacity-60'
        } shadow-lg`} />
        
        {/* Efecto de resplandor */}
        <div className={`absolute inset-0 rounded-full ${
          isHoveringButton 
            ? 'bg-purple-300 animate-pulse' 
            : 'bg-purple-400'
        } blur-md opacity-30 -z-10 transition-all duration-300`} />
      </motion.div>

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
              <div className="absolute left-32 top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 opacity-30 blur-"></div>
              <h1 className="text-7xl lg:text-6xl font-light text-slate-900 leading-tight relative">
                <span className="block font-semibold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent relative z-1">
                  Sistema de Gestión
                </span>
                <span className="block font-semibold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent relative z-1">
                  de Áreas Naturales
                </span>
                <span className="block font-light text-slate-600 relative z-1">
                  Protegidas
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl z-10">
                Plataforma avanzada que combina análisis predictivo, visualización de datos y monitoreo continuo para la gestión inteligente de recursos hídricos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              {/* Botón Ver Historial */}
              <Button
                className="bg-transparent text-gray-600 border border-gray-600 
               transition ease-in-out duration-300 hover:bg-transparent"
                size="lg"
                onClick={handleRedirectToHistory}
                

                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 0 0 rgb(75, 85, 99)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  setIsHoveringButton(true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  setIsHoveringButton(false);
                }}
              >
                
                Ver Historial
              </Button>

              {/* Botón Analizar Imagen */}
              <Button
                className="bg-transparent text-red-700 border border-red-700 
               transition ease-in-out duration-300 hover:bg-transparent"
                variant="secondary"
                size="lg"
                onClick={handleRedirectToAnalyzer}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 0 0 rgb(185, 28, 28)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  setIsHoveringButton(true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  setIsHoveringButton(false);
                }}
              >
                Analizar Imagen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Columna Derecha - Imagen de Hidalgo con Paralaje */}
          <motion.div
            className="relative p-8"
            variants={fadeInUp}
          >
            <motion.div
              className="relative z-10 w-full rounded-xl overflow-hidden"
              style={{
                y: yMap,
              }}
            >
              <img
                src="/imagenes/Blank_map_of_Hidalgo_1_.png"
                alt="Mapa de Hidalgo"
                className="w-full h-auto object-cover opacity-100"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}