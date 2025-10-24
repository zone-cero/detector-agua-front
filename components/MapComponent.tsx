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
import { Navigation, Minimize2, Maximize2, X, Clock, Calendar, Eye, Leaf, Droplets } from "lucide-react"
import toast from "react-hot-toast"

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

const ReferenceIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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

interface GeoSearchProps {
  onLocationFound: (label: string) => void
}

interface MapToolsProps {
  onAnalyze: () => void
  locationName: string
  drawnItemsCount: number
  isMinimized: boolean
  onToggleMinimize: () => void
  isEcosystemSelected: boolean
  ecosystems: Ecosystem[]
  selectedEcosystem: Ecosystem | null
  onEcosystemSelect: (ecosystemId: string) => void
  isLoadingEcosystems: boolean
}

// Componente Modal de Historial
interface HistoryListModalProps {
  isOpen: boolean
  onClose: () => void
  historicalImages: HistoricalImage[]
  ecosystemName: string
  onViewDetail: (image: HistoricalImage) => void
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
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Detalle de Captura - ID: {image.id}</DialogTitle>
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle de Captura - ID: {image.id}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagen */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.image || "/placeholder.svg"}
                  alt={`Captura ${image.id}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).onerror = null
                    ;(e.target as HTMLImageElement).src =
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
                      {(image.vegetation_area_m2 + image.water_area_m2).toFixed(2)} m²
                    </span>
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

const HistoryListModal: React.FC<HistoryListModalProps> = ({
  isOpen,
  onClose,
  historicalImages,
  ecosystemName,
  onViewDetail,
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
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Historial de Capturas: {ecosystemName}</DialogTitle>
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Capturas: {ecosystemName}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 border-b pb-4">
              Mostrando {historicalImages.length} capturas históricas encontradas para el ecosistema "{ecosystemName}".
              Las imágenes se listan de la más reciente a la más antigua.
            </p>
            
            {sortedHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No se encontraron imágenes históricas</p>
                <p className="text-sm">No hay capturas previas para este ecosistema.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {sortedHistory.map((image, index) => (
                  <div
                    key={image.id}
                    className="p-4 flex items-center justify-between border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                        <img
                          src={image.image || "/placeholder.svg"}
                          alt={`Captura ${image.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).onerror = null
                            ;(e.target as HTMLImageElement).src =
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

const MapTools: React.FC<MapToolsProps> = ({
  onAnalyze,
  locationName,
  drawnItemsCount,
  isMinimized,
  onToggleMinimize,
  isEcosystemSelected,
  ecosystems,
  selectedEcosystem,
  onEcosystemSelect,
  isLoadingEcosystems,
}) => {
  if (isMinimized) {
    return (
      <Card className="absolute top-4 right-4 z-[401] w-14 shadow-sm border border-gray-200 bg-white rounded-lg">
        <CardContent className="p-2 space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleMinimize}
                  size="icon"
                  variant="ghost"
                  className="w-full h-10 hover:bg-gray-100 rounded-lg"
                >
                  <Maximize2 className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Expandir herramientas</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onAnalyze}
                  size="icon"
                  variant="default"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={drawnItemsCount === 0 || locationName === ""}
                >
                  <span className="text-xs font-medium">A</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Analizar polígono</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {drawnItemsCount > 0 && (
            <div className="flex justify-center">
              <Badge
                variant="default"
                className="h-6 w-6 p-0 text-xs flex items-center justify-center bg-blue-600 text-white rounded-full"
              >
                {drawnItemsCount}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="absolute top-4 right-4 z-[401] w-80 shadow-sm border border-gray-200 bg-white rounded-lg">
      <CardHeader className="pb-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
            <Navigation className="h-4 w-4 text-gray-600" />
            Herramientas del Mapa
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleMinimize}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-gray-100 rounded-lg"
                >
                  <Minimize2 className="h-4 w-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimizar panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Sección de Selección de Ecosistema */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Seleccionar Ecosistema</div>
          <Select
            onValueChange={onEcosystemSelect}
            disabled={isLoadingEcosystems}
            value={selectedEcosystem?.id.toString() || "none"}
          >
            <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder={isLoadingEcosystems ? "Cargando..." : "Selecciona un ecosistema"} />
            </SelectTrigger>
            <SelectContent>
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
            <div className="font-medium text-gray-700">Ubicación seleccionada</div>
            <div className="text-gray-900 font-medium truncate" title={locationName}>
              {locationName}
            </div>
          </div>
        )}

        {/* Contador de Elementos */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-gray-600">Elementos dibujados</span>
          <Badge variant={drawnItemsCount > 0 ? "default" : "secondary"} className="bg-blue-600">
            {drawnItemsCount}
          </Badge>
        </div>

        {/* Botón de Análisis */}
        <Button
          onClick={onAnalyze}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          disabled={drawnItemsCount === 0 || locationName === ""}
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

        {/* Instrucciones */}
        <div className="text-xs text-gray-600 pt-3 border-t border-gray-200">
          <div className="font-medium mb-2 text-gray-700">Instrucciones</div>
          <ul className="space-y-1.5 text-gray-600">
            {isEcosystemSelected ? (
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
                  <span>Presiona el botón Analizar</span>
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
                  <span>Presiona el botón Analizar</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Usa las herramientas de dibujo para crear polígonos</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

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
            shapeOptions: { color: "#3b82f6" },
          },
          circle: false,
          rectangle: {
            shapeOptions: { color: "#3b82f6" },
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

interface MapComponentProps {
  onAnalyze?: (data: any) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ onAnalyze }) => {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [selectedEcosystem, setSelectedEcosystem] = useState<Ecosystem | null>(null)
  const [selectedPolygonCoords, setSelectedPolygonCoords] = useState<[number, number][] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [isLoadingEcosystems, setIsLoadingEcosystems] = useState(true)
  const [geocodedMarker, setGeocodedMarker] = useState<[number, number] | null>(null)

  const [locationName, setLocationName] = useState("")
  const [drawnItemsCount, setDrawnItemsCount] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const featureGroupRef = useRef<L.FeatureGroup>(null)

  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false)
  const [polygonDataForAnalysis, setPolygonDataForAnalysis] = useState<any>(null)

  // Estados para el historial
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false)
  const [selectedEcosystemForHistory, setSelectedEcosystemForHistory] = useState<Ecosystem | null>(null)
  const [historicalImages, setHistoricalImages] = useState<HistoricalImage[]>([])
  const [selectedImage, setSelectedImage] = useState<HistoricalImage | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

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
      
      // Cargar todas las imágenes y filtrar por el ecosistema seleccionado
      const allImages = await fetchAllImages()
      const filteredImages = allImages.filter(image => image.ecosystem === ecosystemId)
      
      setHistoricalImages(filteredImages)
      setIsHistoryModalOpen(true)
      
      toast.success(`Se encontraron ${filteredImages.length} imágenes para ${ecosystem.name}`, { icon: "📊" })
    } catch (error) {
      console.error("Error al cargar el historial:", error)
      toast.error("Error al cargar el historial de imágenes", { icon: "❌" })
    }
  }

  // Función para ver el detalle de una imagen histórica
  const handleViewHistoricalDetail = (image: HistoricalImage) => {
    setSelectedImage(image)
    setIsImageDetailModalOpen(true)
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

  const handleAnalyzeClick = () => {
    if (drawnItemsCount === 0) {
      toast.error("Dibuja un polígono o elemento en el mapa para analizar", { icon: "⚠️" })
      return
    }

    if (locationName === "") {
      toast.error("Busca y selecciona una ubicación primero", { icon: "⚠️" })
      return
    }

    if (featureGroupRef.current) {
      const geoJson = featureGroupRef.current.toGeoJSON()
      const wktLocation = convertToWKT(geoJson)

      console.log("[v0] GeoJSON:", geoJson)
      console.log("[v0] WKT Location:", wktLocation)

      // ✅ ESTRUCTURA CORRECTA para PhotoAnalyzer
      const polygonData = {
        geoJson,
        locationName,
        location: wktLocation,
        drawnItemsCount,
        // ✅ SOLO estos campos - analysisResult es manejado internamente por PhotoAnalyzer
      }

      setPolygonDataForAnalysis(polygonData)
      setIsAnalyzerModalOpen(true)
      toast.success("Abriendo formulario de análisis...", { icon: "🚀" })
    }
  }

  const handleLocationFound = (label: string) => {
    setLocationName(label)
  }

  const handleCloseAnalyzerModal = () => {
    setIsAnalyzerModalOpen(false)
    setPolygonDataForAnalysis(null) // Limpiar datos al cerrar
  }

  return (
    <div className="relative h-screen w-full">
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
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Vista Satelital">
            <TileLayer
              attribution='© <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Híbrido (Satélite + Nombres)">
            <TileLayer
              attribution='© <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution='© <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
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
              color: "#10b981",
              fillColor: "#10b981",
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
                <div className="text-xs text-amber-600 font-medium border-t pt-2 mt-2">
                  Este ecosistema no tiene polígono definido
                </div>
                <div className="text-xs text-blue-600 font-medium">Usa las herramientas para dibujar su área</div>
              </div>
            </Popup>
          </Marker>
        )}

        <MapTools
          onAnalyze={handleAnalyzeClick}
          locationName={locationName}
          drawnItemsCount={drawnItemsCount}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized((prev) => !prev)}
          isEcosystemSelected={!!selectedEcosystem}
          ecosystems={ecosystems}
          selectedEcosystem={selectedEcosystem}
          onEcosystemSelect={handleEcosystemSelect}
          isLoadingEcosystems={isLoadingEcosystems}
        />
      </MapContainer>

      {/* Modal de Análisis
      <Dialog open={isAnalyzerModalOpen} onOpenChange={setIsAnalyzerModalOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Análisis de Imágenes</DialogTitle>
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Análisis de Imágenesssssss</h2>
            <Button
              onClick={handleCloseAnalyzerModal}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
         
        </DialogContent>
      </Dialog> */}

      {/* Modal de Historial */}
      <HistoryListModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historicalImages={historicalImages}
        ecosystemName={selectedEcosystemForHistory?.name || 'Ecosistema'}
        onViewDetail={handleViewHistoricalDetail}
      />

      {/* Modal de Detalle de Imagen */}
      <ImageDetailModal
        isOpen={isImageDetailModalOpen}
        onClose={() => setIsImageDetailModalOpen(false)}
        image={selectedImage}
      />
    </div>
  )
}

export default MapComponent