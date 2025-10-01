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

interface ImageResult {
  id: number;
  image: string;
  description: string;
  water_percentage: number;
  water_area_m2: number;
  vegetation_percentage: number;
  vegetation_area_m2: number;
}

interface UploadResponse {
  message: string;
  ecosystem_id: number;
  ecosystem_name: string;
  images: ImageResult[];
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
  const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null)

  const [ecosystemName, setEcosystemName] = useState<string>("")
  const [ecosystemId, setEcosystemId] = useState<string | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>([])

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


  const API_BASE_URL = "http://72.60.127.75"
  // URL remota real (solo para cargar las imágenes que ya están en el servidor)
  // const REMOTE_BASE_URL = "http://72.60.127.75" 

  // ------------------------------ //
  // EFECTOS Y UTILIDADES //
  // ------------------------------ //

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(urls)
    setAnalysisResult(null)

    if (selectedFiles.length > descriptions.length) {
      setDescriptions((prev) => [
        ...prev,
        ...Array(selectedFiles.length - prev.length).fill(""),
      ])
    } else if (selectedFiles.length < descriptions.length) {
      setDescriptions((prev) => prev.slice(0, selectedFiles.length))
    }

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

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
    setDescriptions((prevDesc) => prevDesc.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleReset = useCallback(() => {
    setSelectedFiles([])
    setAnalysisResult(null)
    setDescriptions([])
    setEcosystemName("")
    setEcosystemId(null)
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
        description: "Por favor, selecciona al menos una imagen para subir y analizar.",
        variant: "destructive",
      })
      return
    }

    if (!ecosystemName.trim()) {
      toast({
        title: "¡Atención!",
        description: "El nombre del cuerpo de agua (Ecosystem Name) es requerido.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("ecosystem_name", ecosystemName.trim())
      if (ecosystemId) {
        formData.append("ecosystem_id", ecosystemId)
      }

      selectedFiles.forEach((file) => {
        formData.append("images", file)
      })

      if (descriptions.some(desc => desc.trim() !== "")) {
        formData.append("descriptions", JSON.stringify(descriptions))
      }

      // La solicitud usa la ruta local de proxy: /api/backend/images/upload-multiple/
      const response = await fetch(`${API_BASE_URL}/images/upload-multiple/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`

        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData) || errorMessage
        } catch (parseError) {
          const textError = await response.text()
          if (textError) errorMessage = textError
        }

        throw new Error(errorMessage)
      }

      const result: UploadResponse = await response.json()
      setAnalysisResult(result)

      // Muestra la respuesta en consola
      console.log("RESPUESTA COMPLETA DE LA API:", result);

      toast({
        title: "Subida y Análisis Completado",
        description: result.message || "Las imágenes se subieron y analizaron con éxito.",
        variant: "default",
      })

    } catch (error) {
      console.error("ERROR al subir y analizar las imágenes:", error)

      let errorMessage = "Hubo un problema al conectar con el servidor. Inténtalo de nuevo."

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "No se pudo conectar con el servidor (o el proxy falló). Verifica tu configuración de Next.js y la API remota."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error de Subida/Análisis",
        description: errorMessage,
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
        <div className="grid md:grid-cols-2 gap-12">
          {/* Sección de Carga y Previsualización */}
          <div className="flex flex-col gap-6">
            {/* Campo para Ecosystem Name/ID */}
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-red-800 mb-4">Información del Cuerpo de Agua</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ecosystem-name" className="text-sm font-medium text-gray-700">Nombre del Cuerpo de Agua *</Label>
                  <Input
                    id="ecosystem-name"
                    value={ecosystemName}
                    onChange={(e) => setEcosystemName(e.target.value)}
                    placeholder="Ej: Laguna de Términos"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="ecosystem-id" className="text-sm font-medium text-gray-700">ID del Ecosistema (Opcional)</Label>
                  <Input
                    id="ecosystem-id"
                    value={ecosystemId || ''}
                    onChange={(e) => setEcosystemId(e.target.value || null)}
                    placeholder="Ej: 12345 (Para actualizar)"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
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
                  descriptions={descriptions}
                  onDescriptionChange={(index, desc) => {
                    setDescriptions((prev) =>
                      prev.map((item, i) => i === index ? desc : item)
                    )
                  }}
                />
                <FileControls onAddMore={() => fileInputRef.current?.click()} onReset={handleReset} />
              </div>
            )}
          </div>

          {/* Sección de Controles y Resultados */}
          <ImageControls
            isDisabled={isControlsDisabled || !ecosystemName.trim()}
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

const ImagePreviews = ({ imagePreviewUrls, getImageFilterStyle, onRemoveFile, descriptions, onDescriptionChange }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
    {imagePreviewUrls.map((url: string, index: number) => (
      <div key={index} className="relative shadow-md rounded-lg overflow-hidden group border border-gray-200 bg-white">
        <div className="aspect-[4/3] relative">
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
            className="absolute top-2 right-2 p-1 h-auto w-auto bg-black bg-opacity-40 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="p-2 border-t border-gray-200">
          <Label htmlFor={`desc-${index}`} className="text-xs font-medium text-gray-600">Descripción (Opcional)</Label>
          <Input
            id={`desc-${index}`}
            value={descriptions[index] || ""}
            onChange={(e) => onDescriptionChange(index, e.target.value)}
            placeholder={`Descripción para ${index + 1}`}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>
    ))}
  </div>
)

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
          <span className="font-semibold">Subiendo y Analizando...</span>
        ) : (
          <span className="font-semibold">Subir y Analizar</span>
        )}
      </Button>
    </div>

    {/* Se pasa la URL remota para cargar la imagen subida si la API devuelve un path */}
    {analysisResult && <AnalysisResults remoteBaseUrl={"http://72.60.127.75"} result={analysisResult as UploadResponse} />}
  </div>
)

// Componente para mostrar la respuesta cruda de la API
const AnalysisResults = ({ result, remoteBaseUrl }: { result: UploadResponse, remoteBaseUrl: string }) => {
  const BASE_URL = remoteBaseUrl;

  return (
    <div className="mt-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
      <h3 className="font-bold text-red-800 text-2xl mb-2 text-center uppercase">Resultados del API</h3>
      <div className="w-20 h-0.5 bg-red-800 mx-auto mb-4"></div>

      {/* Información General */}
      <div className="text-center mb-6 p-4 border rounded-lg bg-gray-100">
        <p className="text-gray-600 text-lg">
          Mensaje: <span className="font-extrabold text-red-800">{result.message}</span>
        </p>
        <p className="text-gray-500 text-sm">
          Ecosistema: {result.ecosystem_name} (ID: {result.ecosystem_id})
        </p>
      </div>

      <div className="mt-4 border-t border-gray-300 pt-4">
        <h4 className="font-semibold text-red-700 mb-4 text-center">Detalle por Imagen (Respuesta Cruda):</h4>
        <ul className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {/* Iteración sobre el array 'images' */}
          {result.images.map((res) => (
            <li
              key={res.id}
              className="flex flex-col md:flex-row items-start justify-between text-gray-600 bg-gray-50 p-4 rounded-lg shadow-md border-2 border-red-200"
            >
              <div className="flex flex-col flex-1 w-full md:w-auto">
                <div className="grid grid-cols-1 gap-y-1 text-sm w-full">
                  <p><span className="font-bold text-red-700">id:</span> {res.id}</p>
                  <p><span className="font-bold text-gray-700">image:</span> <span className="break-all">{res.image}</span></p>
                  <p><span className="font-bold text-gray-700">description:</span> {res.description || "[]"}</p>
                  <p><span className="font-bold text-blue-700">water_percentage:</span> {res.water_percentage}</p>
                  <p><span className="font-bold text-blue-700">water_area_m2:</span> {res.water_area_m2}</p>
                  <p><span className="font-bold text-green-700">vegetation_percentage:</span> {res.vegetation_percentage}</p>
                  <p><span className="font-bold text-green-700">vegetation_area_m2:</span> {res.vegetation_area_m2}</p>
                </div>
              </div>

              {/* Vista previa de la imagen subida */}
              <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-4 flex justify-center">
                {res.image && (
                  <div className="flex flex-col items-center">
                    <img
                      src={`${BASE_URL}${res.image}`}
                      alt={`Imagen ${res.id}`}
                      className="w-32 h-24 object-cover rounded-md border-2 border-gray-300 shadow-inner"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">Vista Previa</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PhotoAnalyzer