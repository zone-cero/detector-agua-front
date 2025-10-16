
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
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
  ZoomIn,
  Ruler, // Asumiendo que Ruler se usa en ImageDetailModal
} from "lucide-react"

const REMOTE_BASE_URL = "http://72.60.127.75"

console.log("url:", REMOTE_BASE_URL)
// ------------------------------ //
// INTERFACES Y TIPOS //
// ------------------------------ //

interface ImageResult {
  id: number
  image: string
  description: string
  water_percentage: number
  water_area_m2: number
  vegetation_percentage: number
  vegetation_area_m2: number
  // Añadido para un resultado completo si lo necesitas
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

// ------------------------------ //
// COMPONENTE PRINCIPAL //
// ------------------------------ //

const PhotoAnalyzer = () => {
  const [currentStep, setCurrentStep] = useState<StepType>("upload")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [ecosystemName, setEcosystemName] = useState<string>("")
  const [ecosystemId, setEcosystemId] = useState<string | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>([])
  const [captureDates, setCaptureDates] = useState<string[]>([])

  const [filterValues, setFilterValues] = useState<FilterValues>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageResult, setSelectedImageResult] = useState<ImageResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // ------------------------------ //
  // EFECTOS Y UTILIDADES //
  // ------------------------------ //

  /**
   * 💡 FUNCIÓN MODIFICADA: Ahora solo genera el formato 'AAAA-MM-DD'
   * (para usar con input type="date").
   */
  const getNowDatetimeLocal = () => {
    const now = new Date()
    // Ajusta la zona horaria para obtener la hora local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    // Genera 'AAAA-MM-DD'
    return now.toISOString().slice(0, 10)
  }

  useEffect(() => {
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(urls)

    // Sincronización de descripciones
    if (selectedFiles.length !== descriptions.length) {
      const diff = selectedFiles.length - descriptions.length;
      setDescriptions((prev) =>
        diff > 0
          ? [...prev, ...Array(diff).fill("")]
          : prev.slice(0, selectedFiles.length)
      );
    }

    // 🚀 CORRECCIÓN CLAVE: Inicialización con fecha y HORA para el input datetime-local
    if (selectedFiles.length !== captureDates.length) {
      const diff = selectedFiles.length - captureDates.length;
      if (diff > 0) {
        // Usamos la función auxiliar para obtener el formato AAAA-MM-DDTHH:MM
        const nowString = getNowDatetimeLocal()
        setCaptureDates((prev) => [...prev, ...Array(diff).fill(nowString)])
      } else {
        setCaptureDates((prev) => prev.slice(0, selectedFiles.length))
      }
    }

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  const getImageFilterStyle = useCallback(() => {
    const { brightness, contrast, saturate } = filterValues
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
    }
  }, [filterValues])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
        if (currentStep === "upload") {
          setCurrentStep("configure")
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
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
    setCurrentStep("upload")
    setFilterValues({
      brightness: 100,
      contrast: 100,
      saturate: 100,
    })
  }, [])

  const validateForm = () => {
    if (selectedFiles.length === 0) {
      return "Por favor, selecciona al menos una imagen para analizar."
    }
    if (!ecosystemName.trim()) {
      return "El nombre del cuerpo de agua es requerido."
    }
    const missingDates = captureDates.some((date) => !date)
    if (missingDates) {
      return "Todas las imágenes deben tener una fecha de captura."
    }
    return null
  }

  
 /**
 * 💡 FUNCIÓN MODIFICADA: Normaliza la entrada para retornar SOLO la fecha (YYYY-MM-DD).
 */
const normalizeDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    
    // Si contiene la 'T' (hora), extrae solo la fecha.
    if (dateString.includes("T")) {
        return dateString.split("T")[0]; 
    }
    
    // De lo contrario, retorna el string de fecha (ej: '2025-10-03')
    return dateString;
};

  // ----------------------------------------------------
  // 🎯 FUNCIÓN PRINCIPAL: Maneja el proceso de análisis y envío de datos.
  // ----------------------------------------------------
  const handleAnalyze = async () => {
    // 1. VALIDACIÓN
    const validationError = validateForm()
    if (validationError) {
      toast({
        title: "Atención",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setCurrentStep("analyze")

    try {
      // 2. CONSTRUCCIÓN DEL FORMDATA y NORMALIZACIÓN DE DATOS
      const formData = new FormData()

      formData.append("ecosystem_name", ecosystemName.trim())
      if (ecosystemId && ecosystemId.trim()) {
        formData.append("ecosystem_id", ecosystemId.trim())
      }

      // ✅ IMÁGENES: Usando el nombre simple 'images'.
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // 🚀 SOLUCIÓN CLAVE: Usamos 'campo[]' para forzar la codificación como lista en FormData

      // ✅ FECHAS (Aquí se construye el array en el FormData)
      captureDates.forEach((date) => {
        const normalizedDate = normalizeDateForAPI(date); // Llama a la función de normalización
        formData.append("capture_dates[]", normalizedDate || "");
      });

      // ... (código dentro de handleAnalyze antes de la solicitud fetch)

      // ✅ DESCRIPCIONES
      descriptions.forEach((desc) => {
        formData.append("descriptions[]", desc || "");
      });

      // ----------------------------------------------------
      // 💡 MODIFICACIÓN: Mostrar el contenido del FormData como JSON-like
      // ----------------------------------------------------
      console.log("Datos enviados en FormData (Representación):");
      const formDataObject: { [key: string]: any } = {};

      for (const [key, value] of formData.entries()) {
        // Si el valor es un archivo, solo mostramos el nombre y tipo
        if (value instanceof File) {
          const fileInfo = {
            name: value.name,
            size: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
            type: value.type
          };
          // Manejo de arrays (como images[], capture_dates[], descriptions[])
          if (key.endsWith("[]")) {
            const baseKey = key.slice(0, -2);
            if (!formDataObject[baseKey]) {
              formDataObject[baseKey] = [];
            }
            formDataObject[baseKey].push(fileInfo);
          } else {
            formDataObject[key] = fileInfo;
          }
        } else {
          // Manejo de arrays (para texto/fechas)
          if (key.endsWith("[]")) {
            const baseKey = key.slice(0, -2);
            if (!formDataObject[baseKey]) {
              formDataObject[baseKey] = [];
            }
            formDataObject[baseKey].push(value);
          } else {
            formDataObject[key] = value;
          }
        }
      }

      // Imprimir el objeto como JSON para una visualización clara
      console.log(JSON.stringify(formDataObject, null, 2));
      // ----------------------------------------------------
      // ----------------------------------------------------

      // 3. ENVÍO DE LA SOLICITUD
      const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/images/upload-multiple/`, {
        method: "POST",
        body: formData,
      })

      // 4. MANEJO DE RESPUESTAS NO OK (4xx, 5xx)
      if (!response.ok) {
        const responseBody = await response.text()
        let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`

        try {
          const errorData = JSON.parse(responseBody)
          // Intenta obtener el error más específico
          errorMessage = errorData.error || errorData.detail || errorData.capture_dates?.[0] || errorData.message || responseBody || errorMessage
        } catch (parseError) {
          if (responseBody) errorMessage = responseBody
        }

        throw new Error(errorMessage)
      }

      // 5. MANEJO DE RESPUESTA EXITOSA
      const result: UploadResponse = await response.json()
      setAnalysisResult(result)
      setCurrentStep("results")

      toast({
        title: "Análisis Completado",
        description: result.message || "Las imágenes se analizaron con éxito.",
        variant: "default",
      })
    } catch (error) {
      // 6. MANEJO DE ERRORES DE RED O ERRORES LANZADOS
      let errorMessage = "Ocurrió un error inesperado."

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "No se pudo conectar con el servidor. Verifica la conexión."
        } else {
          errorMessage = error.message
        }
      }

      console.error("ERROR al analizar las imágenes:", errorMessage)

      toast({
        title: "Error de Análisis",
        description: errorMessage,
        variant: "destructive",
      })

      setCurrentStep("configure")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = useCallback((result: ImageResult) => {
    setSelectedImageResult(result)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // ------------------------------ //
  // RENDERIZADO //
  // ------------------------------ //

  // Nota: Faltan las definiciones de ImageDetailModal, UploadStep, ConfigureStep, AnalyzeStep y ResultsStep 
  // para que el código compile y se muestre, pero asumo que existen en otro archivo.

  const steps = [
    { id: "upload", label: "Subir", icon: Upload },
    { id: "configure", label: "Configurar", icon: FileText },
    { id: "analyze", label: "Analizar", icon: Sparkles },
    { id: "results", label: "Resultados", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[32px] font-normal text-slate-900 mb-2">Análisis de Imágenes</h2>
          <p className="text-[16px] text-slate-600">
            Detecta y cuantifica áreas de agua y vegetación con inteligencia artificial
          </p>
        </div>

        {/* Stepper */}
        <Card className="mb-8 p-6 border-0 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStepIndex === index
              const isCompleted = currentStepIndex > index
              const isDisabled = currentStepIndex < index

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? "bg-blue-600 text-white"
                        : isActive
                          ? "bg-blue-100 text-blue-600 ring-4 ring-blue-100"
                          : "bg-slate-100 text-slate-400"
                        }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span
                      className={`mt-2 text-[13px] font-medium ${isActive ? "text-slate-900" : isCompleted ? "text-blue-600" : "text-slate-400"
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 transition-all duration-300 ${isCompleted ? "bg-blue-600" : "bg-slate-200"
                        }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Content Area */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content */}
          <div>
            {currentStep === "upload" && (
              <UploadStep
                isDragging={isDragging}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onAreaClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            )}

            {currentStep === "configure" && (
              <ConfigureStep
                selectedFiles={selectedFiles}
                imagePreviewUrls={imagePreviewUrls}
                getImageFilterStyle={getImageFilterStyle}
                onRemoveFile={handleRemoveFile}
                descriptions={descriptions}
                captureDates={captureDates}
                onDescriptionChange={handleDescriptionChange}
                onDateChange={handleDateChange}
                ecosystemName={ecosystemName}
                setEcosystemName={setEcosystemName}
                ecosystemId={ecosystemId}
                setEcosystemId={setEcosystemId}
                onAddMore={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            )}

            {currentStep === "analyze" && <AnalyzeStep loading={loading} />}

            {currentStep === "results" && analysisResult && (
              <ResultsStep result={analysisResult} remoteBaseUrl={REMOTE_BASE_URL} onOpenModal={handleOpenModal} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {currentStep === "configure" && (
              <Card className="p-6 border-0 shadow-sm bg-white">
                <h3 className="text-[18px] font-medium text-slate-900 mb-4">Ajustes de Vista Previa</h3>
                <p className="text-[13px] text-slate-600 mb-6">
                  Estos ajustes solo afectan la vista previa, no el análisis final
                </p>
                <div className="space-y-4">
                  {(Object.keys(filterValues) as Array<keyof FilterValues>).map((key) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-[13px] font-medium text-slate-700 capitalize">
                          {key === "brightness" ? "Brillo" : key === "contrast" ? "Contraste" : "Saturación"}
                        </Label>
                        <span className="text-[13px] font-medium text-slate-900">{filterValues[key]}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={filterValues[key]}
                        onChange={(e) => setFilterValues((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="space-y-3">
                {currentStep === "configure" && (
                  <>
                    <Button
                      onClick={() => handleAnalyze()}
                      disabled={selectedFiles.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-[14px] font-medium rounded-lg shadow-sm"
                    >
                      Iniciar Análisis
                    </Button>
                    <Button
                      onClick={() => setCurrentStep("upload")}
                      variant="outline"
                      className="w-full border-slate-300 text-blue-600 hover:bg-slate-50 h-11 text-[14px] font-medium rounded-lg hover:text-blue-600"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Volver
                    </Button>
                  </>
                )}

                {currentStep === "results" && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 h-11 text-[14px] font-medium rounded-lg bg-transparent"
                  >
                    Nuevo Análisis
                  </Button>
                )}

                {currentStep === "upload" && selectedFiles.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep("configure")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-[14px] font-medium rounded-lg shadow-sm"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>

            {/* Info Card */}
            {currentStep !== "results" && (
              <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-start gap-3">

                  <div>
                    <h4 className="text-[14px] font-medium text-slate-900 mb-1">Análisis de imagen</h4>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      Nuestro sistema utiliza IA avanzada para detectar y cuantificar áreas de agua y vegetación con
                      alta precisión
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modal */}
        <ImageDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          result={selectedImageResult}
          remoteBaseUrl={REMOTE_BASE_URL}
        />
      </div>
    </div>
  )
}

// ------------------------------ //
// STEP COMPONENTS //
// ------------------------------ //

interface UploadStepProps {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onAreaClick: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const UploadStep: React.FC<UploadStepProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onAreaClick,
  fileInputRef,
  onFileChange,
}) => (
  <Card
    className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${isDragging
      ? "border-blue-500 bg-blue-50/50 shadow-lg scale-[1.02]"
      : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50 shadow-sm"
      }`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={onAreaClick}
  >
    <Input
      type="file"
      ref={fileInputRef}
      onChange={onFileChange}
      className="hidden"
      accept="image/jpeg,image/png,image/webp"
      multiple
    />
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110">
        <Upload className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className="text-[24px] font-normal text-slate-900 mb-2">Arrastra tus imágenes aquí</h3>
      <p className="text-[15px] text-slate-600 mb-8">o haz clic para seleccionar archivos</p>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 text-[14px] font-medium rounded-lg shadow-sm">
        Seleccionar Imágenes
      </Button>
      <p className="text-[13px] text-slate-500 mt-6">Formatos: JPG, PNG, WEBP • Máximo 10MB por imagen</p>
    </div>
  </Card>
)

interface ConfigureStepProps {
  selectedFiles: File[]
  imagePreviewUrls: string[]
  getImageFilterStyle: () => React.CSSProperties
  onRemoveFile: (index: number) => void
  descriptions: string[]
  captureDates: string[]
  onDescriptionChange: (index: number, desc: string) => void
  onDateChange: (index: number, date: string) => void
  ecosystemName: string
  setEcosystemName: (name: string) => void
  ecosystemId: string | null
  setEcosystemId: (id: string) => void
  onAddMore: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ConfigureStep: React.FC<ConfigureStepProps> = ({
  selectedFiles,
  imagePreviewUrls,
  getImageFilterStyle,
  onRemoveFile,
  descriptions,
  captureDates,
  onDescriptionChange,
  onDateChange,
  ecosystemName,
  setEcosystemName,
  ecosystemId,
  setEcosystemId,
  onAddMore,
  fileInputRef,
  onFileChange,
}) => (
  <div className="space-y-6">
    {/* Ecosystem Info */}
    <Card className="p-6 border-0 shadow-sm bg-white">
      <h3 className="text-[20px] font-medium text-slate-900 mb-4">Información del Sitio</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-[13px] font-medium text-slate-700 mb-2 block">
            Nombre del Cuerpo de Agua <span className="text-red-500">*</span>
          </Label>
          <Input
            value={ecosystemName}
            onChange={(e) => setEcosystemName(e.target.value)}
            placeholder="Ej: Laguna de Términos"
            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
        <div>
          <Label className="text-[13px] font-medium text-slate-700 mb-2 block">ID del Ecosistema (Opcional)</Label>
          <Input
            value={ecosystemId || ""}
            onChange={(e) => setEcosystemId(e.target.value)}
            placeholder="Ej: 123"
            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
      </div>
    </Card>

    {/* Images Grid */}
    <Card className="p-6 border-0 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[20px] font-medium text-slate-900">Imágenes Seleccionadas ({selectedFiles.length})</h3>
        <Button
          onClick={onAddMore}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-50 h-9 px-4 text-[13px] font-medium rounded-lg bg-transparent"
        >
          <Upload className="w-4 h-4 mr-2" />
          Agregar más
        </Button>
      </div>

      <Input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        multiple
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imagePreviewUrls.map((url: string, index: number) => (
          <Card key={index} className="overflow-hidden border border-slate-200 shadow-sm group">
            <div className="relative aspect-video bg-slate-100">
              <img
                src={url || "/placeholder.svg"}
                alt={`Vista previa ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={getImageFilterStyle()}
              />
              <Button
                onClick={() => onRemoveFile(index)}
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-[11px] font-medium">
                Imagen {index + 1}
              </div>
            </div>
            <div className="p-4 space-y-3 bg-slate-50">
              <div>
                <Label className="text-[12px] font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha de Captura <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={captureDates[index] || ""}
                  onChange={(e) => onDateChange(index, e.target.value)}
                  className="h-9 text-[13px] border-slate-300 focus:border-blue-500 rounded-lg"
                  required
                />
              </div>
              <div>
                <Label className="text-[12px] font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Descripción (Opcional)
                </Label>
                <Input
                  value={descriptions[index] || ""}
                  onChange={(e) => onDescriptionChange(index, e.target.value)}
                  placeholder="Añadir nota..."
                  className="h-9 text-[13px] border-slate-300 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  </div>
)

interface AnalyzeStepProps {
  loading: boolean
}

const AnalyzeStep: React.FC<AnalyzeStepProps> = ({ loading }) => (
  <Card className="p-16 border-0 shadow-sm bg-white text-center">
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 animate-pulse">
        <Sparkles className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className="text-[24px] font-normal text-slate-900 mb-2">Analizando Imágenes</h3>
      <p className="text-[15px] text-slate-600 mb-8">
        Nuestro sistema está procesando tus imágenes con inteligencia artificial
      </p>
      <div className="w-full max-w-md">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  </Card>
)

interface ResultsStepProps {
  result: UploadResponse
  remoteBaseUrl: string
  onOpenModal: (result: ImageResult) => void
}

const ResultsStep: React.FC<ResultsStepProps> = ({ result, remoteBaseUrl, onOpenModal }) => {
  const BASE_URL = remoteBaseUrl.endsWith("/") ? remoteBaseUrl.slice(0, -1) : remoteBaseUrl

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[20px] font-medium text-slate-900 mb-1">{result.ecosystem_name}</h3>
            <p className="text-[14px] text-slate-700 mb-2">ID del Ecosistema: {result.ecosystem_id}</p>
            <p className="text-[13px] text-slate-600">{result.message}</p>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.images.map((res) => (
          <Card
            key={res.id}
            className="overflow-hidden border-0 shadow-sm bg-white group cursor-pointer hover:shadow-md transition-all"
            onClick={() => onOpenModal(res)}
          >
            <div className="relative aspect-video bg-slate-100">
              {res.image && (
                <img
                  src={`${BASE_URL}${res.image}`}
                  alt={`Imagen ${res.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              )}
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-[11px] font-medium">
                ID: {res.id}
              </div>
              <Button
                variant="ghost"
                className="absolute bottom-2 right-2 h-8 px-3 bg-white/90 hover:bg-white text-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-[12px] font-medium"
              >
                <ZoomIn className="w-3.5 h-3.5 mr-1.5" />
                Ver Detalle
              </Button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                  <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-blue-700 font-medium">Agua</p>
                    <p className="text-[16px] font-bold text-blue-900">{res.water_percentage}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                  <Leaf className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-green-700 font-medium">Vegetación</p>
                    <p className="text-[16px] font-bold text-green-900">{res.vegetation_percentage}%</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-[12px] text-slate-600">
                <p>
                  <span className="font-medium">Área Agua:</span> {res.water_area_m2} m²
                </p>
                <p>
                  <span className="font-medium">Área Vegetación:</span> {res.vegetation_area_m2} m²
                </p>
              </div>
              {res.description && (
                <p className="text-[12px] text-slate-600 mt-3 pt-3 border-t border-slate-100 italic">
                  {res.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ------------------------------ //
// MODAL COMPONENT //
// ------------------------------ //

interface ImageDetailModalProps {
  isOpen: boolean
  onClose: () => void
  result: ImageResult | null
  remoteBaseUrl: string
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ isOpen, onClose, result, remoteBaseUrl }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !result) return null

  const BASE_URL = remoteBaseUrl.endsWith("/") ? remoteBaseUrl.slice(0, -1) : remoteBaseUrl
  const imageUrl = `${BASE_URL}${result.image}`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-[2fr_1fr] h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="bg-slate-900 flex items-center justify-center relative p-4 min-h-[400px]">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={`Detalle Imagen ID: ${result.id}`}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <Button
              onClick={onClose}
              variant="ghost"
              className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full bg-black/50 hover:bg-black/80 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Details Section */}
          <div className="p-8 overflow-y-auto bg-slate-50">
            <h3 className="text-[24px] font-medium text-slate-900 mb-6">Detalles del Análisis</h3>

            <div className="space-y-4">
              {/* Water Stats */}
              <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] text-blue-700 font-medium">Cobertura de Agua</p>
                    <p className="text-[28px] font-bold text-blue-900">{result.water_percentage}%</p>
                  </div>
                </div>
                <p className="text-[13px] text-blue-800">
                  <span className="font-medium">Área:</span> {result.water_area_m2} m²
                </p>
              </Card>

              {/* Vegetation Stats */}
              <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] text-green-700 font-medium">Cobertura de Vegetación</p>
                    <p className="text-[28px] font-bold text-green-900">{result.vegetation_percentage}%</p>
                  </div>
                </div>
                <p className="text-[13px] text-green-800">
                  <span className="font-medium">Área:</span> {result.vegetation_area_m2} m²
                </p>
              </Card>

              {/* Description */}
              {result.description && (
                <Card className="p-4 border-0 shadow-sm bg-white">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-600 mt-0.5" />
                    <p className="text-[12px] font-medium text-slate-700">Descripción</p>
                  </div>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{result.description}</p>
                </Card>
              )}

              {/* Image ID */}
              <Card className="p-4 border-0 shadow-sm bg-white">
                <p className="text-[12px] font-medium text-slate-700 mb-1">ID de Imagen</p>
                <p className="text-[16px] font-mono text-slate-900">{result.id}</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoAnalyzer
