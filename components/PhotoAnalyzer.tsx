"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Upload, Settings, X, PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// ------------------------------ //
// INTERFACES Y TIPOS //
// ------------------------------ //

interface IndividualResult {
  filename: string
  area_pixels?: number
  mask_base64?: string
  overlay_base64?: string
  error?: string
}

interface AnalysisResult {
  total_area_pixels: number
  message: string
  individual_results: IndividualResult[]
}

interface FilterValues {
  brightness: number
  contrast: number
  saturate: number
  sepia: number
  hueRotate: number
  opacity: number
}

// ------------------------------ //
// COMPONENTE PRINCIPAL //
// ------------------------------ //

const PhotoAnalyzer = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [filterValues, setFilterValues] = useState<FilterValues>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    hueRotate: 0,
    opacity: 100,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // ------------------------------ //
  // EFECTOS //
  // ------------------------------ //

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(urls)
    setAnalysisResult(null)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  // ------------------------------ //
  // FUNCIONES DE UTILIDAD Y MANEJADORES //
  // ------------------------------ //

  const getImageFilterStyle = useCallback(() => {
    const { brightness, contrast, saturate, sepia, hueRotate, opacity } = filterValues
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg) opacity(${opacity}%)`,
    }
  }, [filterValues])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleRemoveFile = useCallback((indexToRemove: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleReset = useCallback(() => {
    setSelectedFiles([])
    setAnalysisResult(null)
    setFilterValues({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      sepia: 0,
      hueRotate: 0,
      opacity: 100,
    })
  }, [])

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "¡Atención!",
        description: "Por favor, selecciona al menos una imagen para analizar.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append(`files`, file)
      })

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`)
      }

      const result: AnalysisResult = await response.json()
      setAnalysisResult(result)
      toast({
        title: "Análisis completado",
        description: "El análisis de las imágenes se realizó con éxito.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al analizar las imágenes:", error)
      toast({
        title: "Error de análisis",
        description: "Hubo un problema al conectar con el servidor. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isControlsDisabled = selectedFiles.length === 0 || loading
  const filterKeys = Object.keys(filterValues) as Array<keyof FilterValues>

  // ------------------------------ //
  // RENDERIZADO //
  // ------------------------------ //

  return (
    <div className="flex justify-center py-16 px-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl rounded-lg">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl text-red-800 uppercase">Análisis de Imagen</h1>
            <div className="w-24 h-1 bg-red-800 mt-2 mb-4"></div>
            <p className="text-gray-600 mt-2 text-md md:text-lg">
              Sube y ajusta tus imágenes para un análisis detallado del área de agua.
            </p>
          </div>
          <Button variant="ghost" className="p-2 h-auto text-red-700 hover:text-red-800 hover:bg-red-50 mt-4 md:mt-0">
            <Settings size={24} />
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Sección de Carga y Previsualización */}
          <div className="flex flex-col gap-6">
            {selectedFiles.length === 0 ? (
              <FileUploadArea
                onAreaClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <ImagePreviews
                  imagePreviewUrls={imagePreviewUrls}
                  getImageFilterStyle={getImageFilterStyle}
                  onRemoveFile={handleRemoveFile}
                />
                <FileControls onAddMore={() => fileInputRef.current?.click()} onReset={handleReset} />
              </div>
            )}
          </div>

          {/* Sección de Controles y Resultados */}
          <ImageControls
            isDisabled={isControlsDisabled}
            filterValues={filterValues}
            filterKeys={filterKeys}
            onSliderChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
            onAnalyze={handleAnalyze}
            loading={loading}
            analysisResult={analysisResult}
          />
        </div>
      </div>
    </div>
  )
}

// ------------------------------ //
// COMPONENTES SECUNDARIOS //
// ------------------------------ //

const FileUploadArea = ({ onAreaClick, fileInputRef, onFileChange }: any) => (
  <div
    onClick={onAreaClick}
    className="flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 transition-colors duration-200 cursor-pointer hover:bg-gray-200 hover:border-gray-400 relative aspect-video min-h-[250px]"
  >
    <Input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" multiple />
    <Upload className="text-6xl text-gray-400 mb-4" />
    <p className="text-xl font-semibold">Selecciona imágenes para empezar</p>
    <p className="text-md mt-2 text-gray-400">Haz clic o arrastra y suelta archivos aquí</p>
  </div>
)

const ImagePreviews = ({ imagePreviewUrls, getImageFilterStyle, onRemoveFile }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
    {imagePreviewUrls.map((url: string, index: number) => (
      <div key={index} className="relative aspect-[4/3] shadow-md rounded-lg overflow-hidden group">
        <img
          src={url || "/placeholder.svg"}
          alt={`Vista previa ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          style={getImageFilterStyle()}
        />
        <Button
          onClick={() => onRemoveFile(index)}
          variant="ghost"
          aria-label={`Eliminar imagen ${index + 1}`}
          className="absolute top-2 right-2 p-1 h-auto w-auto bg-black bg-opacity-40 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
        >
          <X size={16} />
        </Button>
      </div>
    ))}
  </div>
)

const FileControls = ({ onAddMore, onReset }: any) => (
  <div className="flex gap-4">
    <Button
      onClick={onAddMore}
      variant="outline"
      className="flex-1 py-2 text-gray-600 border-gray-300 hover:bg-gray-100 flex items-center gap-2 bg-transparent"
    >
      <PlusCircle size={18} /> Agregar más
    </Button>
    <Button
      onClick={onReset}
      variant="outline"
      className="flex-1 py-2 text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2 bg-transparent"
    >
      <Trash2 size={18} /> Vaciar todo
    </Button>
  </div>
)

const ImageControls = ({
  isDisabled,
  filterValues,
  filterKeys,
  onSliderChange,
  onAnalyze,
  loading,
  analysisResult,
}: any) => (
  <div
    className={`p-6 md:p-8 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-300 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
  >
    <h2 className="text-2xl font-semibold text-red-800 mb-2">Ajustes de la imagen</h2>
    <div className="w-16 h-0.5 bg-red-800 mb-4"></div>
    <Separator className="mb-6 bg-gray-300" />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
      {filterKeys.map((key: keyof FilterValues) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor={`slider-${key}`} className="text-sm font-normal text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Label>
            <span className="text-sm font-semibold text-red-700">
              {filterValues[key]}
              {key === "hueRotate" ? "°" : "%"}
            </span>
          </div>
          <Input
            type="range"
            id={`slider-${key}`}
            min={0}
            max={key === "hueRotate" ? 360 : 200}
            value={filterValues[key]}
            onChange={(e) => onSliderChange(key, Number(e.target.value))}
            disabled={isDisabled}
            className="accent-red-700"
          />
        </div>
      ))}
    </div>

    <div className="mt-8 flex justify-end">
      <Button
        onClick={onAnalyze}
        disabled={isDisabled || loading}
        className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-6 py-2 text-base shadow-sm transition-all duration-200"
      >
        {loading ? (
          <span className="font-semibold">Analizando...</span>
        ) : (
          <span className="font-semibold">Analizar</span>
        )}
      </Button>
    </div>

    {analysisResult && <AnalysisResults result={analysisResult} />}
  </div>
)

const AnalysisResults = ({ result }: { result: AnalysisResult }) => (
  <div className="mt-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
    <h3 className="font-bold text-red-800 text-2xl mb-2 text-center uppercase">Resultados del Análisis</h3>
    <div className="w-20 h-0.5 bg-red-800 mx-auto mb-4"></div>
    <p className="text-gray-600 text-lg mb-4 text-center">
      Área total de agua:{" "}
      <span className="font-extrabold text-red-800 text-3xl">{result.total_area_pixels.toLocaleString()}</span>{" "}
      píxeles².
    </p>
    <div className="mt-4 border-t border-gray-300 pt-4">
      <h4 className="font-semibold text-red-700 mb-2 text-center">Detalle de cada imagen:</h4>
      <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {result.individual_results.map((res, index) => (
          <li
            key={index}
            className="flex flex-col md:flex-row items-center justify-between text-gray-600 bg-gray-50 p-4 rounded-lg shadow-sm"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0 md:mr-4 flex-1">
              <span className="font-semibold text-red-800 truncate w-full">{res.filename}</span>
              {res.error ? (
                <span className="text-red-600 text-sm mt-1 font-semibold">Error: {res.error}</span>
              ) : (
                <span className="text-sm font-semibold text-gray-600 mt-1">
                  Área: {res.area_pixels?.toLocaleString() || "N/A"} px²
                </span>
              )}
            </div>

            <div className="flex-shrink-0 flex gap-4">
              {res.overlay_base64 && (
                <div className="flex flex-col items-center">
                  <img
                    src={`data:image/png;base64,${res.overlay_base64}`}
                    alt={`Overlay de ${res.filename}`}
                    className="w-24 h-18 object-cover rounded-md border-2 border-gray-300"
                  />
                  <span className="text-xs text-gray-500 mt-1">Overlay</span>
                </div>
              )}
              {res.mask_base64 && (
                <div className="flex flex-col items-center">
                  <img
                    src={`data:image/png;base64,${res.mask_base64}`}
                    alt={`Máscara de ${res.filename}`}
                    className="w-24 h-18 object-cover rounded-md border-2 border-gray-300"
                  />
                  <span className="text-xs text-gray-500 mt-1">Máscara</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

export default PhotoAnalyzer
