"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { ArrowLeft, Camera, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ImageRecord {
  id: number
  ecosystem: number
  image: string
  capture_date: string
  vegetation_percentage: number
  water_percentage: number
}

const API_IMAGES = "https://sistemahidalgodroneva.site/api/monitoring/images/"

export default function GaleriaPage() {
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(API_IMAGES)
        if (!response.ok) {
          throw new Error("Fallo al cargar las imágenes.")
        }
        const data: ImageRecord[] = await response.json()
        // Sort by date descending (most recent first)
        const sorted = data.sort((a, b) => new Date(b.capture_date).getTime() - new Date(a.capture_date).getTime())
        setImages(sorted)
      } catch (e) {
        setError("Error al obtener los datos. Verifique la conexión con la API.")
        console.error("Error fetching data:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePrevImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    setSelectedImage(images[prevIndex])
  }

  const handleNextImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    setSelectedImage(images[nextIndex])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xl text-primary">Cargando galería...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Header />
        <div className="container mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">¡Error de Carga! 😔</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Intentar de Nuevo
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
            <Link href="/historico" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Histórico
            </Link>
            <div className="text-center">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-foreground mb-6">
                Galería <span className="text-primary">Fotográfica</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {images.length} imágenes de monitoreo disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {images.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No hay imágenes disponibles aún.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedImage(image)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                      <img
                        src={image.image || "/placeholder.svg"}
                        alt={`Ecosistema ${image.ecosystem} - ${new Date(image.capture_date).toLocaleDateString("es-ES")}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Eco: {image.ecosystem}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(image.capture_date).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          🌿 {image.vegetation_percentage.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          💧 {image.water_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              handlePrevImage()
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              handleNextImage()
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image || "/placeholder.svg"}
              alt={`Ecosistema ${selectedImage.ecosystem}`}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 bg-background/95 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-xl">Ecosistema {selectedImage.ecosystem}</h3>
                <Badge>ID: {selectedImage.id}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fecha de captura</p>
                  <p className="font-medium">
                    {new Date(selectedImage.capture_date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cobertura Vegetación</p>
                  <p className="font-medium text-green-600">{selectedImage.vegetation_percentage.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cobertura Agua</p>
                  <p className="font-medium text-blue-600">{selectedImage.water_percentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
