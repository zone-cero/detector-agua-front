"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Calendar, TrendingUp, Camera, ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"

interface Ecosystem {
  id: number
  name: string
  location: string | null
  created_at: string
}

interface ImageRecord {
  id: number
  ecosystem: number
  image: string
  capture_date: string
  vegetation_percentage: number
  water_percentage: number
}

const API_ECOSYSTEMS = "https://sistemahidalgodroneva.site/api/monitoring/ecosystems/"
const API_IMAGES = "https://sistemahidalgodroneva.site/api/monitoring/images/"

export default function HistoricoPage() {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initAOS = async () => {
      try {
        const AOS = (await import("aos")).default
        AOS.init({
          duration: 800,
          easing: "ease-out-cubic",
          once: true,
          offset: 100,
        })
      } catch (e) {
        console.error("Error loading AOS:", e)
      }
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ecosystemsRes, imagesRes] = await Promise.all([fetch(API_ECOSYSTEMS), fetch(API_IMAGES)])

        if (!ecosystemsRes.ok || !imagesRes.ok) {
          throw new Error("Fallo al cargar uno o más recursos de la API.")
        }

        const ecosystemsData: Ecosystem[] = await ecosystemsRes.json()
        const imagesData: ImageRecord[] = await imagesRes.json()

        setEcosystems(ecosystemsData)
        setImages(imagesData)
      } catch (e) {
        setError("Error al obtener los datos. Verifique la conexión con la API.")
        console.error("Error fetching data:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    initAOS()
  }, [])

  const processedData = useMemo(() => {
    // Los 3 ecosistemas más recientes (últimos creados)
    const recentEcosystems = ecosystems
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)

    // Las 12 imágenes más recientes (últimas tomas)
    const recentImages = images
      .slice()
      .sort((a, b) => new Date(b.capture_date).getTime() - new Date(a.capture_date).getTime())
      .slice(0, 12)

    const totalImages = images.length
    const avgVegetation =
      totalImages > 0 ? images.reduce((sum, img) => sum + img.vegetation_percentage, 0) / totalImages : 0
    const avgWater = totalImages > 0 ? images.reduce((sum, img) => sum + img.water_percentage, 0) / totalImages : 0

    return {
      recentEcosystems,
      recentImages,
      totalEcosystems: ecosystems.length,
      totalImages,
      avgVegetation: avgVegetation.toFixed(2),
      avgWater: avgWater.toFixed(2),
    }
  }, [ecosystems, images])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xl text-primary font-medium">Cargando datos históricos del sistema...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Header />
        <div className="container mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Error de Carga de Datos</h2> {/* Eliminado emoji */}
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Recargar Página
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-medium" // Añadido font-medium
              data-aos="fade-right"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Link>
            <div className="text-center">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-foreground mb-6" data-aos="fade-up">
                Monitoreo <span className="text-primary">Histórico</span>
              </h1> {/* Titulo simplificado */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                Revisión de la evolución del área de agua y vegetación en los ecosistemas a lo largo del tiempo.
              </p> {/* Descripción ajustada al contexto */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* CARD 1: Últimos Registros */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  
                  <div>
                    <CardTitle className="font-serif font-bold">Ecosistemas Recientes</CardTitle>
                    <CardDescription>Cuerpos de agua recién configurados para análisis.</CardDescription> {/* Descripción ajustada */}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {processedData.recentEcosystems.map((eco) => (
                    <div key={eco.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-primary">{eco.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de Creación: {new Date(eco.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Badge variant="secondary">ID: {eco.id}</Badge>
                    </div>
                  ))}
                  {processedData.totalEcosystems === 0 && (
                    <p className="text-center text-muted-foreground">No hay ecosistemas registrados en el sistema.</p>
                  )}
                </div>
                <Link href="/historico/linea-tiempo">
                  <Button className="w-full" disabled={processedData.totalEcosystems === 0}>
                    Ver Todos los Ecosistemas ({processedData.totalEcosystems} Registros)
                  </Button> {/* Texto más formal */}
                </Link>
              </CardContent>
            </Card>

            {/* CARD 2: Promedio Histórico */}
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  
                  <div>
                    <CardTitle className="font-serif font-bold">Métricas Históricas</CardTitle>
                    <CardDescription>Valores promedio de cobertura cuantificada.</CardDescription> {/* Descripción ajustada */}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Cobertura Vegetación */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Cobertura Vegetal (%)</p>
                      <p className="text-xs text-muted-foreground">Promedio en {processedData.totalImages} capturas</p> {/* Cambiado 'tomas' por 'capturas' */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-green-200 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${Math.min(100, Number.parseFloat(processedData.avgVegetation))}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">{processedData.avgVegetation}%</span>
                    </div>
                  </div>
                  {/* Cobertura Agua */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Área de Agua (%)</p>
                      <p className="text-xs text-muted-foreground">Promedio en {processedData.totalImages} capturas</p> {/* Cambiado 'tomas' por 'capturas' */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-blue-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, Number.parseFloat(processedData.avgWater))}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{processedData.avgWater}%</span>
                    </div>
                  </div>
                 
                </div>
                <Link href="/historico/tendencias">
                  <Button className="w-full">Revisar Tendencias y Comparativas</Button> {/* Texto más formal */}
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* CARD 3: Galería Fotográfica */}
          <div className="mb-12">
            <Card className="group hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-chart-3" />
                    </div>
                    <div>
                      <CardTitle className="font-serif font-bold">Registro de Capturas</CardTitle> {/* Título simplificado */}
                      <CardDescription>
                        Visualización del histórico de imágenes - {processedData.totalImages.toLocaleString()} capturas disponibles
                      </CardDescription> {/* Cambiado 'fotográfica' por 'capturas' y 'imágenes' por 'capturas' */}
                    </div>
                  </div>
                  <Link href="/historico/galeria">
                    <Button variant="outline" size="sm" disabled={processedData.totalImages === 0}>
                      Ver Galería
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {processedData.totalImages === 0 ? (
                  <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No se han cargado capturas de imágenes.</p> {/* Texto ajustado */}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {processedData.recentImages.map((img, index) => (
                      <div
                        key={img.id}
                        className={`relative rounded-lg overflow-hidden group/img hover:shadow-xl transition-all duration-300 ${
                          index === 0 ? "col-span-2 row-span-2" : ""
                        }`}
                      >
                        <div className={`${index === 0 ? "aspect-square" : "aspect-[4/3]"} bg-muted`}>
                          <img
                            src={img.image || "/placeholder.svg"}
                            alt={`Ecosistema ${img.ecosystem} - ${new Date(img.capture_date).toLocaleDateString()}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <p className="text-xs font-medium mb-1">ID Ecosistema: {img.ecosystem}</p> {/* Etiqueta más formal */}
                            <div className="flex items-center gap-2 text-xs">
                              {/* Eliminados emojis de los badges */}
                              <Badge className="bg-green-500/80 hover:bg-green-500">
                                Veg: {img.vegetation_percentage.toFixed(1)}%
                              </Badge>
                              <Badge className="bg-blue-500/80 hover:bg-blue-500">
                                Agua: {img.water_percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge className="absolute top-2 right-2 opacity-90" variant="secondary">
                          {new Date(img.capture_date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {Math.min(12, processedData.totalImages)} de {processedData.totalImages} capturas.
                  </p> {/* Texto ajustado */}
                  <Link href="/historico/galeria">
                    <Button disabled={processedData.totalImages === 0}>Explorar Galería Completa</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}