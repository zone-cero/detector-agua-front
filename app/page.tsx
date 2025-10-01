"use client"
import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets,
  TrendingUp,
  BarChart3,
  MapPin,
  ArrowRight,
  Calendar,
  Camera,
  Database,
  Globe,
  Zap,
  Shield,
  Eye,
  Activity,
  Layers,
  Clock,
  Image
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeroImage } from '../components/hero-image'
import MapComponent from '@/components/MapComponent';
import PhotoAnalyzer from '@/components/PhotoAnalyzer'

const HomePage: React.FC = () => {
  const photoAnalyzerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const updatesRef = useRef<HTMLDivElement>(null)

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  // Función para manejar la navegación por hash
  const handleNavigation = (section: string) => {
    switch (section) {
      case 'photo-analyzer':
        window.location.href = '/#photo-analyzer'
        break
      case 'map':
        window.location.href = '/#map'
        break
      case 'tools':
        window.location.href = '/#tools'
        break
      case 'updates':
        window.location.href = '/#updates'
        break
      default:
        break
    }
  }

  useEffect(() => {
    // Manejar la navegación por hash
    const handleHashChange = () => {
      const hash = window.location.hash
      
      setTimeout(() => {
        switch (hash) {
          case '#photo-analyzer':
            photoAnalyzerRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
            break
          case '#map':
            mapRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
            break
          case '#tools':
            toolsRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
            break
          case '#updates':
            updatesRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
            break
          default:
            break
        }
      }, 100)
    }

    // Ejecutar al cargar la página si hay hash
    handleHashChange()

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      {/* Hero Section */}
      <HeroImage />
      
      {/* Map Section */}
      <section 
        id="map" 
        ref={mapRef}
        className="py-20 bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-light text-red-800 mb-4 uppercase tracking-wide">
              Mapa de Monitoreo
            </h2>
            <div className="w-20 h-1 bg-red-800 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Visualización geográfica de cuerpos de agua y puntos de monitoreo en tiempo real
            </p>
          </motion.div>
          <MapComponent />
        </div>
      </section>

      {/* Photo Analyzer Section */}
      <section 
        id="photo-analyzer" 
        ref={photoAnalyzerRef}
        className="py-20 bg-gray-50 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-light text-red-800 mb-4 uppercase tracking-wide">
              Análisis de Imágenes
            </h2>
            <div className="w-20 h-1 bg-red-800 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Sube y analiza imágenes para detectar y cuantificar áreas de agua mediante inteligencia artificial
            </p>
          </motion.div>
          <PhotoAnalyzer />
        </div>
      </section>

      {/* HERRAMIENTAS ESPECIALIZADAS Section */}
      <section 
        id="tools" 
        ref={toolsRef}
        className="py-24 bg-white border-b border-gray-200 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-light text-red-800 mb-4 uppercase tracking-wide">
              HERRAMIENTAS ESPECIALIZADAS
            </h2>
            <div className="w-20 h-1 bg-red-800 mb-8"></div>
            <p className="text-xl text-slate-600 max-w-3xl">
              Accede a análisis histórico, predicciones avanzadas y visualizaciones en tiempo real
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-4"
            initial="initial"
            whileInView="animate"
            variants={stagger}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Calendar,
                title: "Histórico",
                description: "Análisis temporal completo",
                stats: ["1,247 imágenes", "2.4M registros", "5 años de datos"],
                gradient: "from-red-700 to-red-800",
                section: "tools"
              },
              {
                icon: Activity,
                title: "Predicción",
                description: "Modelos de IA avanzados",
                stats: ["94.2% precisión", "Alertas tempranas", "ML optimizado"],
                gradient: "from-red-600 to-red-700",
                section: "tools"
              },
              {
                icon: Image,
                title: "Análisis de Imágenes",
                description: "Detección automática de agua",
                stats: ["Procesamiento IA", "Resultados en segundos", "Múltiples formatos"],
                gradient: "from-red-800 to-red-900",
                section: "photo-analyzer"
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card 
                  className="p-4 h-full group cursor-pointer transition-all duration-300 bg-gray-50 border-0 shadow-sm hover:shadow-lg hover:border-red-200"
                  onClick={() => handleNavigation(feature.section)}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-red-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 mb-4 text-sm">{feature.description}</p>

                  <div className="space-y-2 mb-4">
                    {feature.stats.map((stat, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        {stat}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-slate-50 transition-colors text-yellow-600 hover:text-yellow-700 text-sm"
                  >
                    Explorar
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Updates Section */}
      <section 
        id="updates" 
        ref={updatesRef}
        className="py-24 bg-gradient-to-br from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-light text-slate-900 mb-6">
              Últimas <span className="font-semibold">Actualizaciones</span>
            </h2>
            <p className="text-xl text-slate-600">
              Mantente informado sobre los cambios más recientes
            </p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-12"
            initial="initial"
            whileInView="animate"
            variants={stagger}
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-10 h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                  <Shield className="w-10 h-10 text-white" />
                </div>

                <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Mejora Importante
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  Calidad del Agua Mejorada en 15%
                </h3>

                <p className="text-slate-600 mb-8 leading-relaxed">
                  Los análisis recientes muestran mejoras significativas en oxígeno disuelto y reducción de turbidez en las últimas dos semanas.
                </p>

                <div className="flex items-center text-sm text-slate-500 mb-8">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Hace 2 días • Análisis Completo</span>
                </div>

                <Button variant="secondary" className="w-full">
                  Leer Reporte Completo
                </Button>
              </Card>
            </motion.div>

            <motion.div className="space-y-6" variants={fadeInUp}>
              {[
                {
                  icon: Zap,
                  title: "Sistema de Alertas Implementado",
                  description: "Notificaciones automáticas para cambios críticos",
                  time: "Hace 1 semana",
                  color: "yellow",
                  bgColor: "bg-yellow-50",
                  textColor: "text-yellow-600",
                  borderColor: "border-yellow-200"
                },
                {
                  icon: Camera,
                  title: "Galería Fotográfica Actualizada",
                  description: "Nuevas imágenes de alta resolución",
                  time: "Hace 2 semanas",
                  color: "green",
                  bgColor: "bg-green-50",
                  textColor: "text-green-600",
                  borderColor: "border-green-200"
                },
                {
                  icon: TrendingUp,
                  title: "Modelos Predictivos Mejorados",
                  description: "Algoritmos IA con 94.2% de precisión",
                  time: "Hace 3 semanas",
                  color: "purple",
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-600",
                  borderColor: "border-purple-200"
                }
              ].map((update, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-0"
                >
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 ${update.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 border ${update.borderColor}`}>
                      <update.icon className={`w-6 h-6 ${update.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">{update.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{update.description}</p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {update.time}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="ghost" className="w-full">
                Ver Todas las Actualizaciones
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage