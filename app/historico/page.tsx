"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Calendar, TrendingUp, Camera, FileText, Database, Download, ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import Link from "next/link"

export default function HistoricoPage() {
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
                Sección <span className="text-primary">Histórico</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                Explora datos históricos, tendencias y reportes de calidad del agua a lo largo del tiempo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Timeline */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Línea de Tiempo</CardTitle>
                    <CardDescription>Eventos y mediciones históricas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Implementación de sensores IoT</p>
                      <p className="text-xs text-muted-foreground">Enero 2020</p>
                    </div>
                    <Badge variant="outline">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Expansión a 15 cuerpos de agua</p>
                      <p className="text-xs text-muted-foreground">Junio 2022</p>
                    </div>
                    <Badge variant="outline">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Integración con datos meteorológicos</p>
                      <p className="text-xs text-muted-foreground">Marzo 2024</p>
                    </div>
                    <Badge variant="secondary">Reciente</Badge>
                  </div>
                </div>
                <Button className="w-full">Ver Línea de Tiempo Completa</Button>
              </CardContent>
            </Card>

            {/* Quality Trends */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Tendencias de Calidad</CardTitle>
                    <CardDescription>Análisis de mejoras y deterioros</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">pH Estabilidad</p>
                      <p className="text-xs text-muted-foreground">87%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-green-200 rounded-full">
                        <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Oxígeno Disuelto</p>
                      <p className="text-xs text-muted-foreground">75%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-blue-200 rounded-full">
                        <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Turbidez Control</p>
                      <p className="text-xs text-muted-foreground">62%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-yellow-200 rounded-full">
                        <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">62%</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Analizar Tendencias Detalladas</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo Gallery */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Galería Fotográfica</CardTitle>
                    <CardDescription>Registro visual histórico</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">1,247 imágenes disponibles</p>
                <Button className="w-full">Ver Galería Completa</Button>
              </CardContent>
            </Card>

            {/* Annual Reports */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-chart-4" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Reportes Anuales</CardTitle>
                    <CardDescription>Documentos oficiales</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <span className="text-sm">Reporte 2024</span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <span className="text-sm">Reporte 2023</span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <span className="text-sm">Reporte 2022</span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <span className="text-sm">Reporte 2021</span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Button className="w-full">Acceder a Todos los Reportes</Button>
              </CardContent>
            </Card>

            {/* Open Data */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="500">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold">Datos Abiertos</CardTitle>
                    <CardDescription>Acceso público a información</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registros disponibles</span>
                    <span className="font-medium">2.4M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última actualización</span>
                    <span className="font-medium">Hoy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Formatos</span>
                    <span className="font-medium">CSV, JSON, XML</span>
                  </div>
                </div>
                <Button className="w-full">Descargar Datos Abiertos</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
