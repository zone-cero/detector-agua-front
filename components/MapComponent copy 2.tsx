'use client'

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, FeatureGroup, useMap, LayersControl, Marker, Popup, Polygon } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import L from "leaflet"
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Download,
  Save,
  MapPin,
  Navigation,
  Minimize2,
  Maximize2,
  History,
  BarChart3,
  Calendar,
  X,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Layers,
} from "lucide-react"
import toast from "react-hot-toast"

import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-geosearch/dist/geosearch.css"

// Corrige íconos rotos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const ReferenceIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// Interfaces
interface GeoSearchProps {
  onLocationFound: (label: string) => void
}

interface ClickHandlerProps {
  isSelecting: boolean
  onMapClick: (latlng: L.LatLng) => void
}

interface MapToolsProps {
  onExport: () => void
  onSave: () => void
  onTogglePointSelection: () => void
  onShowHistory: () => void
  isSelectingPoint: boolean
  locationName: string
  referenceMarker: L.LatLng | null
  drawnItemsCount: number
  isMinimized: boolean
  onToggleMinimize: () => void
  hasHistory: boolean
  ecosystems: Ecosystem[]
  selectedEcosystem: Ecosystem | null
  onEcosystemSelect: (ecosystem: Ecosystem) => void
}

interface AnalysisRecord {
  id: string
  date: string
  locationName: string
  coordinates: [number, number]
  waterPercentage: number
  vegetationPercentage: number
  waterArea: number
  vegetationArea: number
  turbidity?: number
  ndvi?: number
  biodiversity?: number
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  locationName: string
  referenceMarker: L.LatLng | null
  historyData: AnalysisRecord[]
}

interface Ecosystem {
  id: number
  name: string
  location: string | null
  created_at: string
}

interface ImageResult {
  id: number
  ecosystem?: number
  image: string
  description: string
  metadata: {
    resolution_m_per_px: number
  }
  vegetation_percentage: number
  vegetation_area_m2: number
  water_percentage: number
  water_area_m2: number
  is_adjusted: boolean
  parent_image: number | null
  adjusted_images: number[]
  capture_date?: string
}

// NUEVO: Componente MapController para centrar automáticamente
interface MapControllerProps {
  selectedEcosystem: Ecosystem | null
}

const MapController: React.FC<MapControllerProps> = ({ selectedEcosystem }) => {
  const map = useMap()

  useEffect(() => {
    if (selectedEcosystem?.location) {
      const geoJSON = wktToGeoJSON(selectedEcosystem.location)
      
      if (geoJSON) {
        if (geoJSON.type === "Polygon") {
          // Para polígonos, calcular bounds y centrar
          const coordinates = geoJSON.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])
          const bounds = L.latLngBounds(coordinates)
          map.fitBounds(bounds, { padding: [20, 20] })
          
          toast.success(`Centrando en ${selectedEcosystem.name}`, { 
            icon: "🗺️",
            duration: 2000 
          })
        } else if (geoJSON.type === "Point") {
          // Para puntos, centrar en el punto
          const [lng, lat] = geoJSON.coordinates
          map.setView([lat, lng], 15)
          
          toast.success(`Centrando en ${selectedEcosystem.name}`, { 
            icon: "📍",
            duration: 2000 
          })
        }
      }
    }
  }, [selectedEcosystem, map])

  return null
}

const generateMockHistory = (locationName: string, coordinates: [number, number]): AnalysisRecord[] => {
  const baseDate = new Date()
  const records: AnalysisRecord[] = []

  for (let i = 0; i < 6; i++) {
    const date = new Date(baseDate)
    date.setMonth(date.getMonth() - i)

    // Variación realista en los porcentajes
    const baseWater = 65 + (Math.random() * 20 - 10)
    const baseVegetation = 25 + (Math.random() * 15 - 7.5)

    records.push({
      id: `analysis-${i}`,
      date: date.toISOString().split("T")[0],
      locationName,
      coordinates,
      waterPercentage: Math.max(0, Math.min(100, baseWater)),
      vegetationPercentage: Math.max(0, Math.min(100, baseVegetation)),
      waterArea: Math.round((baseWater / 100) * 10000 + Math.random() * 5000),
      vegetationArea: Math.round((baseVegetation / 100) * 5000 + Math.random() * 2000),
      turbidity: Math.round((Math.random() * 50 + 10) * 10) / 10,
      ndvi: Math.round((Math.random() * 0.6 + 0.2) * 100) / 100,
      biodiversity: Math.round((Math.random() * 70 + 30) * 10) / 10,
    })
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const SimpleChart: React.FC<{ data: AnalysisRecord[] }> = ({ data }) => {
  const [animated, setAnimated] = useState(false)
  const maxValue = 100
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-48 bg-slate-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md border border-slate-200">
      <div className="text-sm font-semibold mb-3 text-slate-700">Evolución de Cobertura Vegetal</div>
      <div className="flex items-end justify-between h-32 gap-2">
        {sortedData.map((record, index) => {
          const targetHeight = (record.vegetationPercentage / maxValue) * 100
          const height = animated ? targetHeight : 0

          return (
            <div
              key={record.id}
              className="flex flex-col items-center flex-1 transition-all duration-1000 ease-out"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-1000 ease-out hover:from-emerald-700 hover:to-emerald-500 cursor-pointer relative group"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10">
                  {record.vegetationPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {new Date(record.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, locationName, referenceMarker, historyData }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (historyData.length > 0) {
      setSelectedAnalysis(historyData[0]) // Selecciona el más reciente por defecto
    }
  }, [historyData])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleClose])

  if (!isOpen && !isClosing) return null

  return (
    // Fondo completamente transparente, z-index [9999]
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ${
        isClosing ? "bg-black/0" : "bg-black/40"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose() // Cierra al hacer clic en el fondo
        }
      }}
    >
      <div
        // MODIFICACIÓN: max-w-4xl (más chico) y sombra más fuerte
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            {/* MODIFICACIÓN: Título más chico (text-xl) */}
            <h2 className="text-xl font-semibold text-slate-900">Historial de Análisis</h2>
            <p className="text-sm text-slate-600 mt-0.5">{locationName || "Ubicación sin nombre"}</p>
            {referenceMarker && (
              <p className="text-xs text-slate-500 mt-0.5">
                {referenceMarker.lat.toFixed(5)}, {referenceMarker.lng.toFixed(5)}
              </p>
            )}
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-80px)]">
          <div className="lg:col-span-2 p-6 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="mb-6">
              <SimpleChart data={historyData} />
            </div>

            <div className="space-y-3">
              {" "}
              {/* Espaciado reducido a space-y-3 */}
              {/* MODIFICACIÓN: Subtítulo más chico (text-lg) */}
              <h3 className="text-base font-semibold text-slate-800 mb-4">Registros de Análisis</h3>
              {historyData.map((record) => (
                <Card
                  key={record.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedAnalysis?.id === record.id
                      ? "ring-2 ring-blue-500 shadow-md bg-blue-50"
                      : "hover:ring-1 hover:ring-slate-300 bg-white"
                  }`}
                  onClick={() => setSelectedAnalysis(record)}
                >
                  <CardContent className="p-4">
                    {" "}
                    {/* Padding reducido a p-3 */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 transition-colors duration-300 group">
                          <Calendar className="h-4 w-4 text-slate-500" /> {/* Ícono más chico */}
                          <span className="font-medium text-sm text-slate-900">
                            {" "}
                            {/* Texto más chico */}
                            {new Date(record.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {" "}
                          {/* Texto y gap más chicos */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 transition-colors duration-300 hover:text-blue-700">
                              <div className="w-3 h-3 bg-blue-500 rounded-full transition-all duration-300 hover:scale-125"></div>{" "}
                              {/* Punto más chico */}
                              <span className="text-slate-600">
                                Agua: <strong className="text-slate-900">{record.waterPercentage.toFixed(1)}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 transition-colors duration-300 hover:text-green-700">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full transition-all duration-300 hover:scale-125"></div>{" "}
                              {/* Punto más chico */}
                              <span className="text-slate-600">
                                Vegetación:{" "}
                                <strong className="text-slate-900">{record.vegetationPercentage.toFixed(1)}%</strong>
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-slate-600 transition-colors duration-300 hover:text-gray-800">
                            <div>
                              Área agua:{" "}
                              <strong className="text-slate-900">{record.waterArea.toLocaleString()} m²</strong>
                            </div>
                            <div>
                              Área vegetación:{" "}
                              <strong className="text-slate-900">{record.vegetationArea.toLocaleString()} m²</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant={record.vegetationPercentage > 30 ? "default" : "destructive"} className="text-xs">
                        {record.vegetationPercentage > 30 ? "Saludable" : "En riesgo"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto bg-white">
            {" "}
            {/* Padding reducido a p-4 */}
            {/* MODIFICACIÓN: Subtítulo más chico (text-lg) */}
            <h3 className="text-base font-semibold mb-4 text-slate-800">Detalles del Análisis</h3>
            {selectedAnalysis ? (
              <div className="space-y-4">
                {" "}
                {/* Espaciado reducido a space-y-4 */}
                <Card className="border-slate-200">
                  <CardHeader className="bg-slate-50 rounded-t-lg p-4 border-b border-slate-200">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-800">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedAnalysis.date).toLocaleDateString("es-ES")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {" "}
                    {/* Padding y espaciado reducidos */}
                    {/* Porcentajes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-700">
                          {" "}
                          {/* Texto más chico */}
                          {selectedAnalysis.waterPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-600 mt-1">Cobertura de Agua</div> {/* Texto más chico */}
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-700">
                          {" "}
                          {/* Texto más chico */}
                          {selectedAnalysis.vegetationPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">Cobertura Vegetal</div> {/* Texto más chico */}
                      </div>
                    </div>
                    {/* Áreas */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-slate-700">Áreas Calculadas</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {" "}
                        {/* Texto más chico */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="font-medium text-slate-600">Agua</div>
                          <div className="text-slate-900 font-semibold mt-1">
                            {selectedAnalysis.waterArea.toLocaleString()} m²
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="font-medium text-slate-600">Vegetación</div>
                          <div className="text-slate-900 font-semibold mt-1">
                            {selectedAnalysis.vegetationArea.toLocaleString()} m²
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Métricas adicionales */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-slate-700">Métricas de Calidad</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {" "}
                        {/* Texto más chico */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="font-medium text-slate-600">Turbidez</div>
                          <div className="text-slate-900 font-semibold mt-1">{selectedAnalysis.turbidity} NTU</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="font-medium text-slate-600">Índice NDVI</div>
                          <div className="text-slate-900 font-semibold mt-1">{selectedAnalysis.ndvi}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg col-span-2 border border-slate-200">
                          <div className="font-medium text-slate-600">Biodiversidad</div>
                          <div className="text-slate-900 font-semibold mt-1">{selectedAnalysis.biodiversity}%</div>
                        </div>
                      </div>
                    </div>
                    {/* Estado de salud */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold mb-2 text-sm text-slate-800">Estado del Ecosistema</h4>
                      <Badge
                        variant={selectedAnalysis.vegetationPercentage > 30 ? "default" : "destructive"}
                        className="text-xs mb-2"
                      >
                        {selectedAnalysis.vegetationPercentage > 30 ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Ecosistema saludable
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Ecosistema en riesgo
                          </span>
                        )}
                      </Badge>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedAnalysis.vegetationPercentage > 30
                          ? "La cobertura vegetal se mantiene en niveles adecuados para la salud del ecosistema."
                          : "Se recomienda monitoreo continuo y acciones de conservación."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                {" "}
                {/* Padding vertical reducido */}
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" /> {/* Ícono más chico */}
                <p className="text-sm text-slate-500">Selecciona un análisis para ver los detalles</p>{" "}
                {/* Texto más chico */}
                <ChevronLeft className="h-5 w-5 mx-auto mt-2 animate-pulse text-slate-400" /> {/* Ícono más chico */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const MapTools: React.FC<MapToolsProps> = ({
  onExport,
  onSave,
  onTogglePointSelection,
  onShowHistory,
  isSelectingPoint,
  locationName,
  referenceMarker,
  drawnItemsCount,
  isMinimized,
  onToggleMinimize,
  hasHistory,
  ecosystems,
  selectedEcosystem,
  onEcosystemSelect,
}) => {
  // Los controles del mapa (L.Control) suelen usar z-index 400 o superior.
  // Mantenemos las herramientas del mapa en 401 para que estén por encima del mapa base,
  // pero el modal de historial estará en 9999.
  if (isMinimized) {
    return (
      <Card className="absolute top-4 right-4 z-[401] w-14 shadow-lg border-slate-200">
        <CardContent className="p-2">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onToggleMinimize}
                    size="icon"
                    variant="ghost"
                    className="w-full h-10 hover:bg-slate-100"
                  >
                    <Maximize2 className="h-4 w-4 text-slate-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Expandir herramientas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onExport}
                    size="icon"
                    variant="ghost"
                    className="w-full h-10 hover:bg-slate-100"
                    disabled={drawnItemsCount === 0}
                  >
                    <Download className="h-4 w-4 text-slate-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Exportar GeoJSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onTogglePointSelection}
                    size="icon"
                    variant={isSelectingPoint ? "default" : "ghost"}
                    className={`w-full h-10 ${
                      isSelectingPoint ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Referenciar Punto</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onShowHistory}
                    size="icon"
                    variant={hasHistory ? "default" : "ghost"}
                    className={`w-full h-10 ${
                      hasHistory ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100"
                    }`}
                    disabled={!hasHistory}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Ver historial</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Badge de contador en versión minimizada */}
            {drawnItemsCount > 0 && (
              <div className="flex justify-center">
                <Badge variant="default" className="h-6 w-6 p-0 text-xs flex items-center justify-center bg-blue-600">
                  {drawnItemsCount}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="absolute top-4 right-4 z-[401] w-80 shadow-lg border-slate-200 bg-white">
      <CardHeader className="pb-3 bg-slate-50 rounded-t-lg border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
            <Navigation className="h-4 w-4" />
            Herramientas del Mapa
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleMinimize}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-slate-200 rounded-full"
                >
                  <Minimize2 className="h-4 w-4 text-slate-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimizar herramientas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
            <Layers className="h-3 w-3" />
            Ecosistemas Disponibles
          </label>
          <select
            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedEcosystem?.id || ""}
            onChange={(e) => {
              const ecosystem = ecosystems.find((eco) => eco.id === Number.parseInt(e.target.value))
              if (ecosystem) onEcosystemSelect(ecosystem)
            }}
          >
            <option value="">Seleccionar ecosistema...</option>
            {ecosystems.map((eco) => (
              <option key={eco.id} value={eco.id}>
                {eco.name} (ID: {eco.id})
              </option>
            ))}
          </select>
        </div>

        {/* Información de ubicación */}
        {(locationName || referenceMarker) && (
          <div className="text-xs space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-medium text-slate-700">Ubicación seleccionada:</div>
            {locationName && (
              <div className="text-slate-900 font-semibold truncate" title={locationName}>
                {locationName}
              </div>
            )}
            {referenceMarker && (
              <div className="text-xs text-slate-600 font-mono text-[11px]">
                {referenceMarker.lat.toFixed(5)}, {referenceMarker.lng.toFixed(5)}
              </div>
            )}
          </div>
        )}

        {/* Contador de elementos dibujados */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-600">Elementos dibujados:</span>
          <Badge variant={drawnItemsCount > 0 ? "default" : "secondary"} className="bg-blue-600">
            {drawnItemsCount}
          </Badge>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onExport}
                  size="sm"
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50 bg-transparent"
                  disabled={drawnItemsCount === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar GeoJSON</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSave}
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={drawnItemsCount === 0}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar datos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Botón de selección de punto */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onTogglePointSelection}
                  size="sm"
                  variant={isSelectingPoint ? "default" : "outline"}
                  className={`w-full ${
                    isSelectingPoint ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {isSelectingPoint ? "Seleccionando..." : "Referenciar"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Haz clic en el mapa para obtener referencia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Botón de historial */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onShowHistory}
                  size="sm"
                  variant={hasHistory ? "default" : "outline"}
                  className={`w-full ${
                    hasHistory ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-300 hover:bg-slate-50"
                  }`}
                  disabled={!hasHistory}
                >
                  <History className="h-4 w-4 mr-1" />
                  Historial
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver historial de análisis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Instrucciones */}
        <div className="text-xs text-slate-600 pt-3 border-t border-slate-200">
          <div className="font-medium mb-2 text-slate-700">Instrucciones:</div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Usa el buscador para ubicaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Dibuja polígonos con herramientas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Referencia puntos con el botón</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Consulta el historial de análisis</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para el control de búsqueda
const GeoSearch: React.FC<GeoSearchProps> = ({ onLocationFound }) => {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider()
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: true,
      autoClose: true,
      keepResult: true,
      searchLabel: "Buscar dirección o lugar...",
    })

    map.addControl(searchControl)

    const handleLocationFound = (result: any) => {
      if (result.location && result.location.label) {
        onLocationFound(result.location.label)
        // Opcional: Centrar el mapa en el resultado de la búsqueda
        map.flyTo([result.location.y, result.location.x], 13)
      }
    }

    map.on("geosearch/showlocation", handleLocationFound)

    return () => {
      map.removeControl(searchControl)
      map.off("geosearch/showlocation", handleLocationFound)
    }
  }, [map, onLocationFound])

  return null
}

// Componente para manejar clics en el mapa
const ClickHandler: React.FC<ClickHandlerProps> = ({ isSelecting, onMapClick }) => {
  const map = useMap()

  useEffect(() => {
    // Si isSelecting es true, el cursor cambia
    map.getContainer().style.cursor = isSelecting ? "crosshair" : "grab" // CAMBIO: Usar 'grab' para más seguridad y consistencia

    if (isSelecting) {
      const handler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng)
        map.getContainer().style.cursor = "grab" // Restaura el cursor después del clic
      }
      map.on("click", handler)

      return () => {
        map.off("click", handler)
      }
    }
    // Asegura que el cursor se restablezca si se detiene la selección de puntos de otra manera
    return () => {
      map.getContainer().style.cursor = "grab"
    }
  }, [isSelecting, map, onMapClick])

  return null
}

// Componente para la configuración de EditControl
const DrawControl: React.FC<{ featureGroupRef: React.RefObject<L.FeatureGroup> }> = ({ featureGroupRef }) => {
  // const map = useMap(); // No se usa `map` aquí directamente

  const _onCreated = (e: any) => {
    const { layerType } = e
    // Agrega la capa al FeatureGroup
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(e.layer)

      // Opcional: Notificación
      toast.success(`Se ha dibujado un ${layerType}`, {
        icon: "🗺️",
      })
    }
  }

  const _onDeleted = (e: any) => {
    // Opcional: Notificación
    toast.error(`${Object.keys(e.layers._layers).length} elemento(s) eliminado(s)`, {
      icon: "🗑️",
    })
  }

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topleft"
        onCreated={_onCreated}
        onDeleted={_onDeleted}
        draw={{
          polyline: {
            shapeOptions: { color: "#3b82f6" }, // Tailwind blue-500
          },
          polygon: {
            allowIntersection: false,
            shapeOptions: { color: "#3b82f6" },
          },
          circle: true,
          rectangle: {
            shapeOptions: { color: "#3b82f6" },
          },
          marker: true,
          circlemarker: false,
        }}
        edit={{
          featureGroup: featureGroupRef.current || undefined,
          remove: true,
        }}
      />
    </FeatureGroup>
  )
}

const wktToGeoJSON = (wkt: string): any => {
  if (!wkt) return null

  try {
    const cleanWkt = wkt.replace("SRID=4326;", "")

    if (cleanWkt.startsWith("POLYGON")) {
      const coordsMatch = cleanWkt.match(/POLYGON\s*\(\((.*)\)\)/)
      if (coordsMatch) {
        const coordsStr = coordsMatch[1]
        const points = coordsStr.split(",").map((coord) => {
          const [lng, lat] = coord.trim().split(" ").map(Number)
          return [lng, lat]
        })

        return {
          type: "Polygon",
          coordinates: [points],
        }
      }
    }

    if (cleanWkt.startsWith("POINT")) {
      const coordsMatch = cleanWkt.match(/POINT\s*\((.*)\)/)
      if (coordsMatch) {
        const [lng, lat] = coordsMatch[1].split(" ").map(Number)
        return {
          type: "Point",
          coordinates: [lng, lat],
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error parsing WKT:", error)
    return null
  }
}

const geoJSONToWKT = (geoJSON: any): string => {
  if (!geoJSON) return ""

  try {
    if (geoJSON.type === "Polygon") {
      const coords = geoJSON.coordinates[0]
      const points = coords.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(", ")
      return `SRID=4326;POLYGON ((${points}))`
    }

    if (geoJSON.type === "Point") {
      const [lng, lat] = geoJSON.coordinates
      return `SRID=4326;POINT (${lng} ${lat})`
    }

    return ""
  } catch (error) {
    console.error("Error converting to WKT:", error)
    return ""
  }
}

const EcosystemPolygons: React.FC<{
  ecosystems: Ecosystem[]
  onPolygonClick: (ecosystem: Ecosystem) => void
}> = ({ ecosystems, onPolygonClick }) => {
  return (
    <>
      {ecosystems.map((eco) => {
        if (!eco.location) return null

        const geoJSON = wktToGeoJSON(eco.location)
        if (!geoJSON || geoJSON.type !== "Polygon") return null

        return (
          <Polygon
            key={eco.id}
            positions={geoJSON.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.2,
              weight: 2,
            }}
            eventHandlers={{
              click: () => {
                onPolygonClick(eco)
              },
              mouseover: (e) => {
                e.target.setStyle({
                  fillOpacity: 0.4,
                  weight: 3,
                })
              },
              mouseout: (e) => {
                e.target.setStyle({
                  fillOpacity: 0.2,
                  weight: 2,
                })
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-slate-900 mb-1">{eco.name}</div>
                <div className="text-xs text-slate-600">ID: {eco.id}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Creado: {new Date(eco.created_at).toLocaleDateString("es-ES")}
                </div>
                <button
                  onClick={() => onPolygonClick(eco)}
                  className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Polygon>
        )
      })}
    </>
  )
}

const MapComponent: React.FC = () => {
  const [locationName, setLocationName] = useState("")
  const [referenceMarker, setReferenceMarker] = useState<L.LatLng | null>(null)
  const [isSelectingPoint, setIsSelectingPoint] = useState(false)
  const [drawnItemsCount, setDrawnItemsCount] = useState(0)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const featureGroupRef = useRef<L.FeatureGroup>(null)
  const [historyData, setHistoryData] = useState<AnalysisRecord[]>([])

  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [selectedEcosystem, setSelectedEcosystem] = useState<Ecosystem | null>(null)
  const [isLoadingEcosystems, setIsLoadingEcosystems] = useState(true)

  useEffect(() => {
    const fetchEcosystems = async () => {
      try {
        setIsLoadingEcosystems(true)
        const response = await fetch("https://sistemahidalgodroneva.site/api/monitoring/ecosystems/")

        if (response.ok) {
          const data = await response.json()
          setEcosystems(data)
          
          // NUEVO: Seleccionar automáticamente el primer ecosistema al cargar
          if (data.length > 0) {
            setSelectedEcosystem(data[0])
          }
          
          toast.success(`${data.length} ecosistemas cargados`, { icon: "🌍" })
        } else {
          throw new Error("Error al cargar ecosistemas")
        }
      } catch (error) {
        console.error("[v0] Error fetching ecosystems:", error)
        toast.error("Error al cargar ecosistemas desde la API", { icon: "❌" })
      } finally {
        setIsLoadingEcosystems(false)
      }
    }

    fetchEcosystems()
  }, [])

  // Efecto para simular la carga del historial al establecer la referencia
  useEffect(() => {
    if (referenceMarker) {
      const mockData = generateMockHistory(locationName || "Punto de Referencia", [
        referenceMarker.lat,
        referenceMarker.lng,
      ])
      setHistoryData(mockData)
    } else {
      setHistoryData([])
    }
  }, [referenceMarker, locationName])

  const updateDrawnItemsCount = useCallback(() => {
    if (featureGroupRef.current) {
      setDrawnItemsCount(featureGroupRef.current.getLayers().length)
    }
  }, [])

  const handleCreated = useCallback(
    (e: any) => {
      updateDrawnItemsCount()
    },
    [updateDrawnItemsCount],
  )

  const handleEdited = useCallback((e: any) => {
    // Si necesitas lógica de edición
  }, [])

  const handleDeleted = useCallback(
    (e: any) => {
      updateDrawnItemsCount()
    },
    [updateDrawnItemsCount],
  )

  useEffect(() => {
    const group = featureGroupRef.current
    if (group) {
      group.on(L.Draw.Event.CREATED, handleCreated)
      group.on(L.Draw.Event.EDITED, handleEdited)
      group.on(L.Draw.Event.DELETED, handleDeleted)
    }
    return () => {
      if (group) {
        group.off(L.Draw.Event.CREATED, handleCreated)
        group.off(L.Draw.Event.EDITED, handleEdited)
        group.off(L.Draw.Event.DELETED, handleDeleted)
      }
    }
  }, [handleCreated, handleEdited, handleDeleted])

  const handleExport = () => {
    if (featureGroupRef.current) {
      const geoJson = featureGroupRef.current.toGeoJSON()
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJson))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "map_export.geojson")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
      toast.success("GeoJSON exportado correctamente", { icon: "✅" })
    }
  }

  const handleSave = async () => {
    if (!referenceMarker) {
      toast.error("Selecciona un punto de referencia antes de guardar", { icon: "📍" })
      return
    }

    if (!selectedEcosystem) {
      toast.error("Selecciona un ecosistema antes de guardar", { icon: "🌍" })
      return
    }

    try {
      const pointWKT = geoJSONToWKT({
        type: "Point",
        coordinates: [referenceMarker.lng, referenceMarker.lat],
      })

      const response = await fetch(
        `https://sistemahidalgodroneva.site/api/monitoring/ecosystems/${selectedEcosystem.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: pointWKT,
          }),
        },
      )

      if (response.ok) {
        toast.success(`Ubicación guardada para ${selectedEcosystem.name}`, { icon: "💾" })
      } else {
        throw new Error("Error al guardar")
      }
    } catch (error) {
      console.error("[v0] Error saving location:", error)
      toast.error("Error al guardar la ubicación", { icon: "❌" })
    }
  }

  const handleTogglePointSelection = () => {
    setIsSelectingPoint((prev) => !prev)
    if (!isSelectingPoint) {
      toast("Haz clic en el mapa para seleccionar un punto", { icon: "👆" })
    }
  }

  const handleMapClick = (latlng: L.LatLng) => {
    setReferenceMarker(latlng)
    setIsSelectingPoint(false)
    toast.success("Punto de referencia establecido", { icon: "📍" })
  }

  const handleLocationFound = (label: string) => {
    setLocationName(label)
    // Asume que si se busca, se establece un punto de referencia simulado en el centro del mapa
    // En una aplicación real, usarías las coordenadas del resultado de la búsqueda
    setReferenceMarker(new L.LatLng(51.505, -0.09))
  }

  const handleShowHistory = () => {
    if (historyData.length > 0) {
      setIsHistoryModalOpen(true)
    } else {
      toast.error("No hay historial de análisis para esta ubicación", { icon: "📊" })
    }
  }

  // NUEVO: Función simplificada para seleccionar ecosistema
  const handleEcosystemSelect = (ecosystem: Ecosystem) => {
    setSelectedEcosystem(ecosystem)
    setLocationName(ecosystem.name)
    // El MapController se encargará automáticamente del centrado
  }

  const handlePolygonClick = async (ecosystem: Ecosystem) => {
    try {
      // Check if ecosystem has associated images/data
      const response = await fetch(
        `https://sistemahidalgodroneva.site/api/monitoring/images/?ecosystem=${ecosystem.id}`,
      )

      if (response.ok) {
        const images = await response.json()

        if (images && images.length > 0) {
          // Redirect to ecosystem detail page
          toast.success(`Redirigiendo a ${ecosystem.name}...`, { icon: "🔄" })
          setTimeout(() => {
            window.location.href = `/ecosistema/${ecosystem.id}`
          }, 500)
        } else {
          toast.error(`El ecosistema "${ecosystem.name}" no tiene datos disponibles`, {
            icon: "⚠️",
            duration: 4000,
          })
        }
      } else {
        toast.error(`No se pudo verificar los datos del ecosistema`, {
          icon: "❌",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("[v0] Error checking ecosystem data:", error)
      toast.error(`Error al verificar datos del ecosistema`, {
        icon: "❌",
        duration: 3000,
      })
    }
  }

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false} // Removed default zoom control to rely on custom ones or map interaction
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="🗺️ Mapa Estándar">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🛰️ Vista Satelital">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌍 Híbrido (Satélite + Nombres)">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* NUEVO: MapController para centrado automático */}
        <MapController selectedEcosystem={selectedEcosystem} />

        <GeoSearch onLocationFound={handleLocationFound} />
        <ClickHandler isSelecting={isSelectingPoint} onMapClick={handleMapClick} />
        <DrawControl featureGroupRef={featureGroupRef} />

        <EcosystemPolygons ecosystems={ecosystems} onPolygonClick={handlePolygonClick} />

        {/* Marcador de referencia */}
        {referenceMarker && (
          <Marker position={referenceMarker} icon={ReferenceIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-slate-900 mb-1">Punto de Referencia</div>
                {selectedEcosystem && (
                  <div className="text-xs text-slate-700 mb-1">Ecosistema: {selectedEcosystem.name}</div>
                )}
                <div className="text-xs text-slate-600 font-mono">
                  Lat: {referenceMarker.lat.toFixed(5)}
                  <br />
                  Lng: {referenceMarker.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Botonera de herramientas */}
        <MapTools
          onExport={handleExport}
          onSave={handleSave}
          onTogglePointSelection={handleTogglePointSelection}
          onShowHistory={handleShowHistory}
          isSelectingPoint={isSelectingPoint}
          locationName={locationName}
          referenceMarker={referenceMarker}
          drawnItemsCount={drawnItemsCount}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized((prev) => !prev)}
          hasHistory={historyData.length > 0}
          ecosystems={ecosystems}
          selectedEcosystem={selectedEcosystem}
          onEcosystemSelect={handleEcosystemSelect}
        />
      </MapContainer>

      {/* Modal de Historial */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        locationName={locationName}
        referenceMarker={referenceMarker}
        historyData={historyData}
      />

      {isLoadingEcosystems && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-[9999]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-700">Cargando ecosistemas...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent