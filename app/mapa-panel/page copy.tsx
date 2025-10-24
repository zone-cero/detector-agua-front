

"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { Navigation, Minimize2, Maximize2, X, Clock, Calendar, Eye, Leaf, Droplets, MapPin, Layers, Search, Home, LogOut, Map, Plus } from "lucide-react"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-geosearch/dist/geosearch.css"

// Fix broken Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Interfaces
interface Ecosystem {
  id: number
  name: string
  location: string
  created_at: string
}

interface HistoricalImage {
  id: number
  ecosystem: number
  image: string
  description: string
  metadata: {
    resolution_m_per_px: number
  }
  capture_date: string
  vegetation_percentage: number
  vegetation_area_m2: number
  water_percentage: number
  water_area_m2: number
  is_adjusted: boolean
  parent_image: number | null
  adjusted_images: number[]
}

// Componente Modal de Historial
interface HistoryListModalProps {
  isOpen: boolean
  onClose: () => void
  historicalImages: HistoricalImage[]
  ecosystemName: string
  onViewDetail: (image: HistoricalImage) => void
  onCreateNewAnalysis: () => void
}

const HistoryListModal: React.FC<HistoryListModalProps> = ({
  isOpen,
  onClose,
  historicalImages,
  ecosystemName,
  onViewDetail,
  onCreateNewAnalysis,
}) => {
  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const sortedHistory = [...historicalImages].sort((a, b) => {
    const dateA = a.capture_date || ""
    const dateB = b.capture_date || ""
    return dateB.localeCompare(dateA)
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col z-[10050]">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Capturas: {ecosystemName}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 border-b border-gray-200 pb-4">
              Mostrando {historicalImages.length} capturas históricas encontradas para el ecosistema "{ecosystemName}".
              Las imágenes se listan de la más reciente a la más antigua.
            </p>

            {sortedHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2 text-gray-600">No se encontraron imágenes históricas</p>
                <p className="text-sm text-gray-500 mb-6">No hay capturas previas para este ecosistema.</p>
                <Button
                  onClick={onCreateNewAnalysis}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Nuevo Análisis
                </Button>
                <p className="text-xs text-gray-400 mt-4">
                  Comienza un nuevo análisis para el ecosistema "{ecosystemName}"
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {sortedHistory.map((image, index) => (
                  <div
                    key={image.id}
                    className="p-4 flex items-center justify-between border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                        <img
                          src={image.image || "/placeholder.svg"}
                          alt={`Captura ${image.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null
                              ; (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-image-off"><path d="M10.5 8.5h.01"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9c0-.6.4-1.2.9-1.6L4 4"/></svg>'
                          }}
                        />
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          Captura ID: {image.id}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              Reciente
                            </span>
                          )}
                        </div>
                        <p className="flex items-center text-gray-600 mt-1">
                          <Calendar className="w-3 h-3 mr-2" />
                          {formatDateForDisplay(image.capture_date)}
                        </p>
                        <p className="flex items-center text-green-700 mt-1">
                          <Leaf className="w-3 h-3 mr-2" />
                          Lirio: {image.vegetation_percentage?.toFixed(2)}%
                        </p>
                        <p className="flex items-center text-blue-700">
                          <Droplets className="w-3 h-3 mr-2" />
                          Agua: {image.water_percentage?.toFixed(2)}%
                        </p>
                        {image.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={image.description}>
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => onViewDetail(image)}
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente Modal de Detalle de Imagen
interface ImageDetailModalProps {
  isOpen: boolean
  onClose: () => void
  image: HistoricalImage | null
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  image,
}) => {
  if (!image) return null

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col z-[10050]">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle de Captura - ID: {image.id}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagen */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.image || "/placeholder.svg"}
                  alt={`Captura ${image.id}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null
                      ; (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-image-off"><path d="M10.5 8.5h.01"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9c0-.6.4-1.2.9-1.6L4 4"/></svg>'
                  }}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Haz clic en la imagen para verla en tamaño completo</p>
              </div>
            </div>

            {/* Información */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de la Captura</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">ID de Captura:</span>
                    <span className="text-sm text-gray-900 font-mono">#{image.id}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Fecha de Captura:</span>
                    <span className="text-sm text-gray-900">{formatDateForDisplay(image.capture_date)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Descripción:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">
                      {image.description || "Sin descripción"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Resolución:</span>
                    <span className="text-sm text-gray-900">
                      {image.metadata.resolution_m_per_px} m/px
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Cobertura de Lirio:
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      {image.vegetation_percentage?.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Área de Lirio:
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      {image.vegetation_area_m2?.toFixed(2)} m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Cobertura de Agua:
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {image.water_percentage?.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Área de Agua:
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {image.water_area_m2?.toFixed(2)} m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`text-sm font-semibold ${image.is_adjusted ? 'text-purple-700' : 'text-gray-700'}`}>
                      {image.is_adjusted ? 'Ajustada' : 'Original'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Resumen de Cobertura</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Lirio Acuático:</span>
                    <span className="font-semibold text-blue-900">{image.vegetation_percentage?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Agua:</span>
                    <span className="font-semibold text-blue-900">{image.water_percentage?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
                    <span className="text-blue-700 font-medium">Total Cobertura:</span>
                    <span className="font-semibold text-blue-900">
                      {(image.vegetation_percentage + image.water_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Áreas */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h4 className="text-sm font-semibold text-green-900 mb-3">Resumen de Áreas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Área de Lirio:</span>
                    <span className="font-semibold text-green-900">{image.vegetation_area_m2?.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Área de Agua:</span>
                    <span className="font-semibold text-green-900">{image.water_area_m2?.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-green-200 pt-2">
                    <span className="text-green-700 font-medium">Área Total:</span>
                    <span className="font-semibold text-green-900">
                      {(image.vegetation_area_m2 + image.water_area_m2).toFixed(2)} m²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Parse WKT POLYGON to Leaflet coordinates
const parseWKTPolygon = (wkt: string): [number, number][] | null => {
  try {
    const cleanWkt = wkt.toUpperCase().replace(/SRID=\d+;/, "")
    const match = cleanWkt.match(/POLYGON\s*\(\((.*?)\)\)/)

    if (!match) {
      console.error("WKT no tiene el formato esperado POLYGON ((...)): ", wkt)
      return null
    }

    const coordsString = match[1]
    const coords = coordsString.split(",").map((pair) => {
      const [lng, lat] = pair.trim().split(/\s+/).map(Number)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Coordenadas no numéricas detectadas.")
      }

      return [lat, lng] as [number, number]
    })

    return coords
  } catch (error) {
    console.error("Error al parsear WKT:", error)
    return null
  }
}

// Calculate center of polygon
const getPolygonCenter = (coords: [number, number][]): [number, number] => {
  const latSum = coords.reduce((sum, coord) => sum + coord[0], 0)
  const lngSum = coords.reduce((sum, coord) => sum + coord[1], 0)
  return [latSum / coords.length, lngSum / coords.length]
}

// Convert Leaflet polygon coordinates to WKT format
const convertToWKT = (geoJson: any): string | null => {
  try {
    const features = geoJson.features || []

    for (const feature of features) {
      if (feature.geometry.type === "Polygon") {
        const coordinates = feature.geometry.coordinates[0]
        const wktCoords = coordinates.map((coord: [number, number]) => `${coord[0]} ${coord[1]}`).join(", ")
        return `SRID=4326;POLYGON ((${wktCoords}))`
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error converting to WKT:", error)
    return null
  }
}

const GeoSearch: React.FC<{ onLocationFound: (label: string) => void }> = ({ onLocationFound }) => {
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

const DrawControl: React.FC<{ featureGroupRef: React.RefObject<L.FeatureGroup>; onCountUpdate: () => void }> = ({
  featureGroupRef,
  onCountUpdate,
}) => {
  const _onCreated = (e: any) => {
    const { layerType } = e
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(e.layer)
      onCountUpdate()
      toast.success(`Se ha dibujado un ${layerType}`, {
        icon: "🗺️",
      })
    }
  }

  const _onDeleted = (e: any) => {
    onCountUpdate()
    toast.error(`${Object.keys(e.layers._layers).length} elemento(s) eliminado(s)`, {
      icon: "🗑️",
    })
  }

  const _onEdited = (e: any) => {
    onCountUpdate()
  }

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topleft"
        onCreated={_onCreated}
        onDeleted={_onDeleted}
        onEdited={_onEdited}
        draw={{
          polyline: false,
          polygon: {
            allowIntersection: false,
            shapeOptions: { color: "#1a73e8" },
          },
          circle: false,
          rectangle: {
            shapeOptions: { color: "#1a73e8" },
          },
          marker: false,
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

const MapViewController: React.FC<{ center: [number, number] | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 })
    }
  }, [center, zoom, map])

  return null
}

// PhotoAnalyzer simple y directo - CORREGIDO
const PhotoAnalyzer = dynamic(() => import("@/components/photo-analyzer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  ),
})

const MapComponent: React.FC<{ onAnalyze?: (data: any) => void }> = ({ onAnalyze }) => {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [selectedEcosystem, setSelectedEcosystem] = useState<Ecosystem | null>(null)
  const [selectedPolygonCoords, setSelectedPolygonCoords] = useState<[number, number][] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [isLoadingEcosystems, setIsLoadingEcosystems] = useState(true)
  const [geocodedMarker, setGeocodedMarker] = useState<[number, number] | null>(null)

  const [locationName, setLocationName] = useState("")
  const [drawnItemsCount, setDrawnItemsCount] = useState(0)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const featureGroupRef = useRef<L.FeatureGroup>(null)

  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false)
  const [polygonDataForAnalysis, setPolygonDataForAnalysis] = useState<any>(null)

  // Estados para el historial - MODIFICADO: solo un modal activo a la vez
  const [activeModal, setActiveModal] = useState<'history' | 'imageDetail' | null>(null)
  const [selectedEcosystemForHistory, setSelectedEcosystemForHistory] = useState<Ecosystem | null>(null)
  const [historicalImages, setHistoricalImages] = useState<HistoricalImage[]>([])
  const [selectedImage, setSelectedImage] = useState<HistoricalImage | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // NUEVOS ESTADOS PARA LA ALERTA DE ELECCIÓN DE UBICACIÓN
  const [showLocationChoice, setShowLocationChoice] = useState(false)
  const [pendingAnalysisData, setPendingAnalysisData] = useState<any>(null)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Función para navegar al inicio
  const handleGoHome = () => {
    toast.success("Redirigiendo al inicio...", { icon: "🏠" })
  }

  // Función para el botón Referenciar
  const handleReferenceClick = () => {
    toast.success("Función de referenciar activada", { icon: "📍" })
  }

  // Función para crear nuevo análisis desde historial
  const handleCreateNewAnalysisFromHistory = () => {
    if (drawnItemsCount === 0 && locationName === "") {
      toast.error("Busca y selecciona una ubicación o dibuja un polígono para analizar", { icon: "⚠️" })
      return
    }

    if (featureGroupRef.current) {
      const geoJson = featureGroupRef.current.toGeoJSON()
      const wktLocation = convertToWKT(geoJson)

      const polygonData = {
        geoJson,
        locationName,
        location: wktLocation,
        drawnItemsCount,
      }

      setPolygonDataForAnalysis(polygonData)
      setIsAnalyzerModalOpen(true)
      setActiveModal(null) // Cerrar modal de historial
      toast.success("Abriendo formulario de análisis...", { icon: "🚀" })
    }
  }

  // Función para crear nuevo análisis
  const handleCreateNewAnalysis = () => {
    if (featureGroupRef.current) {
      const geoJson = featureGroupRef.current.toGeoJSON()
      const wktLocation = convertToWKT(geoJson)

      const polygonData = {
        geoJson,
        locationName: locationName || "Nueva Área de Análisis",
        location: wktLocation,
        drawnItemsCount,
      }

      setPolygonDataForAnalysis(polygonData)
      setIsAnalyzerModalOpen(true)
      toast.success("Creando nuevo análisis...", { icon: "🚀" })
    }
  }

  // NUEVAS FUNCIONES PARA MANEJAR LA ELECCIÓN DE UBICACIÓN
  const handleUseExistingLocation = () => {
    if (selectedEcosystem && selectedPolygonCoords) {
      // Usar las coordenadas del ecosistema seleccionado
      const existingPolygonData = {
        geoJson: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [selectedPolygonCoords.map(coord => [coord[1], coord[0]])] // Convertir a formato GeoJSON
              },
              properties: {}
            }
          ]
        },
        locationName: selectedEcosystem.name,
        location: selectedEcosystem.location,
        drawnItemsCount: 1,
        useExisting: true
      };
      
      setPolygonDataForAnalysis(existingPolygonData);
      setIsAnalyzerModalOpen(true);
      toast.success("Usando ubicación del ecosistema...", { icon: "📍" });
    }
    
    setShowLocationChoice(false);
    setPendingAnalysisData(null);
  };

  const handleUseNewLocation = () => {
    if (pendingAnalysisData) {
      setPolygonDataForAnalysis(pendingAnalysisData);
      setIsAnalyzerModalOpen(true);
      toast.success("Usando nueva ubicación dibujada...", { icon: "🆕" });
    }
    
    setShowLocationChoice(false);
    setPendingAnalysisData(null);
  };

  const handleCancelLocationChoice = () => {
    setShowLocationChoice(false);
    setPendingAnalysisData(null);
    toast.info("Selección cancelada", { icon: "❌" });
  };

  // Función para cargar todas las imágenes desde la API y filtrar por ecosistema
  const fetchAllImages = async (): Promise<HistoricalImage[]> => {
    try {
      setIsLoadingHistory(true)
      const response = await fetch(`https://sistemahidalgodroneva.site/api/monitoring/images/`)

      if (!response.ok) {
        throw new Error(`Error al cargar imágenes: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching all images:', error)
      throw error
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Función para manejar el clic en "Ver Historial"
  const handleViewHistory = async (ecosystemId: number) => {
    try {
      const ecosystem = ecosystems.find((eco) => eco.id === ecosystemId)
      if (!ecosystem) return

      setSelectedEcosystemForHistory(ecosystem)

      const allImages = await fetchAllImages()
      const filteredImages = allImages.filter(image => image.ecosystem === ecosystemId)

      setHistoricalImages(filteredImages)
      setActiveModal('history') // Solo abrir modal de historial

      toast.success(`Se encontraron ${filteredImages.length} imágenes para ${ecosystem.name}`, { icon: "📊" })
    } catch (error) {
      console.error("Error al cargar el historial:", error)
      toast.error("Error al cargar el historial de imágenes", { icon: "❌" })
    }
  }

  // Función para ver el detalle de una imagen histórica
  const handleViewHistoricalDetail = (image: HistoricalImage) => {
    setSelectedImage(image)
    setActiveModal('imageDetail') // Cambiar al modal de detalle
  }

  // Función para cerrar cualquier modal
  const closeAllModals = () => {
    setActiveModal(null)
    setSelectedImage(null)
  }

  useEffect(() => {
    const fetchEcosystems = async () => {
      setIsLoadingEcosystems(true)
      try {
        const response = await fetch("https://sistemahidalgodroneva.site/api/monitoring/ecosystems/")
        if (!response.ok) {
          throw new Error(`Failed to fetch ecosystems: ${response.statusText}`)
        }
        const data: Ecosystem[] = await response.json()
        setEcosystems(data)
        toast.success(`${data.length} ecosistemas cargados`, { icon: "🌍" })
      } catch (error) {
        console.error("Error fetching ecosystems:", error)
        toast.error("Error al cargar ecosistemas desde la API", { icon: "❌" })
      } finally {
        setIsLoadingEcosystems(false)
      }
    }

    fetchEcosystems()
  }, [])

  const geocodeLocationByName = async (locationName: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
      )
      if (!response.ok) throw new Error("Geocoding failed")

      const data = await response.json()
      if (data && data.length > 0) {
        const lat = Number.parseFloat(data[0].lat)
        const lon = Number.parseFloat(data[0].lon)
        return [lat, lon]
      }
      return null
    } catch (error) {
      console.error("Error geocoding location:", error)
      return null
    }
  }

  const handleEcosystemSelect = async (ecosystemId: string) => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers()
      setDrawnItemsCount(0)
    }

    if (ecosystemId === "none") {
      setSelectedEcosystem(null)
      setLocationName("")
      setSelectedPolygonCoords(null)
      setGeocodedMarker(null)
      setMapCenter(null)
      toast("Modo Análisis: Busca el lugar, dibuja un polígono y presiona 'Analizar'.", { icon: "🧐" })
      return
    }

    const ecosystem = ecosystems.find((e) => e.id.toString() === ecosystemId)
    if (!ecosystem) return

    setSelectedEcosystem(ecosystem)
    setLocationName(ecosystem.name)
    setGeocodedMarker(null)
    setSelectedPolygonCoords(null)

    if (ecosystem.location) {
      const coords = parseWKTPolygon(ecosystem.location)
      if (coords) {
        setSelectedPolygonCoords(coords)
        const center = getPolygonCenter(coords)
        console.log("Parsed Polygon Coordinates:", coords)
        setMapCenter(center)
        toast.success(`Ecosistema "${ecosystem.name}" cargado y ubicado`, { icon: "📍" })
      } else {
        toast.error("No se pudo parsear la ubicación del ecosistema", { icon: "⚠️" })
        setSelectedPolygonCoords(null)
        setMapCenter(null)
      }
    } else {
      setSelectedPolygonCoords(null)
      toast.loading(`Buscando "${ecosystem.name}" en el mapa...`, { icon: "🔍" })
      const geocodedCoords = await geocodeLocationByName(ecosystem.name)

      if (geocodedCoords) {
        setMapCenter(geocodedCoords)
        setGeocodedMarker(geocodedCoords)
        toast.success(`Ubicación encontrada: "${ecosystem.name}"`, { icon: "✅" })
      } else {
        toast.error(`No se encontró la ubicación para "${ecosystem.name}"`, { icon: "❌" })
        setMapCenter(null)
      }
    }
  }

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
    // Edit logic if needed
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

  // FUNCIÓN MODIFICADA PARA MANEJAR EL CLIC EN ANALIZAR
  const handleAnalyzeClick = () => {
    if (drawnItemsCount === 0 && locationName === "") {
      toast.error("Busca y selecciona una ubicación o dibuja un polígono para analizar", { icon: "⚠️" });
      return;
    }

    if (featureGroupRef.current) {
      const geoJson = featureGroupRef.current.toGeoJSON();
      const wktLocation = convertToWKT(geoJson);

      const polygonData = {
        geoJson,
        locationName,
        location: wktLocation,
        drawnItemsCount,
      };

      // Si hay un ecosistema seleccionado con polígono, mostrar opción
      if (selectedEcosystem && selectedPolygonCoords) {
        setPendingAnalysisData(polygonData);
        setShowLocationChoice(true);
      } else {
        // Si no hay ecosistema seleccionado, proceder directamente
        setPolygonDataForAnalysis(polygonData);
        setIsAnalyzerModalOpen(true);
        toast.success("Abriendo formulario de análisis...", { icon: "🚀" });
      }
    }
  };

  const handleLocationFound = (label: string) => {
    setLocationName(label)
  }

  const handleCloseAnalyzerModal = () => {
    setIsAnalyzerModalOpen(false)
    setPolygonDataForAnalysis(null)
  }

  // Lógica de habilitación para botones
  const isActionEnabled = locationName !== "" || drawnItemsCount > 0

  // Estilos responsivos para el panel
  const panelStyles = isMobile
    ? `fixed inset-0 z-[998] bg-white transform transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `absolute top-16 left-0 bottom-0 bg-white shadow-lg transition-all duration-300 ${isPanelOpen ? 'w-80' : 'w-0'} overflow-hidden flex flex-col border-r border-gray-200 z-[998]`

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Header superior corporativo */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[999] flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/imagenes/Logo_gob_hidalgo.svg"
              alt="Gobierno de Hidalgo"
              width={isMobile ? 100 : 270}
              height={20}
              className="h-8 md:h-10"
            />
          </Link>
          {!isMobile && (
            <>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-lg font-semibold text-gray-800 hidden md:block">
                Sistema de Monitoreo de Ecosistemas
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Navigation className="h-5 w-5" />
            </button>
          )}
          <Button
            onClick={handleGoHome}
            variant="ghost"
            size="sm"
            className="h-9 cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-gray-100 hidden sm:flex"
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
        </div>
      </div>

      {/* Panel lateral de herramientas - Responsive */}
      <div className={panelStyles}>
        {isMobile && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Herramientas
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Herramientas del Mapa
            </h2>
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {isPanelOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Selector de ecosistemas */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Seleccionar Ecosistema
            </h3>
            <Select
              onValueChange={handleEcosystemSelect}
              disabled={isLoadingEcosystems}
              value={selectedEcosystem?.id.toString() || "none"}
            >
              <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white z-[1000]">
                <SelectValue placeholder={isLoadingEcosystems ? "Cargando..." : "Selecciona un ecosistema"} />
              </SelectTrigger>
              <SelectContent className="z-[1001]">
                <SelectItem value="none">(Ningún ecosistema - Modo Análisis)</SelectItem>
                {ecosystems.map((ecosystem) => (
                  <SelectItem key={ecosystem.id} value={ecosystem.id.toString()}>
                    {ecosystem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEcosystem && (
              <div className="text-xs text-gray-600 space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="font-medium">ID:</span> {selectedEcosystem.id}
                </div>
                <div>
                  <span className="font-medium">Creado:</span>{" "}
                  {new Date(selectedEcosystem.created_at).toLocaleDateString("es-ES")}
                </div>
                {selectedEcosystem.location && selectedEcosystem.location.trim() !== "" ? (
                  <div className="text-green-600 font-medium">Con coordenadas</div>
                ) : (
                  <div className="text-amber-600 font-medium">Sin coordenadas</div>
                )}
              </div>
            )}
          </div>

          {/* Información de Ubicación */}
          {locationName && (
            <div className="text-xs space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-3 w-3 text-blue-600" />
                Ubicación seleccionada
              </div>
              <div className="text-gray-900 font-medium truncate" title={locationName}>
                {locationName}
              </div>
            </div>
          )}

          {/* Contador de Elementos */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-600">Elementos dibujados</span>
            <Badge variant={drawnItemsCount > 0 ? "default" : "secondary"} className="bg-blue-600 text-white">
              {drawnItemsCount}
            </Badge>
          </div>

          {/* Estado vacío - Crear nuevo análisis */}
          {!isActionEnabled && (
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">No hay área seleccionada</p>
              <Button
                onClick={handleCreateNewAnalysis}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Análisis
              </Button>
            </div>
          )}

          {/* Botones de Acción */}
          {isActionEnabled && (
            <div className="space-y-2">
              <Button
                onClick={handleAnalyzeClick}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-2"
                >
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                  <path d="M9 17v-7a3 3 0 0 1 6 0v7" />
                  <path d="M12 10V7" />
                </svg>
                Analizar
              </Button>

              <Button
                onClick={handleReferenceClick}
                size="sm"
                variant="outline"
                className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg font-medium"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Referenciar
              </Button>
            </div>
          )}

          {/* Capas del mapa */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Capas del Mapa
            </h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center text-gray-700">
                <input type="radio" name="layer" defaultChecked className="mr-2 text-blue-600" />
                Mapa Estándar
              </label>
              <label className="flex items-center text-gray-700">
                <input type="radio" name="layer" className="mr-2 text-blue-600" />
                Vista Satelital
              </label>
              <label className="flex items-center text-gray-700">
                <input type="radio" name="layer" className="mr-2 text-blue-600" />
                Híbrido
              </label>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="text-xs text-gray-600 pt-3 border-t border-gray-200">
            <div className="font-medium mb-2 text-gray-700">Instrucciones</div>
            <ul className="space-y-1.5 text-gray-600">
              {selectedEcosystem ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Ecosistema seleccionado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Dibuja polígonos con herramientas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Presiona el botón Analizar o Referenciar</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Busca el nombre del lugar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Selecciona con el polígono el área</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Presiona el botón Analizar o Referenciar</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Usa las herramientas de dibujo para crear polígonos</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
          Sistema de Monitoreo de Ecosistemas v1.0
        </div>
      </div>

      {/* Mapa - ocupa todo el espacio */}
      <div className="flex-1 relative mt-16">
        <MapContainer
          center={mapCenter || [21.0, -99.0]}
          zoom={mapCenter ? 14 : 6}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Mapa Estándar">
              <TileLayer
                attribution='© <a href="https://maps.google.com">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Vista Satelital">
              <TileLayer
                attribution='© <a href="https://maps.google.com">Google Satellite</a>'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Híbrido (Satélite + Nombres)">
              <TileLayer
                attribution='© <a href="https://maps.google.com">Google Hybrid</a>'
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <GeoSearch onLocationFound={handleLocationFound} />
          <DrawControl featureGroupRef={featureGroupRef} onCountUpdate={updateDrawnItemsCount} />

          {mapCenter && <MapViewController center={mapCenter} zoom={14} />}

          {selectedPolygonCoords && selectedEcosystem && (
            <Polygon
              positions={selectedPolygonCoords}
              pathOptions={{
                color: "#1a73e8",
                fillColor: "#1a73e8",
                fillOpacity: 0.2,
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-sm space-y-2 min-w-[200px]">
                  <div className="font-semibold text-gray-900">{selectedEcosystem?.name}</div>
                  <div className="text-xs text-gray-600">ID: {selectedEcosystem?.id}</div>
                  {/* Botón "Ver Historial" */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleViewHistory(selectedEcosystem.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      <Clock className="w-4 h-4" />
                      Ver Historial
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          )}

          {geocodedMarker && !selectedPolygonCoords && selectedEcosystem && (
            <Marker position={geocodedMarker}>
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold text-gray-900">{selectedEcosystem?.name}</div>
                  <div className="text-xs text-gray-600">ID: {selectedEcosystem?.id}</div>
                  <div className="text-xs text-amber-600 font-medium border-t border-gray-200 pt-2 mt-2">
                    Este ecosistema no tiene polígono definido
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Usa las herramientas para dibujar su área</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Botón para abrir/cerrar panel cuando está cerrado */}
        {!isPanelOpen && !isMobile && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md hover:bg-gray-50 text-gray-700 border border-gray-300 z-[1000] transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modal de Análisis */}
      <Dialog open={isAnalyzerModalOpen} onOpenChange={setIsAnalyzerModalOpen}>
        <DialogContent className="max-w-7xl w-svh h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col z-[10050]">
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <h2 className="text-base font-semibold text-gray-900">Análisis de Imágenes</h2>
            <Button
              onClick={() => setIsAnalyzerModalOpen(false)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {isAnalyzerModalOpen && polygonDataForAnalysis && (
                <PhotoAnalyzer
                  polygonData={polygonDataForAnalysis}
                  compact
                  useExisting={polygonDataForAnalysis.useExisting || false}
                  externalHistoryModalState={{
                    isOpen: activeModal === 'history',
                    onClose: closeAllModals,
                    onViewDetail: handleViewHistoricalDetail
                  }}
                  onRequestHistoryModal={() => setActiveModal('history')}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de elección de ubicación */}
      <Dialog open={showLocationChoice} onOpenChange={handleCancelLocationChoice}>
        <DialogContent className="max-w-md w-full z-[10060]">
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Elegir Ubicación para Análisis
          </DialogTitle>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Se detectó que <strong>{selectedEcosystem?.name}</strong> ya tiene una ubicación definida. 
              ¿Qué ubicación deseas usar para el análisis?
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Ubicación Existente</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Usar las coordenadas guardadas del ecosistema
                  </p>
                  {selectedPolygonCoords && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Polígono con {selectedPolygonCoords.length} puntos
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Nueva Ubicación</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Usar el área que acabas de dibujar en el mapa
                  </p>
                  {pendingAnalysisData && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ {pendingAnalysisData.drawnItemsCount} elemento(s) dibujado(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleCancelLocationChoice}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUseExistingLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Usar Existente
            </Button>
            <Button
              onClick={handleUseNewLocation}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Map className="h-4 w-4 mr-2" />
              Usar Nueva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Historial - MODIFICADO: usa activeModal en lugar de isHistoryModalOpen */}
      <HistoryListModal
        isOpen={activeModal === 'history'}
        onClose={closeAllModals}
        historicalImages={historicalImages}
        ecosystemName={selectedEcosystemForHistory?.name || 'Ecosistema'}
        onViewDetail={handleViewHistoricalDetail}
        onCreateNewAnalysis={handleCreateNewAnalysisFromHistory}
      />

      {/* Modal de Detalle de Imagen - MODIFICADO: usa activeModal en lugar de isImageDetailModalOpen */}
      <ImageDetailModal
        isOpen={activeModal === 'imageDetail'}
        onClose={closeAllModals}
        image={selectedImage}
      />
    </div>
  )
}

export default MapComponent