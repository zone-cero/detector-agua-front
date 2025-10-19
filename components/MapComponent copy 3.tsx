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
import { Download, Save, MapPin, Navigation, Minimize2, Maximize2 } from "lucide-react"
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
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
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
  isSelectingPoint: boolean
  locationName: string
  referenceMarker: L.LatLng | null
  drawnItemsCount: number
  isMinimized: boolean
  onToggleMinimize: () => void
}

// Parse WKT POLYGON to Leaflet coordinates
const parseWKTPolygon = (wkt: string): [number, number][] | null => {
  try {
    // Remove SRID prefix if present
    const cleanWkt = wkt.replace(/SRID=\d+;/, "")

    // Extract coordinates from POLYGON ((lng lat, lng lat, ...))
    const match = cleanWkt.match(/POLYGON\s*$$\((.*?)$$\)/)
    if (!match) return null

    const coordsString = match[1]
    const coords = coordsString.split(",").map((pair) => {
      const [lng, lat] = pair.trim().split(" ").map(Number)
      return [lat, lng] as [number, number] // Leaflet uses [lat, lng]
    })

    return coords
  } catch (error) {
    console.error("Error parsing WKT:", error)
    return null
  }
}

// Calculate center of polygon
const getPolygonCenter = (coords: [number, number][]): [number, number] => {
  const latSum = coords.reduce((sum, coord) => sum + coord[0], 0)
  const lngSum = coords.reduce((sum, coord) => sum + coord[1], 0)
  return [latSum / coords.length, lngSum / coords.length]
}

const MapTools: React.FC<MapToolsProps> = ({
  onExport,
  onSave,
  onTogglePointSelection,
  isSelectingPoint,
  locationName,
  referenceMarker,
  drawnItemsCount,
  isMinimized,
  onToggleMinimize,
}) => {
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
        {(locationName || referenceMarker) && (
          <div className="text-xs space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-medium text-slate-700">Ubicación seleccionada:</div>
            {locationName && (
              <div className="text-slate-900 font-semibold truncate" title={locationName}>
                {locationName}
              </div>
            )}
            {referenceMarker && (
              <div className="text-slate-600 font-mono text-[11px]">
                {referenceMarker.lat.toFixed(5)}, {referenceMarker.lng.toFixed(5)}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-600">Elementos dibujados:</span>
          <Badge variant={drawnItemsCount > 0 ? "default" : "secondary"} className="bg-blue-600">
            {drawnItemsCount}
          </Badge>
        </div>

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
                {isSelectingPoint ? "Seleccionando..." : "Referenciar Punto"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Haz clic en el mapa para obtener referencia</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="text-xs text-slate-600 pt-3 border-t border-slate-200">
          <div className="font-medium mb-2 text-slate-700">Instrucciones:</div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Selecciona un ecosistema del menú</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Dibuja polígonos con herramientas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Referencia puntos con el botón</span>
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

const ClickHandler: React.FC<ClickHandlerProps> = ({ isSelecting, onMapClick }) => {
  const map = useMap()

  useEffect(() => {
    map.getContainer().style.cursor = isSelecting ? "crosshair" : "grab"

    if (isSelecting) {
      const handler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng)
        map.getContainer().style.cursor = "grab"
      }
      map.on("click", handler)

      return () => {
        map.off("click", handler)
      }
    }
    return () => {
      map.getContainer().style.cursor = "grab"
    }
  }, [isSelecting, map, onMapClick])

  return null
}

const DrawControl: React.FC<{ featureGroupRef: React.RefObject<L.FeatureGroup> }> = ({ featureGroupRef }) => {
  const _onCreated = (e: any) => {
    const { layerType } = e
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(e.layer)
      toast.success(`Se ha dibujado un ${layerType}`, {
        icon: "🗺️",
      })
    }
  }

  const _onDeleted = (e: any) => {
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
            shapeOptions: { color: "#3b82f6" },
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

const MapViewController: React.FC<{ center: [number, number] | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 })
    }
  }, [center, zoom, map])

  return null
}

const MapComponent: React.FC = () => {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [selectedEcosystem, setSelectedEcosystem] = useState<Ecosystem | null>(null)
  const [selectedPolygonCoords, setSelectedPolygonCoords] = useState<[number, number][] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [isLoadingEcosystems, setIsLoadingEcosystems] = useState(true)

  const [locationName, setLocationName] = useState("")
  const [referenceMarker, setReferenceMarker] = useState<L.LatLng | null>(null)
  const [isSelectingPoint, setIsSelectingPoint] = useState(false)
  const [drawnItemsCount, setDrawnItemsCount] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const featureGroupRef = useRef<L.FeatureGroup>(null)

  useEffect(() => {
    const fetchEcosystems = async () => {
      try {
        const response = await fetch("https://sistemahidalgodroneva.site/api/monitoring/ecosystems/")
        if (!response.ok) throw new Error("Failed to fetch ecosystems")
        const data = await response.json()
        setEcosystems(data)
        toast.success(`${data.length} ecosistemas cargados`, { icon: "🌍" })
      } catch (error) {
        console.error("Error fetching ecosystems:", error)
        toast.error("Error al cargar ecosistemas", { icon: "❌" })
      } finally {
        setIsLoadingEcosystems(false)
      }
    }

    fetchEcosystems()
  }, [])

  const handleEcosystemSelect = (ecosystemId: string) => {
    const ecosystem = ecosystems.find((e) => e.id.toString() === ecosystemId)
    if (!ecosystem) return

    setSelectedEcosystem(ecosystem)
    setLocationName(ecosystem.name)

    // Parse location if it exists
    if (ecosystem.location && ecosystem.location.trim() !== "") {
      const coords = parseWKTPolygon(ecosystem.location)
      if (coords) {
        setSelectedPolygonCoords(coords)
        const center = getPolygonCenter(coords)
        setMapCenter(center)
        toast.success(`Ecosistema "${ecosystem.name}" cargado`, { icon: "📍" })
      } else {
        toast.error("No se pudo parsear la ubicación del ecosistema", { icon: "⚠️" })
        setSelectedPolygonCoords(null)
        setMapCenter(null)
      }
    } else {
      toast.success(`Ecosistema "${ecosystem.name}" sin coordenadas definidas`, { icon: "ℹ️" })
      setSelectedPolygonCoords(null)
      setMapCenter(null)
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

  const handleSave = () => {
    if (!referenceMarker && !selectedEcosystem) {
      toast.error("Selecciona un ecosistema o punto de referencia antes de guardar", { icon: "📍" })
      return
    }
    toast.success(`Datos guardados`, { icon: "💾" })
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
  }

  return (
    <div className="relative h-screen w-full">
      <Card className="absolute top-4 left-4 z-[401] w-80 shadow-lg border-slate-200 bg-white">
        <CardHeader className="pb-3 bg-slate-50 rounded-t-lg border-b border-slate-200">
          <CardTitle className="text-sm font-semibold text-slate-800">Seleccionar Ecosistema</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Select onValueChange={handleEcosystemSelect} disabled={isLoadingEcosystems}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingEcosystems ? "Cargando..." : "Selecciona un ecosistema"} />
            </SelectTrigger>
            <SelectContent>
              {ecosystems.map((ecosystem) => (
                <SelectItem key={ecosystem.id} value={ecosystem.id.toString()}>
                  {ecosystem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEcosystem && (
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-medium">ID:</span> {selectedEcosystem.id}
              </div>
              <div>
                <span className="font-medium">Creado:</span>{" "}
                {new Date(selectedEcosystem.created_at).toLocaleDateString("es-ES")}
              </div>
              {selectedEcosystem.location && selectedEcosystem.location.trim() !== "" ? (
                <div className="text-emerald-600 font-medium">✓ Con coordenadas</div>
              ) : (
                <div className="text-amber-600 font-medium">⚠ Sin coordenadas</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
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

        <GeoSearch onLocationFound={handleLocationFound} />
        <ClickHandler isSelecting={isSelectingPoint} onMapClick={handleMapClick} />
        <DrawControl featureGroupRef={featureGroupRef} />

        <MapViewController center={mapCenter} zoom={14} />

        {selectedPolygonCoords && (
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
              <div className="text-sm">
                <div className="font-semibold text-slate-900 mb-1">{selectedEcosystem?.name}</div>
                <div className="text-xs text-slate-600">ID: {selectedEcosystem?.id}</div>
              </div>
            </Popup>
          </Polygon>
        )}

        {referenceMarker && (
          <Marker position={referenceMarker} icon={ReferenceIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-slate-900 mb-1">Punto de Referencia</div>
                <div className="text-xs text-slate-600 font-mono">
                  Lat: {referenceMarker.lat.toFixed(5)}
                  <br />
                  Lng: {referenceMarker.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <MapTools
          onExport={handleExport}
          onSave={handleSave}
          onTogglePointSelection={handleTogglePointSelection}
          isSelectingPoint={isSelectingPoint}
          locationName={locationName}
          referenceMarker={referenceMarker}
          drawnItemsCount={drawnItemsCount}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized((prev) => !prev)}
        />
      </MapContainer>
    </div>
  )
}

export default MapComponent
