"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Droplets,
  Leaf,
  Calendar,
  FileText,
  Sparkles,
  Ruler,
  ListOrdered,
  Map,
  Loader2,
  Trash2,
  Plus,
  Eye,
  LandPlot,
} from "lucide-react"

const REMOTE_BASE_URL = "https://sistemahidalgodroneva.site"

interface Ecosystem {
  id: number
  name: string
  created_at: string
}

interface ImageResult {
  id: number
  ecosystem?: number
  image: string
  description: string
  metadata?: {
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

interface UploadResponse {
  message: string
  ecosystem_id: number
  ecosystem_name: string
  images: ImageResult[]
}

interface FilterValues {
  brightness: number
  contrast: number
  saturate: number
}

type StepType = "upload" | "configure" | "analyze" | "results"

const formatDateForDisplay = (dateString?: string): string => {
  if (!dateString) return "Fecha N/A"
  try {
    let formattedDateString = dateString
    if (!dateString.endsWith("Z")) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        formattedDateString = date.toISOString()
      }
    }
    return new Date(formattedDateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "Fecha Inválida"
  }
}

const normalizeDateForAPI = (dateString: string): string => {
  if (!dateString) return ""

  if (dateString.includes("T") && dateString.includes(":")) {
    if (!dateString.endsWith("Z")) {
      return dateString + "Z"
    }
    return dateString
  }

  if (dateString.length === 16) {
    return `${dateString}:00Z`
  }

  return dateString
}

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {props.children}
  </select>
)

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "xl" }) => {
  const sizeClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "max-w-md"
      case "md":
        return "max-w-lg"
      case "lg":
        return "max-w-2xl"
      case "xl":
        return "max-w-4xl"
      case "full":
        return "max-w-7xl"
      default:
        return "max-w-4xl"
    }
  }, [size])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 md:p-10">
      <Card
        className={`relative w-full ${sizeClass} p-0 border-0 shadow-2xl bg-white rounded-xl transform transition-all duration-300 translate-y-8 md:translate-y-12`}
        style={{ top: "30px" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-[20px] font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </Card>
    </div>
  )
}

interface HistoryListModalProps extends Omit<ModalProps, "title" | "children"> {
  historicalImages: ImageResult[]
  ecosystemName: string
  ecosystemId: string | null
  onViewDetail: (image: ImageResult) => void
  remoteBaseUrl: string
  loadingHistory?: boolean
}

const HistoryListModal: React.FC<HistoryListModalProps> = ({
  isOpen,
  onClose,
  historicalImages,
  ecosystemName,
  ecosystemId,
  onViewDetail,
  loadingHistory = false
}) => {
  const sortedHistory = useMemo(() => {
    return [...historicalImages].sort((a, b) => {
      const dateA = a.capture_date || ""
      const dateB = b.capture_date || ""
      return dateB.localeCompare(dateA)
    })
  }, [historicalImages])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historial de Capturas: ${ecosystemName}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 border-b pb-4">
          Mostrando {historicalImages.length} capturas históricas encontradas para el ecosistema "{ecosystemName}
          ". Las imágenes se listan de la más reciente a la más antigua.
        </p>

        {loadingHistory ? (
          <div className="p-6 text-center text-slate-500 border rounded-lg bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Cargando historial de capturas...
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="p-6 text-center text-slate-500 border rounded-lg bg-slate-50">
            <ListOrdered className="w-6 h-6 mx-auto mb-2" />
            No se encontraron imágenes históricas para este ecosistema.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {sortedHistory.map((image, index) => (
              <Card
                key={image.id}
                className="p-4 flex items-center justify-between border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden relative">
                    <img
                      src={image.image || "/placeholder.svg"}
                      alt={`Captura ${image.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-image-off"><path d="M10.5 8.5h.01"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9c0-.6.4-1.2.9-1.6L4 4"/></svg>'
                      }}
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">
                      Captura ID: {image.id}
                      {index === 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          Más Reciente
                        </span>
                      )}
                    </div>
                    <p className="flex items-center text-slate-600 mt-1">
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDateForDisplay(image.capture_date)}
                    </p>
                    <p className="flex items-center text-green-700 mt-1">
                      <Leaf className="w-3 h-3 mr-2" />
                      Lirio: {image.vegetation_percentage?.toFixed(2) || '0.00'}%
                    </p>
                    <p className="flex items-center text-blue-700">
                      <Droplets className="w-3 h-3 mr-2" />
                      Agua: {image.water_percentage?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onViewDetail(image)}
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalle
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

interface ImageDetailModalProps extends Omit<ModalProps, "title" | "children" | "size"> {
  result: ImageResult | null
  remoteBaseUrl: string
  historicalImages: ImageResult[]
  onBackToList: () => void
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  result,
  remoteBaseUrl,
  historicalImages,
  onBackToList,
}) => {
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Fecha inválida"
    }
  }

  const mostRecentHistoricalImage = useMemo(() => {
    if (!result) return null

    const sorted = [...historicalImages]
      .filter((img) => img.capture_date && img.id !== result.id)
      .sort((a, b) => (b.capture_date || "").localeCompare(a.capture_date || ""))

    return sorted.length > 0 ? sorted[0] : null
  }, [historicalImages, result])

  if (!result) return null

  const waterDiff = mostRecentHistoricalImage ? result.water_area_m2 - mostRecentHistoricalImage.water_area_m2 : 0
  const vegDiff = mostRecentHistoricalImage
    ? result.vegetation_area_m2 - mostRecentHistoricalImage.vegetation_area_m2
    : 0

  const renderDiff = (value: number, unit: string) => {
    if (!mostRecentHistoricalImage) return <span className="text-slate-500">N/A</span>
    const color = value > 0 ? "text-red-600" : value < 0 ? "text-green-600" : "text-slate-500"
    const icon = value > 0 ? "▲" : value < 0 ? "▼" : "—"
    return (
      <span className={`font-semibold ${color}`}>
        {icon} {Math.abs(value).toFixed(2)} {unit}
      </span>
    )
  }

  const formatArea = (area: number) => area.toFixed(2) + " m²"
  const formatPercent = (percent: number) => percent.toFixed(2) + "%"

  const imageUrlFromAPI = result.image

  let finalSrc
  if (typeof imageUrlFromAPI === "string" && imageUrlFromAPI.length > 0) {
    if (imageUrlFromAPI.startsWith("http://") || imageUrlFromAPI.startsWith("https://")) {
      finalSrc = imageUrlFromAPI
    } else {
      const normalizedBase = remoteBaseUrl.endsWith("/") ? remoteBaseUrl.slice(0, -1) : remoteBaseUrl
      const normalizedPath = imageUrlFromAPI.startsWith("/") ? imageUrlFromAPI : `/${imageUrlFromAPI}`
      finalSrc = `${normalizedBase}${normalizedPath}`
    }
  } else {
    finalSrc = "/placeholder.jpg"
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de Captura ID: ${result.id}`} size="xl">
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden bg-slate-100 shadow-inner">
            <img
              src={finalSrc || "/placeholder.svg"}
              alt={`Imagen ${result.id}`}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 right-0 p-2 bg-black/50 text-white text-xs rounded-tl-lg">
              {formatDateForDisplay(result.capture_date)}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Descripción: {result.description || "Sin descripción proporcionada."}
          </p>
          {result.metadata && (
            <p className="text-xs text-slate-500 flex items-center">
              <Ruler className="w-3 h-3 mr-1" />
              Resolución: 1 píxel = {result.metadata.resolution_m_per_px} m²
            </p>
          )}
          {!result.metadata && (
            <p className="text-xs text-slate-400 flex items-center">
              <Ruler className="w-3 h-3 mr-1" />
              Información de resolución no disponible
            </p>
          )}

          <Button
            onClick={onBackToList}
            variant="outline"
            className="w-full text-slate-600 hover:bg-slate-100 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Regresar a la Lista de Historial
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-800 border-b pb-2">Resultados Cuantificados</h4>
          <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-2">
                  Métrica
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 flex items-center text-blue-700">
                  <Droplets className="w-4 h-4 mr-2" />
                  Área de Agua
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatArea(result.water_area_m2)} ({formatPercent(result.water_percentage)})
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 flex items-center text-green-700">
                  <Leaf className="w-4 h-4 mr-2" />
                  Área de Lirio
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatArea(result.vegetation_area_m2)} ({formatPercent(result.vegetation_percentage)})
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="px-4 py-2 font-semibold text-slate-800 flex items-center">
                  <span className="mr-2">Total Analizado</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-slate-800">
                  {formatArea(result.water_area_m2 + result.vegetation_area_m2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="pt-2">
            <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-3 flex items-center">
              Comparativa Histórica
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Comparado con la captura anterior:
              {mostRecentHistoricalImage
                ? ` ${formatDateForDisplay(mostRecentHistoricalImage.capture_date)}`
                : " No hay historial previo."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-white shadow-sm">
                <p className="text-xs text-slate-600 flex items-center">
                  <Droplets className="w-3 h-3 mr-1 text-blue-500" />
                  Cambio en Agua
                </p>
                <div className="text-lg mt-1">{renderDiff(waterDiff, "m²")}</div>
              </div>
              <div className="p-3 border rounded-lg bg-white shadow-sm">
                <p className="text-xs text-slate-600 flex items-center">
                  <Leaf className="w-3 h-3 mr-1 text-green-500" />
                  Cambio en Lirio
                </p>
                <div className="text-lg mt-1">{renderDiff(vegDiff, "m²")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

interface PhotoAnalyzerProps {
  polygonData?: {
    geoJson: any
    locationName: string
    referenceMarker: { lat: number; lng: number } | null
    drawnItemsCount: number
  } | null
  compact?: boolean
  // Nuevas props para controlar modales externamente
  externalHistoryModalState?: {
    isOpen: boolean
    onClose: () => void
    onViewDetail:any
  }
  onRequestHistoryModal?: () => void
}

const getWktFromGeoJson = (geoJson: any): string | null => {
  if (!geoJson || geoJson.type !== "FeatureCollection" || !geoJson.features || geoJson.features.length === 0) {
    console.warn("GeoJSON no es una FeatureCollection válida o está vacío.");
    return null;
  }

  const feature = geoJson.features[0];
  if (!feature.geometry || feature.geometry.type !== "Polygon" || !feature.geometry.coordinates) {
    console.warn("La primera característica no es un polígono válido.");
    return null;
  }

  const polygonCoordinates = feature.geometry.coordinates;
  const outerRing = polygonCoordinates[0];

  if (!outerRing || outerRing.length < 4) {
    console.warn("El anillo exterior del polígono tiene menos de 4 puntos.");
    return null;
  }

  const wktPoints = outerRing.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(", ");
  return `SRID=4326;POLYGON((${wktPoints}))`;
};

export default function PhotoAnalyzer({ 
  polygonData, 
  compact = false,
  externalHistoryModalState,
  onRequestHistoryModal,
  
}: PhotoAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState<StepType>("upload")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [ecosystemName, setEcosystemName] = useState<string>(polygonData?.locationName || "")
  const [ecosystemId, setEcosystemId] = useState<string | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>([])
  const [captureDates, setCaptureDates] = useState<string[]>([])

  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([])
  const [historicalImages, setHistoricalImages] = useState<ImageResult[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [filterValues, setFilterValues] = useState<FilterValues>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageResult, setSelectedImageResult] = useState<ImageResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const configureFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const shouldHideEcosystemSelection = useMemo(() => {
    return !!(polygonData && polygonData.locationName && polygonData.drawnItemsCount > 0)
  }, [polygonData])

  // Determinar qué modal mostrar
  const shouldShowExternalHistoryModal = externalHistoryModalState?.isOpen
  const shouldShowInternalModals = !shouldShowExternalHistoryModal

  useEffect(() => {
    if (polygonData) {
      console.log("✅ polygonData LLEGÓ al PhotoAnalyzer:", polygonData)
      toast({
        title: "Ubicación cargada",
        description: `Se detectaron datos de polígono para: ${polygonData.locationName}.`,
        variant: "default",
        duration: 3000,
      })
    }
  }, [polygonData, toast])

  const getNowDatetimeLocal = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
        if (currentStep === "upload") {
          setCurrentStep("configure")
        }
        e.target.value = ""
      }
    },
    [currentStep],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files)
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
        if (currentStep === "upload") {
          setCurrentStep("configure")
        }
      }
    },
    [currentStep],
  )

  const handleUploadAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAddMoreClick = () => {
    if (configureFileInputRef.current) {
      configureFileInputRef.current.click()
    }
  }

  useEffect(() => {
    if (selectedFiles.length > imagePreviewUrls.length) {
      const newFiles = selectedFiles.slice(imagePreviewUrls.length)
      const newUrls = newFiles.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prevUrls) => [...prevUrls, ...newUrls])

      const newDescriptions = Array(newFiles.length).fill("")
      setDescriptions((prev) => [...prev, ...newDescriptions])
      const newDates = Array(newFiles.length).fill(getNowDatetimeLocal())
      setCaptureDates((prev) => [...prev, ...newDates])
    } else if (selectedFiles.length < imagePreviewUrls.length) {
      setImagePreviewUrls((prev) => prev.slice(0, selectedFiles.length))
      setDescriptions((prev) => prev.slice(0, selectedFiles.length))
      setCaptureDates((prev) => prev.slice(0, selectedFiles.length))
    }
  }, [selectedFiles, imagePreviewUrls.length])

  useEffect(() => {
    const fetchEcosystems = async () => {
      try {
        const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/ecosystems/`)
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de ecosistemas.")
        }
        const data: Ecosystem[] = await response.json()
        setEcosystems(data)
      } catch (error) {
        console.error("Error al cargar ecosistemas:", error)
      }
    }
    fetchEcosystems()
  }, [])

  useEffect(() => {
    if (polygonData?.locationName && ecosystems.length > 0) {
      const matchingEcosystem = ecosystems.find(
        (eco) => eco.name.toLowerCase().trim() === polygonData.locationName.toLowerCase().trim(),
      )

      if (matchingEcosystem) {
        setEcosystemId(matchingEcosystem.id.toString())
        setEcosystemName(matchingEcosystem.name)
      } else {
        setEcosystemId(null)
        setEcosystemName(polygonData.locationName)
      }
    }
  }, [polygonData, ecosystems])

  useEffect(() => {
    const fetchHistoricalImages = async () => {
      setHistoricalImages([])
      setSelectedFiles([])

      if (!ecosystemId || ecosystemId === "new") {
        if (!polygonData?.locationName) {
          setEcosystemName("")
        }
        setCurrentStep("configure")
        return
      }

      setLoadingHistory(true)

      try {
        const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/images/`)
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista completa de imágenes.")
        }

        const allImages: ImageResult[] = await response.json()
        const targetEcosystemId = Number(ecosystemId)
        const filteredImages = allImages.filter((img) => img.ecosystem === targetEcosystemId)

        setHistoricalImages(filteredImages)

        const selectedEcos = ecosystems.find((e) => e.id.toString() === ecosystemId)
        if (selectedEcos) {
          setEcosystemName(selectedEcos.name)
        } else {
          setEcosystemName(`Ecosistema ID: ${ecosystemId}`)
        }

        toast({
          title: "Ecosistema Cargado",
          description: `Se cargaron ${filteredImages.length} imágenes históricas.`,
        })
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setHistoricalImages([])
        toast({
          title: "Error de Historial",
          description: "No se pudieron obtener o filtrar las imágenes históricas para este ID.",
          variant: "destructive",
        })
        setEcosystemId("new")
      } finally {
        setLoadingHistory(false)
      }
    }
    fetchHistoricalImages()
  }, [ecosystemId, ecosystems, toast])

  const getImageFilterStyle = useCallback(() => {
    const { brightness, contrast, saturate } = filterValues
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
    }
  }, [filterValues])

  const handleRemoveFile = useCallback((indexToRemove: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
    setDescriptions((prevDesc) => prevDesc.filter((_, index) => index !== indexToRemove))
    setCaptureDates((prevDates) => prevDates.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleDescriptionChange = useCallback((index: number, description: string) => {
    setDescriptions((prev) => prev.map((item, i) => (i === index ? description : item)))
  }, [])

  const handleDateChange = useCallback((index: number, date: string) => {
    setCaptureDates((prev) => prev.map((item, i) => (i === index ? date : item)))
  }, [])

  const handleReset = useCallback(() => {
    setSelectedFiles([])
    setAnalysisResult(null)
    setDescriptions([])
    setCaptureDates([])
    setEcosystemName("")
    setEcosystemId(null)
    setHistoricalImages([])
    setCurrentStep("upload")
    setFilterValues({
      brightness: 100,
      contrast: 100,
      saturate: 100,
    })
  }, [])

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0 || !ecosystemName.trim()) {
      toast({
        title: "Error de Validación",
        description: "Por favor, selecciona al menos una imagen y define un nombre de ecosistema.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCurrentStep("analyze");

    const formData = new FormData();
    formData.append("name", ecosystemName.trim());

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    captureDates.forEach((date) => {
      const normalizedDate = normalizeDateForAPI(date);
      formData.append("capture_dates", normalizedDate || getNowDatetimeLocal() + ":00Z");
    });

    descriptions.forEach((desc) => {
      formData.append("descriptions", desc || "");
    });

    if (polygonData && polygonData.geoJson) {
      const wktLocation = getWktFromGeoJson(polygonData.geoJson);
      if (wktLocation) {
        formData.append("location", wktLocation);
      } else {
        toast({
          title: "Error de Ubicación",
          description: "No se pudieron procesar los datos del polígono para la ubicación.",
          variant: "destructive",
        });
        setLoading(false);
        setCurrentStep("configure");
        return;
      }
    }

    try {
      const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/images/upload-multiple/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: Respuesta del servidor no exitosa.`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail
            ? `Detalle: ${errorData.detail}`
            : JSON.stringify(errorData);
        } catch (e) {
          errorMessage = `Error ${response.status}. Respuesta del servidor: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      const data: UploadResponse = await response.json();
      setAnalysisResult(data);
      setCurrentStep("results");

    } catch (error) {
      console.error("Error en la subida y análisis:", error);
      toast({
        title: "Error de Análisis",
        description: (error as Error).message,
        variant: "destructive",
      });
      setCurrentStep("configure");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar modales
  const handleOpenModal = useCallback((result: ImageResult) => {
    setSelectedImageResult(result)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedImageResult(null)
  }, [])

  const handleOpenHistoryListModal = useCallback(() => {
    if (onRequestHistoryModal) {
      // Si hay una función externa para manejar el modal, usarla
      onRequestHistoryModal()
    } else {
      // Si no, usar el modal interno (solo para casos donde PhotoAnalyzer no está dentro de otro modal)
      setIsModalOpen(false)
      setSelectedImageResult(null)
    }
  }, [onRequestHistoryModal])

  const handleViewHistoryDetail = useCallback((image: ImageResult) => {
    if (externalHistoryModalState?.onViewDetail) {
      // Usar la función externa si existe
      externalHistoryModalState.onViewDetail(image)
    } else {
      // Usar el modal interno
      setSelectedImageResult(image)
      setIsModalOpen(true)
    }
  }, [externalHistoryModalState])

  const handleBackToHistoryList = useCallback(() => {
    setIsModalOpen(false)
    setSelectedImageResult(null)
  }, [])

  const steps = [
    { id: "upload", label: "Subir", icon: Upload },
    { id: "configure", label: "Configurar", icon: FileText },
    { id: "analyze", label: "Analizar", icon: Sparkles },
    { id: "results", label: "Resultados", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div
      className={`w-full ${compact ? "min-h-0" : "min-h-screen"} ${compact ? "" : "bg-gradient-to-br from-slate-50 to-slate-100"} ${compact ? "py-0" : "py-4"} ${compact ? "px-0" : "px-3"}`}
    >
      <div className={compact ? "max-w-full" : "max-w-5xl mx-auto"}>
        {polygonData && (
          <div className={`${compact ? "mb-2 p-2" : "mb-4 p-3"} bg-blue-50 border border-blue-200 rounded-lg`}>
            <h3
              className={`${compact ? "text-xs" : "text-sm"} font-semibold text-blue-900 ${compact ? "mb-1" : "mb-1"}`}
            >
              📍 Datos del Polígono
            </h3>
            <div
              className={`${compact ? "text-[10px]" : "text-xs"} text-blue-800 ${compact ? "space-y-0.5" : "space-y-1"}`}
            >
              <p>
                <span className="font-medium">Ubicación:</span> {polygonData.locationName}
              </p>
              <p>
                <span className="font-medium">Elementos:</span> {polygonData.drawnItemsCount}
              </p>
            </div>
          </div>
        )}

        <div className={compact ? "mb-3" : "mb-6"}>
          <h2
            className={`${compact ? "text-lg" : "text-2xl"} font-normal text-slate-900 ${compact ? "mb-1" : "mb-2"}`}
          >
            Análisis de Imágenes
          </h2>
          <p className={`${compact ? "text-xs" : "text-sm"} text-slate-600`}>
            Detecta y cuantifica cuerpos de agua y cobertura vegetal mediante análisis de imágenes.
          </p>
        </div>

        {/* Stepper */}
        <Card className={`${compact ? "mb-3 p-3" : "mb-6 p-4"} border-0 shadow-sm bg-white`}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStepIndex === index
              const isCompleted = currentStepIndex > index

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`${compact ? "w-7 h-7" : "w-10 h-10"} rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? "bg-blue-600 text-white"
                        : isActive
                          ? "bg-blue-100 text-blue-600 ring-2 ring-blue-100"
                          : "bg-slate-100 text-slate-400"
                        }`}
                    >
                      {isCompleted ? (
                        <Check className={compact ? "w-3 h-3" : "w-4 h-4"} />
                      ) : (
                        <Icon className={compact ? "w-3 h-3" : "w-4 h-4"} />
                      )}
                    </div>
                    <span
                      className={`${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"} font-medium ${isActive ? "text-slate-900" : isCompleted ? "text-blue-600" : "text-slate-400"
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${compact ? "mx-1" : "mx-3"} transition-all duration-300 ${isCompleted ? "bg-blue-600" : "bg-slate-200"
                        }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <div className={`grid ${compact ? "lg:grid-cols-[1fr_280px] gap-3" : "lg:grid-cols-[1fr_350px] gap-4"}`}>
          <div>
            {currentStep === "upload" && (
              <Card
                className={`border-2 border-dashed rounded-xl ${compact ? "p-6" : "p-12"} text-center transition-all duration-300 cursor-pointer ${isDragging
                  ? "border-blue-500 bg-blue-50/50 shadow-lg scale-[1.02]"
                  : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50 shadow-sm"
                  }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={handleUploadAreaClick}
              >
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                />
                <div className="flex flex-col items-center">
                  <div
                    className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-full bg-blue-100 flex items-center justify-center ${compact ? "mb-2" : "mb-4"} transition-transform duration-300 hover:scale-110`}
                  >
                    <Upload className={compact ? "w-5 h-5" : "w-6 h-6 text-blue-600"} />
                  </div>
                  <h3
                    className={`${compact ? "text-base" : "text-xl"} font-normal text-slate-900 ${compact ? "mb-1" : "mb-2"}`}
                  >
                    Arrastra tus imágenes aquí
                  </h3>
                  <p className={`${compact ? "text-xs mb-3" : "text-sm mb-6"} text-slate-600`}>
                    o haz clic para seleccionar archivos
                  </p>
                  <Button
                    className={`bg-blue-600 hover:bg-blue-700 text-white ${compact ? "h-8 px-4 text-xs" : "h-10 px-6 text-sm"} font-medium rounded-lg shadow-sm`}
                  >
                    Seleccionar Imágenes
                  </Button>
                  <p className={`${compact ? "text-[10px] mt-2" : "text-xs mt-4"} text-slate-500`}>
                    JPG, PNG, WEBP • Máx. 10MB
                  </p>
                </div>
              </Card>
            )}

            {currentStep === "configure" && (
              <>
                <div className={compact ? "space-y-3" : "space-y-4"}>
                  {shouldHideEcosystemSelection && (
                    <Card className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-green-50 border-green-200`}>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`${compact ? "text-xs" : "text-sm"} font-semibold text-green-900 mb-1`}>
                            Ecosistema Configurado
                          </h4>
                          <p className={`${compact ? "text-[10px]" : "text-xs"} text-green-800`}>
                            <span className="font-medium">Nombre:</span> {ecosystemName}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {!shouldHideEcosystemSelection && (
                    <Card className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-white`}>
                      <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? "gap-2" : "gap-3"}`}>
                        <div>
                          <Label
                            htmlFor="ecosystem-select"
                            className={`${compact ? "mb-1 text-[10px]" : "mb-2 text-xs"} flex items-center font-medium text-slate-700`}
                          >
                            <Map className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1 text-blue-500`} />
                            Ecosistema
                          </Label>
                          <Select
                            id="ecosystem-select"
                            value={ecosystemId || "new"}
                            onChange={(e) => {
                              const value = e.target.value
                              setEcosystemId(value)
                              if (value === "new") {
                                setEcosystemName("")
                              } else {
                                const selected = ecosystems.find((e) => e.id.toString() === value)
                                setEcosystemName(selected ? selected.name : "")
                              }
                            }}
                            className={compact ? "h-7 text-xs" : "h-9"}
                          >
                            <option value="new">Nuevo cuerpo de agua</option>
                            {ecosystems.map((ecosystem) => (
                              <option key={ecosystem.id} value={ecosystem.id}>
                                {ecosystem.name} (ID: {ecosystem.id})
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="ecosystem-name"
                            className={`${compact ? "mb-1 text-[10px]" : "mb-2 text-xs"} flex items-center font-medium text-slate-700`}
                          >
                            <LandPlot className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1 text-blue-500`} />
                            Nombre
                          </Label>
                          <Input
                            id="ecosystem-name"
                            placeholder="Ej: Laguna de Términos"
                            value={ecosystemName}
                            onChange={(e) => setEcosystemName(e.target.value)}
                            disabled={!!ecosystems.find((e) => e.id.toString() === ecosystemId)}
                            className={compact ? "h-7 text-xs" : "h-9"}
                          />
                        </div>
                      </div>

                      <div
                        className={`${compact ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-slate-100 flex items-center justify-between`}
                      >
                        <p className={`${compact ? "text-[10px]" : "text-xs"} text-slate-500 flex items-center`}>
                          {loadingHistory ? (
                            <Loader2 className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1 animate-spin text-blue-500`} />
                          ) : (
                            <ListOrdered className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
                          )}
                          Historial: {historicalImages.length} capturas
                        </p>
                        <Button
                          onClick={handleOpenHistoryListModal}
                          variant="outline"
                          size="sm"
                          disabled={loadingHistory || historicalImages.length === 0}
                          className={`${compact ? "text-[9px] h-5" : "text-xs h-7"} text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent`}
                        >
                          {loadingHistory ? "Cargando..." : "Ver"}
                        </Button>
                      </div>
                    </Card>
                  )}

                  <h3 className={`${compact ? "text-xs" : "text-sm"} font-medium text-slate-900 flex items-center`}>
                    Imágenes ({selectedFiles.length})
                  </h3>

                  <div className={compact ? "space-y-2" : "space-y-4"}>
                    {selectedFiles.map((file, index) => (
                      <Card
                        key={index}
                        className={`${compact ? "p-2" : "p-3"} border-0 shadow-sm bg-white flex space-x-2`}
                      >
                        <div
                          className={`flex-shrink-0 ${compact ? "w-24 h-16" : "w-32 h-20"} relative rounded-lg overflow-hidden`}
                        >
                          <img
                            src={imagePreviewUrls[index] || "/placeholder.svg"}
                            alt={`Vista previa de ${file ? file.name : "imagen"}`}
                            style={getImageFilterStyle()}
                            className="w-full h-full object-cover transition-filter duration-300"
                          />
                          <div
                            className={`absolute inset-0 bg-black/30 flex items-center justify-center text-white ${compact ? "text-[9px]" : "text-xs"} font-medium px-1`}
                          >
                            {file.name}
                          </div>
                          <Button
                            onClick={() => handleRemoveFile(index)}
                            variant="destructive"
                            size="icon"
                            className={`absolute top-1 right-1 ${compact ? "h-4 w-4" : "h-5 w-5"} rounded-full opacity-80`}
                          >
                            <Trash2 className={compact ? "w-2 h-2" : "w-2.5 h-2.5"} />
                          </Button>
                        </div>
                        <div className={`flex-1 ${compact ? "space-y-1" : "space-y-2"}`}>
                          <div>
                            <Label
                              htmlFor={`date-${index}`}
                              className={`${compact ? "mb-0.5 text-[10px]" : "mb-1 text-xs"} flex items-center font-medium text-slate-700`}
                            >
                              <Calendar className={`${compact ? "w-2 h-2" : "w-3 h-3"} mr-1`} />
                              Fecha
                            </Label>
                            <Input
                              id={`date-${index}`}
                              type="datetime-local"
                              value={captureDates[index] || ""}
                              onChange={(e) => handleDateChange(index, e.target.value)}
                              className={compact ? "h-6 text-xs" : "h-8 text-sm"}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`desc-${index}`}
                              className={`${compact ? "mb-0.5 text-[10px]" : "mb-1 text-xs"} flex items-center font-medium text-slate-700`}
                            >
                              <FileText className={`${compact ? "w-2 h-2" : "w-3 h-3"} mr-1`} />
                              Descripción
                            </Label>
                            <Input
                              id={`desc-${index}`}
                              placeholder="Toma aérea con drone"
                              value={descriptions[index] || ""}
                              onChange={(e) => handleDescriptionChange(index, e.target.value)}
                              className={compact ? "h-6 text-xs" : "h-8 text-sm"}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    onClick={handleAddMoreClick}
                    variant="outline"
                    className={`w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 ${compact ? "h-8 text-xs" : "h-10 text-sm"} font-medium rounded-lg bg-transparent`}
                  >
                    <Plus className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
                    Añadir más
                  </Button>
                </div>
                <Input
                  type="file"
                  ref={configureFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                />
              </>
            )}

            {currentStep === "analyze" && (
              <Card className={`${compact ? "p-4" : "p-6"} border-0 shadow-sm bg-white text-center`}>
                <Loader2
                  className={`${compact ? "w-8 h-8" : "w-12 h-12"} mx-auto ${compact ? "mb-3" : "mb-4"} animate-spin text-blue-600`}
                />
                <h3
                  className={`${compact ? "text-lg" : "text-xl"} font-normal text-slate-900 ${compact ? "mb-1" : "mb-2"}`}
                >
                  Analizando Imágenes
                </h3>
                <p className={`${compact ? "text-xs" : "text-sm"} text-slate-600`}>
                  Procesando {selectedFiles.length} imágenes...
                </p>
              </Card>
            )}

            {currentStep === "results" && analysisResult && (
              <div className={compact ? "space-y-3" : "space-y-4"}>
                <Card className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-blue-50`}>
                  <h3
                    className={`${compact ? "text-base" : "text-lg"} font-semibold text-slate-900 ${compact ? "mb-1" : "mb-1"} flex items-center`}
                  >
                    Análisis Finalizado
                  </h3>
                </Card>

                <h4
                  className={`${compact ? "text-xs" : "text-sm"} font-medium text-slate-900 flex items-center border-b ${compact ? "pb-1" : "pb-2"}`}
                >
                  Resultados ({analysisResult.images.length})
                </h4>

                <div className={`grid grid-cols-1 ${compact ? "md:grid-cols-2 gap-2" : "md:grid-cols-2 gap-3"}`}>
                  {analysisResult.images.map((image, index) => (
                    <Card
                      key={image.id}
                      className={`${compact ? "p-2" : "p-3"} border shadow-sm bg-white ${compact ? "space-y-1" : "space-y-2"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-slate-900`}>
                          #{index + 1} (ID: {image.id})
                        </span>
                        <span className={`${compact ? "text-[9px]" : "text-[10px]"} text-slate-500 flex items-center`}>
                          <Calendar className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} mr-1`} />
                          {formatDateForDisplay(image.capture_date)}
                        </span>
                      </div>

                      <div className={`relative ${compact ? "h-20" : "h-24"} rounded-lg overflow-hidden bg-slate-100`}>
                        <img
                          src={`${REMOTE_BASE_URL}${image.image}` || "/placeholder.svg"}
                          alt={`Imagen ${image.id}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`grid grid-cols-2 ${compact ? "gap-1 text-[10px]" : "gap-2 text-xs"}`}>
                        <div
                          className={`flex items-center space-x-1 ${compact ? "p-1" : "p-2"} bg-blue-50 rounded-lg`}
                        >
                          <Droplets className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} text-blue-600 flex-shrink-0`} />
                          <div>
                            <p className={`text-slate-600 ${compact ? "text-[9px]" : "text-[10px]"}`}>Agua</p>
                            <p className={`font-bold text-blue-700 ${compact ? "text-[10px]" : "text-xs"}`}>
                              {image.water_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${compact ? "p-1" : "p-2"} bg-green-50 rounded-lg`}
                        >
                          <Leaf className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} text-green-600 flex-shrink-0`} />
                          <div>
                            <p className={`text-slate-600 ${compact ? "text-[9px]" : "text-[10px]"}`}>Lirio</p>
                            <p className={`font-bold text-green-700 ${compact ? "text-[10px]" : "text-xs"}`}>
                              {image.vegetation_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOpenModal(image)}
                        variant="secondary"
                        className={`w-full text-blue-600 bg-slate-100 hover:bg-slate-200 ${compact ? "h-6 text-[10px]" : "h-8 text-xs"}`}
                      >
                        <Eye className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} mr-1`} />
                        Detalle
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={compact ? "space-y-3" : "space-y-4"}>
            {currentStep === "configure" && (
              <Card className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-white`}>
                <h3
                  className={`${compact ? "text-xs" : "text-sm"} font-medium text-slate-900 ${compact ? "mb-2" : "mb-3"}`}
                >
                  Ajustes de Vista Previa
                </h3>
                <div className={compact ? "space-y-1" : "space-y-2"}>
                  {(Object.keys(filterValues) as Array<keyof FilterValues>).map((key) => (
                    <div key={key}>
                      <div className={`flex justify-between items-center ${compact ? "mb-1" : "mb-1"}`}>
                        <Label
                          className={`${compact ? "text-[10px]" : "text-xs"} font-medium text-slate-700 capitalize`}
                        >
                          {key === "brightness" ? "Brillo" : key === "contrast" ? "Contraste" : "Saturación"}
                        </Label>
                        <span className={`${compact ? "text-[10px]" : "text-xs"} font-medium text-slate-900`}>
                          {filterValues[key]}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={filterValues[key]}
                        onChange={(e) => setFilterValues((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-white`}>
              <div className={compact ? "space-y-1" : "space-y-2"}>
                {currentStep === "configure" && (
                  <>
                    <Button
                      onClick={() => handleAnalyze()}
                      disabled={
                        selectedFiles.length === 0 ||
                        loadingHistory ||
                        !((ecosystemId && ecosystemId.trim()) || ecosystemName.trim())
                      }
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${compact ? "h-8 text-xs" : "h-10 text-sm"} font-medium rounded-lg shadow-sm`}
                    >
                      {loadingHistory ? (
                        <Loader2 className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1 animate-spin`} />
                      ) : (
                        "Iniciar Análisis"
                      )}
                    </Button>
                    <Button
                      onClick={() => setCurrentStep("upload")}
                      variant="outline"
                      className={`w-full border-slate-300 text-blue-600 hover:bg-slate-50 ${compact ? "h-8 text-xs" : "h-10 text-sm"} font-medium rounded-lg`}
                    >
                      <ChevronLeft className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
                      Volver
                    </Button>
                  </>
                )}

                {currentStep === "results" && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className={`w-full border-slate-300 text-slate-700 hover:bg-slate-50 ${compact ? "h-8 text-xs" : "h-10 text-sm"} font-medium rounded-lg`}
                  >
                    Nuevo Análisis
                  </Button>
                )}

                {currentStep === "upload" && selectedFiles.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep("configure")}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${compact ? "h-8 text-xs" : "h-10 text-sm"} font-medium rounded-lg shadow-sm`}
                  >
                    Continuar
                    <ChevronRight className={`${compact ? "w-3 h-3" : "w-4 h-4"} ml-1`} />
                  </Button>
                )}
              </div>
            </Card>

            {currentStep !== "results" && (
              <Card
                className={`${compact ? "p-3" : "p-4"} border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100`}
              >
                <div>
                  <h4
                    className={`${compact ? "text-[10px]" : "text-xs"} font-medium text-slate-900 ${compact ? "mb-0.5" : "mb-1"}`}
                  >
                    Análisis de Imagen
                  </h4>
                  <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-slate-700 leading-relaxed`}>
                    Sistema de detección y cuantificación de áreas de agua y Lirio con alta precisión.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de Detalle de Imagen (solo se muestra internamente) */}
        {shouldShowInternalModals && (
          <ImageDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            result={selectedImageResult}
            remoteBaseUrl={REMOTE_BASE_URL}
            historicalImages={historicalImages}
            onBackToList={handleBackToHistoryList}
          />
        )}
      </div>

      <Toaster />
    </div>
  )
}