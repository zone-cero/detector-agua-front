"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { BarChart3, FileText, Filter, Download, Eye, TrendingUp, MapPin, Users, ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import Link from "next/link"

export default function AnalisisPage() {
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
                Sección <span className="text-primary">Análisis</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                Herramientas avanzadas de análisis, visualización de datos y generación de reportes personalizados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Real-time Visualizations */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Visualizaciones en Tiempo Real</CardTitle>
                    <CardDescription>Dashboards interactivos y gráficos dinámicos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <BarChart3 className="w-8 h-8 text-chart-1 mx-auto mb-2" />
                    <p className="text-sm font-medium">Gráficos de Barras</p>
                    <p className="text-xs text-muted-foreground">Comparativas</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 text-chart-2 mx-auto mb-2" />
                    <p className="text-sm font-medium">Líneas de Tendencia</p>
                    <p className="text-xs text-muted-foreground">Evolución temporal</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <MapPin className="w-8 h-8 text-chart-3 mx-auto mb-2" />
                    <p className="text-sm font-medium">Mapas de Calor</p>
                    <p className="text-xs text-muted-foreground">Distribución espacial</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <Eye className="w-8 h-8 text-chart-4 mx-auto mb-2" />
                    <p className="text-sm font-medium">Dashboards</p>
                    <p className="text-xs text-muted-foreground">Vista integral</p>
                  </div>
                </div>
                <Button className="w-full">Abrir Dashboard Principal</Button>
              </CardContent>
            </Card>

            {/* Custom Reports Generator */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Generador de Reportes</CardTitle>
                    <CardDescription>Reportes personalizados y automatizados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Reporte Semanal</span>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Automático
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Resumen de indicadores clave</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Análisis Comparativo</span>
                      <span className="text-xs border border-border px-2 py-1 rounded">Personalizable</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Entre diferentes cuerpos de agua</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Reporte de Cumplimiento</span>
                      <span className="text-xs border border-border px-2 py-1 rounded">Mensual</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Normativas y estándares</p>
                  </div>
                </div>
                <Button className="w-full">Crear Reporte Personalizado</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Water Bodies Comparison */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <Filter className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Comparativas</CardTitle>
                    <CardDescription>Entre cuerpos de agua</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm">Lago Central vs Río Norte</span>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm">Embalse Sur vs Laguna Este</span>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm">Análisis Regional</span>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Button className="w-full">Nueva Comparativa</Button>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-chart-4" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Exportación de Datos</CardTitle>
                    <CardDescription>Formatos abiertos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    XML
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    API
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última exportación</span>
                    <span className="font-medium">Hace 2 horas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registros disponibles</span>
                    <span className="font-medium">2.4M</span>
                  </div>
                </div>
                <Button className="w-full">Configurar Exportación</Button>
              </CardContent>
            </Card>

            {/* Quality Indicators Explanation */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="500">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Indicadores</CardTitle>
                    <CardDescription>Explicación y metodología</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">pH</span>
                      <span className="text-xs border border-border px-2 py-1 rounded">6.5-8.5</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Nivel de acidez del agua</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Oxígeno Disuelto</span>
                      <span className="text-xs border border-border px-2 py-1 rounded">&gt;5 mg/L</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Concentración de O₂ en agua</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Turbidez</span>
                      <span className="text-xs border border-border px-2 py-1 rounded">&lt;4 NTU</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Claridad del agua</p>
                  </div>
                </div>
                <Button className="w-full">Ver Guía Completa</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
