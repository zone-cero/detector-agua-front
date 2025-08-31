"use client"

import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Droplets,
  TrendingUp,
  BarChart3,
  MapPin,
  Eye,
  ArrowRight
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useRef } from 'react'

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
  const yCard1 = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  const yCard2 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
  const yCard3 = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const yCard4 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])

  return (
    <section ref={ref} className="pt-32 pb-24 px-6 relative overflow-hidden">
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
          <motion.div className="space-y-10" variants={fadeInUp}>
            <div className="space-y-6">
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                variants={fadeInUp}
              >
                <Droplets className="w-4 h-4 mr-2" />
                Monitoreo Inteligente
              </motion.div>

              <h1 className="text-6xl lg:text-7xl font-light text-slate-900 leading-tight relative">
                {/* Gradiente de fondo con blur */}
                <div className="absolute left-32 top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 opacity-30 blur-xl"></div>

                <span className="block font-semibold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent relative z-1">
                  Calidad del
                </span>
                <span className="block font-semibold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent relative z-1">
                  Agua
                </span>
                <span className="block font-light text-slate-600 relative z-10">en Tiempo Real</span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Plataforma avanzada que combina análisis predictivo, visualización de datos y monitoreo continuo para la gestión inteligente de recursos hídricos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gray-500 hover:bg-gray-600 text-white" size="lg">
                <Eye className="w-5 h-5 mr-2" />
                Explorar Datos
              </Button>
              <Button variant="secondary" size="lg">
                Ver Demostración
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

          </motion.div>

          {/* Columna Derecha - Mapa y Tarjetas con Paralaje */}
          <motion.div
            className="relative"
            variants={fadeInUp}
          >
            <div
              className="grid grid-cols-2 gap-4 relative"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              {/* Mapa con Paralaje y ajuste de posición */}
              <motion.div
                className="absolute inset-0 z-0 opacity-35 md:h-[calc(100%+8rem)] lg:h-[calc(100%+12rem)] w-full -top-16"
                style={{
                  backgroundImage: "url('/imagenes/Blank_map_of_Hidalgo_1_.png')",
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  y: yMap // Aplicar paralaje al mapa
                }}
              ></motion.div>
              <div className="space-y-4 relative z-10">
                <motion.div style={{ y: yCard1 }}>
                  <Card className="p-4 group cursor-pointer backdrop-blur-sm h-52 w-64" hover>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50/70 to-blue-100/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Tendencias</h3>
                    <p className="text-slate-600 text-sm">Análisis predictivo avanzado</p>
                    <div className=" flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Activo
                    </div>
                  </Card>
                </motion.div>

                <motion.div style={{ y: yCard2 }}>
                  <Card className="p-4 group cursor-pointer backdrop-blur-sm h-50 w-60" hover>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-50/70 to-emerald-100/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Droplets className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Calidad</h3>
                    <p className="text-slate-600 text-sm">Monitoreo continuo</p>
                    <div className=" flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Actualizado
                    </div>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-6 pt-12 relative z-10">
                <motion.div style={{ y: yCard3 }}>
                  <Card className="p-4 group cursor-pointer backdrop-blur-sm h-50 w-60" hover>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-50/70 to-purple-100/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Análisis</h3>
                    <p className="text-slate-600 text-sm">Reportes inteligentes</p>
                    <div className=" flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      En línea
                    </div>
                  </Card>
                </motion.div>

                <motion.div style={{ y: yCard4 }}>
                  <Card className="p-4 group cursor-pointer backdrop-blur-sm h-50 w-52" hover>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-50/70 to-orange-100/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Ubicación</h3>
                    <p className="text-slate-600 text-sm">Mapeo geográfico</p>
                    <div className=" flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Sincronizado
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}