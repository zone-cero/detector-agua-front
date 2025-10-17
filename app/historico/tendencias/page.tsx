"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ImageRecord {
  id: number
  ecosystem: number
  image: string
  capture_date: string
  vegetation_percentage: number
  water_percentage: number
}

const API_IMAGES = "https://sistemahidalgodroneva.site/api/monitoring/images/"

export default function TendenciasPage() {
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setImages(data)
      } catch (e) {
        setError("Error al obtener los datos. Verifique la conexión con la API.")
        console.error("Error fetching data:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const analysisData = useMemo(() => {
    if (images.length === 0) return null

    // Sort by date
    const sorted = [...images].sort((a, b) => new Date(a.capture_date).getTime() - new Date(b.capture_date).getTime())

    // Group by month for trend chart
    const monthlyData = sorted.reduce(
      (acc, img) => {
        const date = new Date(img.capture_date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            vegetation: [],
            water: [],
            count: 0,
          }
        }

        acc[monthKey].vegetation.push(img.vegetation_percentage)
        acc[monthKey].water.push(img.water_percentage)
        acc[monthKey].count++

        return acc
      },
      {} as Record<string, { month: string; vegetation: number[]; water: number[]; count: number }>,
    )

    const chartData = Object.values(monthlyData).map((data) => ({
      month: data.month,
      vegetacion: (data.vegetation.reduce((a, b) => a + b, 0) / data.vegetation.length).toFixed(2),
      agua: (data.water.reduce((a, b) => a + b, 0) / data.water.length).toFixed(2),
      registros: data.count,
    }))

    // Calculate overall statistics
    const avgVegetation = images.reduce((sum, img) => sum + img.vegetation_percentage, 0) / images.length
    const avgWater = images.reduce((sum, img) => sum + img.water_percentage, 0) / images.length

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, midPoint)
    const secondHalf = sorted.slice(midPoint)

    const firstHalfVeg = firstHalf.reduce((sum, img) => sum + img.vegetation_percentage, 0) / firstHalf.length
    const secondHalfVeg = secondHalf.reduce((sum, img) => sum + img.vegetation_percentage, 0) / secondHalf.length
    const vegTrend = secondHalfVeg - firstHalfVeg

    const firstHalfWater = firstHalf.reduce((sum, img) => sum + img.water_percentage, 0) / firstHalf.length
    const secondHalfWater = secondHalf.reduce((sum, img) => sum + img.water_percentage, 0) / secondHalf.length
    const waterTrend = secondHalfWater - firstHalfWater

    // Find extremes
    const maxVeg = Math.max(...images.map((img) => img.vegetation_percentage))
    const minVeg = Math.min(...images.map((img) => img.vegetation_percentage))
    const maxWater = Math.max(...images.map((img) => img.water_percentage))
    const minWater = Math.min(...images.map((img) => img.water_percentage))

    return {
      chartData,
      avgVegetation,
      avgWater,
      vegTrend,
      waterTrend,
      maxVeg,
      minVeg,
      maxWater,
      minWater,
      totalRecords: images.length,
    }
  }, [images])

  const getTrendIcon = (trend: number) => {
    if (trend > 1) return <TrendingUp className="w-5 h-5 text-green-500" />
    if (trend < -1) return <TrendingDown className="w-5 h-5 text-red-500" />
    return <Minus className="w-5 h-5 text-yellow-500" />
  }

  const getTrendText = (trend: number) => {
    if (trend > 1) return "Tendencia al alza"
    if (trend < -1) return "Tendencia a la baja"
    return "Estable"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xl text-primary">Analizando tendencias...</p>
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

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">No hay datos suficientes para análisis</h2>
            <Link href="/historico">
              <Button>Volver a Histórico</Button>
            </Link>
          </div>
        </section>
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
                Análisis de <span className="text-primary">Tendencias</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Análisis detallado basado en {analysisData.totalRecords} registros de monitoreo
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Promedio Vegetación</CardDescription>
                <CardTitle className="text-3xl font-bold text-green-600">
                  {analysisData.avgVegetation.toFixed(2)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(analysisData.vegTrend)}
                  <span className="text-muted-foreground">{getTrendText(analysisData.vegTrend)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Promedio Agua</CardDescription>
                <CardTitle className="text-3xl font-bold text-blue-600">{analysisData.avgWater.toFixed(2)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(analysisData.waterTrend)}
                  <span className="text-muted-foreground">{getTrendText(analysisData.waterTrend)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rango Vegetación</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {analysisData.minVeg.toFixed(1)}% - {analysisData.maxVeg.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Variación: {(analysisData.maxVeg - analysisData.minVeg).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rango Agua</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {analysisData.minWater.toFixed(1)}% - {analysisData.maxWater.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Variación: {(analysisData.maxWater - analysisData.minWater).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif font-bold">Tendencia Temporal</CardTitle>
              <CardDescription>Evolución mensual de cobertura de vegetación y agua</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analysisData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vegetacion" stroke="#22c55e" strokeWidth={2} name="Vegetación (%)" />
                  <Line type="monotone" dataKey="agua" stroke="#3b82f6" strokeWidth={2} name="Agua (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-bold">Registros por Mes</CardTitle>
              <CardDescription>Cantidad de mediciones realizadas cada mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="registros" fill="#8b5cf6" name="Registros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
