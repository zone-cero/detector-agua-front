"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Droplets, Leaf } from "lucide-react" // Asumiendo que usas lucide-react o similar
// Nota: Necesitarás importar estos íconos si no están en tu proyecto: Droplets, Leaf

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
    sepia: number
    hueRotate: number
    opacity: number
}

type TabType = "config" | "results"

// ------------------------------ //
// COMPONENTE PRINCIPAL //
// ------------------------------ //

const PhotoAnalyzer = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>("config")

    // Estado para el ecosistema (Nuevo o Existente)
    const [ecosystemName, setEcosystemName] = useState<string>("")
    const [ecosystemId, setEcosystemId] = useState<string | null>(null) // Mantener como string | null
    
    const [descriptions, setDescriptions] = useState<string[]>([])

    const [filterValues, setFilterValues] = useState<FilterValues>({
        brightness: 100,
        contrast: 100,
        saturate: 100,
        sepia: 0,
        hueRotate: 0,
        opacity: 100,
    })

    // Estados del modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedImageResult, setSelectedImageResult] = useState<ImageResult | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const REMOTE_BASE_URL = "http://72.60.127.75"

    // ------------------------------ //
    // EFECTOS Y UTILIDADES //
    // ------------------------------ //

    useEffect(() => {
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))

        const urls = selectedFiles.map((file) => URL.createObjectURL(file))
        setImagePreviewUrls(urls)
        setAnalysisResult(null)

        if (selectedFiles.length !== descriptions.length) {
            if (selectedFiles.length > descriptions.length) {
                setDescriptions((prev) => [
                    ...prev,
                    ...Array(selectedFiles.length - prev.length).fill(""),
                ])
            } else {
                setDescriptions((prev) => prev.slice(0, selectedFiles.length))
            }
        }

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [selectedFiles])

    // Cambiar a tab de resultados cuando hay resultados
    useEffect(() => {
        if (analysisResult) {
            setActiveTab("results")
        }
    }, [analysisResult])

    const getImageFilterStyle = useCallback(() => {
        const { brightness, contrast, saturate, sepia, hueRotate, opacity } = filterValues
        return {
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg) opacity(${opacity}%)`,
        }
    }, [filterValues])

    // Lógica para abrir el modal
    const handleOpenModal = useCallback((result: ImageResult) => {
        setSelectedImageResult(result)
        setIsModalOpen(true)
    }, [])

    // Lógica para cerrar el modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false)
    }, [])

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
        setActiveTab("config")
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

        // Validación de nombre de ecosistema
        if (!ecosystemName.trim()) {
            toast({
                title: "¡Atención!",
                description: "El nombre del cuerpo de agua es requerido.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()

            formData.append("ecosystem_name", ecosystemName.trim())
            
            // Solo si hay un ID de ecosistema existente, lo enviamos
            if (ecosystemId && ecosystemId.trim()) {
                formData.append("ecosystem_id", ecosystemId.trim())
            }

            selectedFiles.forEach((file) => {
                formData.append("images", file)
            })

            if (descriptions.some(desc => desc.trim() !== "")) {
                formData.append("descriptions", JSON.stringify(descriptions.slice(0, selectedFiles.length).map(desc => desc || "")))
            }

            const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/images/upload-multiple/`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const responseBody = await response.text()
                let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`

                try {
                    const errorData = JSON.parse(responseBody)
                    errorMessage = errorData.detail || errorData.message || responseBody || errorMessage
                } catch (parseError) {
                    if (responseBody) errorMessage = responseBody
                }

                throw new Error(errorMessage)
            }

            const result: UploadResponse = await response.json()
            setAnalysisResult(result)

            console.log("RESPUESTA COMPLETA DE LA API:", result)

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
                    errorMessage = "No se pudo conectar con el servidor. Verifica la URL remota y la conexión."
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

    // LÓGICA DE HABILITACIÓN CORREGIDA:
    // Está deshabilitado si NO hay archivos O (NO hay ID de ecosistema Y el nombre está vacío)
    const isEcosystemReady = (ecosystemId !== null && ecosystemId.trim() !== "") || (ecosystemName.trim() !== "");
    const isControlsDisabled = selectedFiles.length === 0 || !isEcosystemReady;

    const filterKeys = Object.keys(filterValues) as Array<keyof FilterValues>

    // ------------------------------ //
    // RENDERIZADO //
    // ------------------------------ //

    return (
        <div className="flex justify-center py-12 md:py-16 px-4 min-h-screen">
            <div className="w-full max-w-7xl">
                <div className="grid lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1fr] gap-8 md:gap-12">
                    {/* Sección de Carga y Previsualización */}
                    <div className="flex flex-col gap-6">
                        {/* Campo para Ecosystem Name/ID */}
                        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Información del Sitio
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ecosystem-name" className="text-sm font-medium text-gray-700">
                                        Nombre del Cuerpo de Agua <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="ecosystem-name"
                                        value={ecosystemName}
                                        onChange={(e) => setEcosystemName(e.target.value)}
                                        placeholder="Ej: Laguna de Términos"
                                        className="mt-1 border-gray-300 focus:border-gray-500"
                                        disabled={loading}
                                    />
                                </div>
                                {/* Aquí iría el campo para seleccionar un Ecosistema Existente (Select/Combobox) */}
                                {/* ... */}
                            </div>
                        </div>

                        {/* Área de carga / Previsualizaciones */}
                        {selectedFiles.length === 0 ? (
                            <FileUploadArea
                                onAreaClick={() => fileInputRef.current?.click()}
                                fileInputRef={fileInputRef}
                                onFileChange={handleFileChange}
                            />
                        ) : (
                            <div className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Imágenes a Analizar ({selectedFiles.length})
                                </h3>
                                <ImagePreviews
                                    imagePreviewUrls={imagePreviewUrls}
                                    getImageFilterStyle={getImageFilterStyle}
                                    onRemoveFile={handleRemoveFile}
                                    descriptions={descriptions}
                                    onDescriptionChange={(index: number, desc: string) => {
                                        setDescriptions((prev) =>
                                            prev.map((item, i) => i === index ? desc : item)
                                        )
                                    }}
                                />
                                <FileControls
                                    onAddMore={() => fileInputRef.current?.click()}
                                    onReset={handleReset}
                                    fileInputRef={fileInputRef}
                                    onFileChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sección de Controles y Resultados con Tabs */}
                    <div className="flex flex-col gap-4">
                        {/* Navegación de Tabs */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("config")}
                                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === "config"
                                            ? "border-gray-800 text-gray-800 bg-gray-50"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="font-semibold">Configuración</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("results")}
                                    disabled={!analysisResult}
                                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                        !analysisResult
                                            ? "text-gray-400 cursor-not-allowed border-transparent"
                                            : activeTab === "results"
                                                ? "border-gray-800 text-gray-800 bg-gray-50"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="font-semibold">Resultados</span>
                                    {analysisResult && (
                                        <span className="bg-gray-800 text-white text-xs rounded-full h-5 w-5 ml-2 inline-flex items-center justify-center">
                                            {analysisResult.images.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Contenido de los Tabs */}
                            <div className="p-1">
                                {activeTab === "config" && (
                                    <ImageControls
                                        isDisabled={isControlsDisabled} // Aquí se usa la lógica corregida
                                        filterValues={filterValues}
                                        filterKeys={filterKeys}
                                        onSliderChange={(key: keyof FilterValues, value: number) =>
                                            setFilterValues((prev) => ({ ...prev, [key]: value }))
                                        }
                                        onAnalyze={handleAnalyze}
                                        loading={loading}
                                        hasResults={!!analysisResult}
                                        onShowResults={() => setActiveTab("results")}
                                    />
                                )}

                                {activeTab === "results" && analysisResult && (
                                    <AnalysisResults
                                        remoteBaseUrl={REMOTE_BASE_URL}
                                        result={analysisResult}
                                        onOpenModal={handleOpenModal}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Detalle de Imagen */}
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
// COMPONENTES SECUNDARIOS //
// ------------------------------ //

// (Los componentes ImagePreviews, FileUploadArea, FileControls permanecen sin cambios)
interface ImagePreviewsProps {
    imagePreviewUrls: string[]
    getImageFilterStyle: () => React.CSSProperties
    onRemoveFile: (index: number) => void
    descriptions: string[]
    onDescriptionChange: (index: number, desc: string) => void
}

const ImagePreviews: React.FC<ImagePreviewsProps> = ({
    imagePreviewUrls,
    getImageFilterStyle,
    onRemoveFile,
    descriptions,
    onDescriptionChange
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
        {imagePreviewUrls.map((url: string, index: number) => (
            <div key={index} className="relative shadow-md rounded-lg overflow-hidden group border border-gray-200 bg-white">
                <div className="aspect-[4/3] relative">
                    <img
                        src={url || "/placeholder.svg"}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={getImageFilterStyle()}
                    />
                    <Button
                        onClick={() => onRemoveFile(index)}
                        variant="ghost"
                        aria-label={`Eliminar imagen ${index + 1}`}
                        className="absolute top-2 right-2 p-1 h-8 w-auto px-2 bg-black/60 text-white rounded-md transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:bg-gray-600 z-10 text-xs font-semibold"
                    >
                        Eliminar
                    </Button>
                </div>
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <Label htmlFor={`desc-${index}`} className="text-xs font-semibold text-gray-700">
                        Descripción (Opcional)
                    </Label>
                    <Input
                        id={`desc-${index}`}
                        value={descriptions[index] || ""}
                        onChange={(e) => onDescriptionChange(index, e.target.value)}
                        placeholder="Añadir nota de ubicación/estado"
                        className="mt-1 h-8 text-sm border-gray-300"
                    />
                </div>
            </div>
        ))}
    </div>
)

interface FileUploadAreaProps {
    onAreaClick: () => void
    fileInputRef: React.RefObject<HTMLInputElement>
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onAreaClick, fileInputRef, onFileChange }) => (
    <div
        onClick={onAreaClick}
        className="
			flex flex-col items-center justify-center 
			bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 
			transition-all duration-300 cursor-pointer hover:border-gray-400 
			relative aspect-video min-h-[250px] p-6 shadow-sm
			group 
		"
    >
        <Input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
        />

        <img
            src="/imagenes/wMOtOEdSdz28gAAAABJRU5ErkJggg==.jpg"
            alt="Imagen de carga file"
            className="
				max-h-32 max-w-full mb-4 object-contain 
				transition-transform duration-300 ease-in-out
				group-hover:translate-y-[-5px] group-hover:scale-105
			"
        />

        <div className="text-center">
            <p className="text-xl font-bold text-gray-700">Haz clic o arrastra aquí</p>
            <p className="text-sm mt-1 text-gray-600">Sube fotos (.jpg, .png) para su análisis</p>
        </div>
    </div>
)

interface FileControlsProps {
    onAddMore: () => void
    onReset: () => void
    fileInputRef: React.RefObject<HTMLInputElement>
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileControls: React.FC<FileControlsProps> = ({ onAddMore, onReset, fileInputRef, onFileChange }) => (
    <div className="flex gap-4 pt-4 border-t border-gray-100">
        <Button
            onClick={onAddMore}
            variant="outline"
            className="flex-1 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2 bg-transparent font-semibold transition-colors"
        >
            Agregar más Imágenes
        </Button>
        <Button
            onClick={onReset}
            variant="outline"
            className="py-2 flex items-center gap-2 font-semibold text-gray-700 border-gray-300 hover:bg-gray-50"
        >
            Vaciar todo
        </Button>
        <Input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
        />
    </div>
)


interface ImageControlsProps {
    isDisabled: boolean // Esta prop debe ser calculada por el padre (PhotoAnalyzer)
    filterValues: FilterValues
    filterKeys: Array<keyof FilterValues>
    onSliderChange: (key: keyof FilterValues, value: number) => void
    onAnalyze: () => void
    loading: boolean
    hasResults: boolean
    onShowResults: () => void
}

const ImageControls: React.FC<ImageControlsProps> = ({
    isDisabled, // Incorpora la validación de archivos y ecosistema
    filterValues,
    filterKeys,
    onSliderChange,
    onAnalyze,
    loading,
    hasResults,
    onShowResults,
}) => (
    <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
            Ajustes de Previsualización
        </h2>
        <p className="text-sm text-gray-500 mb-4">
            Ajusta los filtros para una mejor vista. Esto <strong>no</strong> afecta el análisis final, solo la vista previa.
        </p>
        <Separator className="mb-4 bg-gray-200" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {filterKeys.map((key: keyof FilterValues) => (
                <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                        <Label htmlFor={`slider-${key}`} className="text-xs font-normal text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim().replace('hue rotate', 'Rotación Tono')}
                        </Label>
                        <span className="text-xs font-medium text-gray-700">
                            {filterValues[key]}
                            {key === "hueRotate" ? "°" : "%"}
                        </span>
                    </div>
                    <Input
                        type="range"
                        id={`slider-${key}`}
                        min={0}
                        max={key === "hueRotate" ? 360 : 200}
                        step={key === "hueRotate" ? 1 : 5}
                        value={filterValues[key]}
                        onChange={(e) => onSliderChange(key, Number(e.target.value))}
                        disabled={isDisabled}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-gray-600"
                    />
                </div>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-3">
            <Button
                onClick={onAnalyze}
                // Usamos la prop 'isDisabled' (que ya incorpora la validación del ecosistema) más 'loading'
                disabled={isDisabled || loading} 
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-2.5 text-sm shadow-sm transition-all duration-200 w-full"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2 font-semibold">
                        Subiendo y Analizando...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2 font-semibold">
                        Iniciar Análisis
                    </span>
                )}
            </Button>

            {hasResults && (
                <Button
                    onClick={onShowResults}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2.5 text-sm transition-all duration-200 w-full"
                >
                    <span className="flex items-center justify-center gap-2 font-semibold">
                        Ver Resultados
                    </span>
                </Button>
            )}
        </div>
    </div>
)

// Componente para mostrar los resultados del análisis
interface AnalysisResultsProps {
    result: UploadResponse
    remoteBaseUrl: string
    onOpenModal: (result: ImageResult) => void
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, remoteBaseUrl, onOpenModal }) => {
    const BASE_URL = remoteBaseUrl.endsWith('/') ? remoteBaseUrl.slice(0, -1) : remoteBaseUrl

    return (
        <div className="p-4">
            <h3 className="font-bold text-gray-800 text-lg mb-3">
                Resultados del Análisis
            </h3>

            {/* Información General */}
            <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-700 font-medium text-sm">
                    <span className="font-bold">{result.ecosystem_name}</span> (ID: {result.ecosystem_id})
                </p>
                <p className="text-gray-600 text-xs mt-1">{result.message}</p>
            </div>

            <div className="border-t border-gray-200 pt-3">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">Detalle por Imagen:</h4>
                <ul className="space-y-3 max-h-[500px] overflow-y-auto p-1">
                    {result.images.map((res) => (
                        <li
                            key={res.id}
                            className="flex flex-col text-gray-700 bg-white p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:border-gray-300 relative"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-800">Imagen ID: {res.id}</span>
                                </div>
                                {res.image && (
                                    <img
                                        src={`${BASE_URL}${res.image}`}
                                        alt={`Imagen ${res.id}`}
                                        className="w-16 h-12 object-cover rounded border border-gray-300 shadow-sm"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null
                                            e.currentTarget.src = "/placeholder.svg"
                                        }}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                    {/* CORREGIDO: Porcentajes sin multiplicar por 100 */}
                                    <p><span className="font-semibold text-gray-700">Agua:</span> <span className="font-bold">{res.water_percentage.toFixed(2)}%</span></p>
                                    <p><span className="font-semibold text-gray-700">Área Agua:</span> {res.water_area_m2.toFixed(2)} m²</p>
                                </div>

                                <div className="space-y-1">
                                    {/* CORREGIDO: Porcentajes sin multiplicar por 100 */}
                                    <p><span className="font-semibold text-gray-700">Lirio:</span> <span className="font-bold">{res.vegetation_percentage.toFixed(2)}%</span></p>
                                    <p><span className="font-semibold text-gray-700">Área Lirio:</span> {res.vegetation_area_m2.toFixed(2)} m²</p>
                                </div>
                            </div>

                            {res.description && (
                                <p className="text-xs mt-2 text-gray-600 border-t pt-2">
                                    <span className="font-semibold">Descripción:</span> {res.description}
                                </p>
                            )}

                            <button
                                onClick={() => onOpenModal(res)}
                                className="absolute bottom-2 right-2 text-gray-600 hover:text-gray-900 p-1 px-3 rounded-full transition-colors text-xs font-semibold border border-gray-300 hover:bg-gray-100 bg-white shadow-sm"
                                aria-label={`Ver detalles de Imagen ID: ${res.id}`}
                            >
                                Ver Imagen &gt;
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

// ------------------------------ //
// COMPONENTE MODAL DE DETALLE - CORREGIDO //
// ------------------------------ //

interface ImageDetailModalProps {
    isOpen: boolean
    onClose: () => void
    result: ImageResult | null
    remoteBaseUrl: string
}
const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ isOpen, onClose, result, remoteBaseUrl }) => {
    if (!isOpen || !result) return null

    const BASE_URL = remoteBaseUrl.endsWith('/') ? remoteBaseUrl.slice(0, -1) : remoteBaseUrl
    const imageUrl = `${BASE_URL}${result.image}`

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-transform duration-300 ease-out scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid md:grid-cols-[2.5fr_1.5fr] h-full">
                    {/* Columna de la Imagen Grande */}
                    <div className="bg-gray-900 flex items-center justify-center relative p-2 md:p-4 min-h-[400px]">
                        <img
                            src={imageUrl}
                            alt={`Detalle Imagen ID: ${result.id}`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = "/placeholder.svg"
                            }}
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-white p-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-10 flex items-center justify-center"
                            aria-label="Cerrar"
                        >
                            <span className="text-xl leading-none font-bold">×</span>
                        </button>
                    </div>

                    {/* Columna de los Datos */}
                    <div className="p-6 overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                            Detalles de Imagen ID: {result.id}
                        </h3>

                        <div className="space-y-4">
                            {/* Porcentajes (CORREGIDO) */}
                            <div className="space-y-3">
                                <div className="p-3 border rounded-lg bg-blue-50">
                                    <p className="text-xs text-blue-700 font-semibold">Agua</p>
                                    {/* CORREGIDO: Añadido .toFixed(2) para formato correcto */}
                                    <p className="text-xl font-extrabold text-blue-900">{result.water_percentage.toFixed(2)}%</p> 
                                </div>
                                <div className="p-3 border rounded-lg bg-green-50">
                                    <p className="text-xs text-green-700 font-semibold">Lirio</p>
                                    {/* CORREGIDO: Añadido .toFixed(2) para formato correcto */}
                                    <p className="text-xl font-extrabold text-green-900">{result.vegetation_percentage.toFixed(2)}%</p>
                                </div>
                            </div>

                            {/* Áreas (CORREGIDO el toFixed) */}
                            <div className="space-y-3">
                                <div className="p-3 border rounded-lg bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-700">Área de Agua (m²)</p>
                                    <p className="text-base text-gray-900 font-mono break-all">{result.water_area_m2.toFixed(2)} m²</p>
                                </div>
                                <div className="p-3 border rounded-lg bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-700">Área de Lirio (m²)</p>
                                    <p className="text-base text-gray-900 font-mono break-all">{result.vegetation_area_m2.toFixed(2)} m²</p>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="pt-2 border-t">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Descripción de la Imagen:</p>
                                <p className="text-base text-gray-800 italic">
                                    {result.description || "No se proporcionó una descripción."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PhotoAnalyzer