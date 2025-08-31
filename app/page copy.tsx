
import React from 'react'
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
  Clock
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'

const HomePage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/30"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-100/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="grid lg:grid-cols-2 gap-20 items-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div className="space-y-10" variants={fadeInUp}>
              <div className="space-y-6">
                <motion.div 
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  variants={fadeInUp}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Monitoreo Inteligente
                </motion.div>
                
                <h1 className="text-6xl lg:text-7xl font-light text-slate-900 leading-tight">
                  Calidad del
                  <span className="block font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    Agua
                  </span>
                  <span className="block font-light text-slate-600">en Tiempo Real</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                  Plataforma avanzada que combina análisis predictivo, visualización de datos y monitoreo continuo para la gestión inteligente de recursos hídricos.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Explorar Datos
                </Button>
                <Button variant="secondary" size="lg">
                  Ver Demostración
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-8 pt-8"
                variants={fadeInUp}
              >
                <div>
                  <div className="text-3xl font-light text-slate-900">2.4M+</div>
                  <div className="text-sm text-slate-600">Registros</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-slate-900">24</div>
                  <div className="text-sm text-slate-600">Estaciones</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-slate-900">99.9%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              variants={fadeInUp}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="p-8 group cursor-pointer" hover>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Tendencias</h3>
                    <p className="text-slate-600 text-sm">Análisis predictivo avanzado</p>
                    <div className="mt-4 flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Activo
                    </div>
                  </Card>
                  
                  <Card className="p-8 group cursor-pointer" hover>
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Droplets className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Calidad</h3>
                    <p className="text-slate-600 text-sm">Monitoreo continuo</p>
                    <div className="mt-4 flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Actualizado
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-6 pt-12">
                  <Card className="p-8 group cursor-pointer" hover>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Análisis</h3>
                    <p className="text-slate-600 text-sm">Reportes inteligentes</p>
                    <div className="mt-4 flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      En línea
                    </div>
                  </Card>
                  
                  <Card className="p-8 group cursor-pointer" hover>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Ubicación</h3>
                    <p className="text-slate-600 text-sm">Mapeo geográfico</p>
                    <div className="mt-4 flex items-center text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Sincronizado
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-light text-slate-900 mb-6">
              Herramientas <span className="font-semibold">Especializadas</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Accede a análisis histórico, predicciones avanzadas y visualizaciones en tiempo real
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
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
                color: "blue",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Activity,
                title: "Predicción",
                description: "Modelos de IA avanzados",
                stats: ["94.2% precisión", "Alertas tempranas", "ML optimizado"],
                color: "emerald",
                gradient: "from-emerald-500 to-emerald-600"
              },
              {
                icon: Layers,
                title: "Análisis",
                description: "Visualización inteligente",
                stats: ["Tiempo real", "Comparativas", "Dashboards"],
                color: "purple",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: Globe,
                title: "Monitoreo",
                description: "Seguimiento continuo",
                stats: ["24 estaciones", "Update 1min", "Cobertura total"],
                color: "orange",
                gradient: "from-orange-500 to-orange-600"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-8 h-full group cursor-pointer" hover>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-${feature.color}-500/20`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {feature.stats.map((stat, i) => (
                      <div key={i} className="flex items-center text-sm text-slate-500">
                        <div className={`w-2 h-2 bg-${feature.color}-400 rounded-full mr-3`}></div>
                        {stat}
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="ghost" className="w-full group-hover:bg-slate-50 transition-colors">
                    Explorar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
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
              <Card className="p-10 h-full">
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
                  color: "yellow"
                },
                {
                  icon: Camera,
                  title: "Galería Fotográfica Actualizada",
                  description: "Nuevas imágenes de alta resolución",
                  time: "Hace 2 semanas",
                  color: "green"
                },
                {
                  icon: TrendingUp,
                  title: "Modelos Predictivos Mejorados",
                  description: "Algoritmos IA con 94.2% de precisión",
                  time: "Hace 3 semanas",
                  color: "purple"
                }
              ].map((update, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 bg-gradient-to-br from-${update.color}-50 to-${update.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <update.icon className={`w-6 h-6 text-${update.color}-600`} />
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

      {/* Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-light text-slate-900 mb-6">
              Mantente <span className="font-semibold">Informado</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Recibe reportes semanales y alertas importantes directamente en tu correo
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="flex-1 h-14 px-6 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-slate-900"
              />
              <Button variant="primary" size="lg">
                Suscribirse
              </Button>
            </div>
            
            <p className="text-sm text-slate-500">Sin spam. Cancela cuando quieras.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
