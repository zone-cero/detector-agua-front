'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } },
};

export function HeroImage() {
  const ref = useRef(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  const handleRedirectToAnalyzer = () => router.push('/#dashboard');
  const handleRedirectToHistory = () => router.push('/historico');

  return (
    <section ref={ref} className="relative w-full min-h-screen flex items-center pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Fondo e iluminación sutil */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/imagenes/Gemini_Generated_Image_sgf3bpsgf3bpsgf3.png')` }}
        />
        <div className="absolute inset-0 bg-black/60" 
             style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8))' }}
        />
      </div>

      {/* Spotlight del mouse */}
      <motion.div
        className="fixed top-0 left-0 z-50 w-96 h-96 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)',
        }}
        animate={{ x: mousePosition.x - 192, y: mousePosition.y - 192 }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.5 }}
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Contenido de Texto */}
          <motion.div style={{ y: yText }} variants={fadeInUp}>
            <div className="flex flex-col text-left space-y-8">
              <h1 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight">
                Análisis Ambiental
                <span className="block font-semibold mt-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Impulsado por Datos
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg font-light">
                Cuantifica áreas de agua y vegetación con precisión satelital. Monitoreo histórico y gestión de ecosistemas en una sola plataforma.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                {/* Botón Principal (Estilo sólido con borde inferior al hover) */}
                <Button
                  size="lg"
                  className="bg-white text-gray-900 font-semibold px-8 py-6 text-base
                             border-2 border-white
                             transition-all duration-300 ease-out
                             hover:-translate-y-1 hover:shadow-[0_6px_0_0_#9ca3af]"
                  onClick={handleRedirectToAnalyzer}
                >
                  Analizar Imagen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Botón Secundario (Estilo outline con borde inferior al hover) */}
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white font-medium px-8 py-6 text-base
                             border-2 border-white/30
                             hover:bg-transparent hover:border-white
                             transition-all duration-300 ease-out
                             hover:-translate-y-1 hover:shadow-[0_6px_0_0_#ffffff]"
                  onClick={handleRedirectToHistory}
                >
                  Ver Historial
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Imagen Derecha (Limpia, sin fondo) */}
          <motion.div style={{ y: yImage }} variants={fadeInUp} className="relative flex justify-center lg:justify-end">
            <img
              src="/imagenes/Blank_map_of_Hidalgo_1_.png"
              alt="Mapa de Hidalgo"
              // drop-shadow-2xl ayuda a que la imagen transparente resalte sobre el fondo complejo sin necesitar un contenedor
              className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}