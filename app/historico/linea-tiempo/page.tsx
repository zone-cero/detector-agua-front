"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { ArrowLeft, Calendar, Loader2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Ecosystem {
  id: number
  name: string
  location: string | null
  created_at: string
}

const API_ECOSYSTEMS = "https://sistemahidalgodroneva.site/api/monitoring/ecosystems/"

export default function LineaTiempoPage() {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(API_ECOSYSTEMS)
        if (!response.ok) {
          throw new Error("Fallo al cargar los ecosistemas.")
        }
        const data: Ecosystem[] = await response.json()
        // Sort by date descending (most recent first)
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setEcosystems(sorted)
      } catch (e) {
        setError("Error al obtener los datos. Verifique la conexión con la API.")
        console.error("Error fetching data:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xl text-primary">Cargando línea de tiempo...</p>
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
                Línea de <span className="text-primary">Tiempo</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Todos los ecosistemas registrados en orden cronológico
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {ecosystems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No hay ecosistemas registrados aún.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {ecosystems.map((ecosystem, index) => (
                  <div key={ecosystem.id} className="relative pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background" />

                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="font-serif font-bold text-xl mb-2">{ecosystem.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(ecosystem.created_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">ID: {ecosystem.id}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {ecosystem.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{ecosystem.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
