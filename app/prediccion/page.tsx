"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { TrendingUp, BarChart3, Bell, Settings, Globe, ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import Link from "next/link"

export default function PrediccionPage() {
  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import("aos")).default
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
      })
    }
    initAOS()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
              data-aos="fade-right"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Link>
            <div className="text-center">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-foreground mb-6" data-aos="fade-up">
                Sección <span className="text-primary">Predicción</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                Modelos predictivos avanzados y sistemas de alerta temprana para la gestión proactiva del agua
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Predictive Models */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Modelos Predictivos</CardTitle>
                    <CardDescription>IA y machine learning para predicciones</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Modelo de Calidad pH</span>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precisión: 94.2%</span>
                      <span>Horizonte: 7 días</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Modelo de Oxígeno Disuelto</span>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precisión: 91.8%</span>
                      <span>Horizonte: 5 días</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Modelo de Turbidez</span>
                      <Badge variant="outline">En desarrollo</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precisión: 87.3%</span>
                      <span>Horizonte: 3 días</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Configurar Modelos</Button>
              </CardContent>
            </Card>

            {/* Future Scenarios */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Escenarios Futuros</CardTitle>
                    <CardDescription>Proyecciones a corto y largo plazo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-green-800">Escenario Optimista</span>
                      <span className="text-xs text-green-600">Probabilidad: 65%</span>
                    </div>
                    <p className="text-xs text-green-700">Mejora gradual en todos los indicadores</p>
                  </div>
                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-yellow-800">Escenario Moderado</span>
                      <span className="text-xs text-yellow-600">Probabilidad: 25%</span>
                    </div>
                    <p className="text-xs text-yellow-700">Estabilidad con variaciones estacionales</p>
                  </div>
                  <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-red-800">Escenario Pesimista</span>
                      <span className="text-xs text-red-600">Probabilidad: 10%</span>
                    </div>
                    <p className="text-xs text-red-700">Deterioro por factores externos</p>
                  </div>
                </div>
                <Button className="w-full">Ver Análisis Completo</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Early Alerts */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-chart-4" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Alertas Tempranas</CardTitle>
                    <CardDescription>Sistema de notificaciones</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">pH Normal</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Activa
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Turbidez Alta</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Activa
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span className="text-sm">Temperatura</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Inactiva
                    </Badge>
                  </div>
                </div>
                <Button className="w-full">Gestionar Alertas</Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Recomendaciones</CardTitle>
                    <CardDescription>Acciones sugeridas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Aumentar frecuencia de monitoreo</p>
                    <p className="text-xs text-blue-600">Lago Central - Próximos 3 días</p>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Condiciones óptimas detectadas</p>
                    <p className="text-xs text-green-600">Río Norte - Mantener protocolo actual</p>
                  </div>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Revisar calibración de sensores</p>
                    <p className="text-xs text-orange-600">Estación 7 - Programar mantenimiento</p>
                  </div>
                </div>
                <Button className="w-full">Ver Todas las Recomendaciones</Button>
              </CardContent>
            </Card>

            {/* Weather Integration */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="500">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Datos Meteorológicos</CardTitle>
                    <CardDescription>Integración climática</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precipitación prevista</span>
                    <span className="font-medium">15mm (48h)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temperatura ambiente</span>
                    <span className="font-medium">18-24°C</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Viento</span>
                    <span className="font-medium">12 km/h NE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Humedad</span>
                    <span className="font-medium">68%</span>
                  </div>
                </div>
                <Button className="w-full">Ver Pronóstico Extendido</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
