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
  ZoomIn,
  Ruler,
  ListOrdered,
  Layers,
  Map,
  Loader2,
  Trash2,
  Plus,
  Eye,
  LandPlot,
  Download,
  BarChart3,
  Filter,
  Search,
  Grid,
  Table,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  PieChart,
  BarChart,
  LineChart,
  Activity,
  Target,
  Clock,
  ArrowUpDown,
} from "lucide-react"

const REMOTE_BASE_URL = "https://sistemahidalgodroneva.site"

// ------------------------------ //
// INTERFACES Y TIPOS
// ------------------------------ //

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
// COMPONENTES DE TABLA PROFESIONAL
// ------------------------------ //

interface SortConfig {
  key: keyof ImageResult | 'water_area_m2' | 'vegetation_area_m2' | 'capture_date'
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  search: string
  dateRange: {
    start: string
    end: string
  }
  vegetationRange: {
    min: number
    max: number
  }
  waterRange: {
    min: number
    max: number
  }
}

// Componente de gráfico mini para tendencias
const MiniTrendChart: React.FC<{
  data: number[],
  color: string,
  currentValue: number
}> = ({ data, color, currentValue }) => {
  const maxValue = Math.max(...data, currentValue)
  const minValue = Math.min(...data, currentValue)
  const range = maxValue - minValue || 1

  return (
    <div className="flex items-end h-8 w-20 space-x-0.5">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 bg-slate-200 rounded-t-sm transition-all duration-300 hover:opacity-80"
          style={{
            height: `${((value - minValue) / range) * 100}%`,
            backgroundColor: color,
            opacity: 0.6 + (index / data.length) * 0.4
          }}
        />
      ))}
      <div
        className="w-1.5 rounded-t-sm border-2 border-white shadow-sm"
        style={{
          height: `${((currentValue - minValue) / range) * 100}%`,
          backgroundColor: color
        }}
      />
    </div>
  )
}

// Componente de tabla profesional con ordenamiento y filtros
const ProfessionalHistoryTable: React.FC<{
  data: ImageResult[]
  onViewDetail: (image: ImageResult) => void
  onExportCSV: () => void
}> = ({ data, onViewDetail, onExportCSV }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'capture_date', direction: 'desc' })
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    search: '',
    dateRange: { start: '', end: '' },
    vegetationRange: { min: 0, max: 100 },
    waterRange: { min: 0, max: 100 }
  })
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showFilters, setShowFilters] = useState(false)

  // Función de ordenamiento mejorada
  const sortedData = useMemo(() => {
    const sortableData = [...data]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof ImageResult]
        let bValue: any = b[sortConfig.key as keyof ImageResult]

        // Manejo especial para fechas
        if (sortConfig.key === 'capture_date') {
          aValue = aValue ? new Date(aValue).getTime() : 0
          bValue = bValue ? new Date(bValue).getTime() : 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableData
  }, [data, sortConfig])

  // Función de filtrado mejorada
  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      // Filtro de búsqueda
      if (filterConfig.search) {
        const searchLower = filterConfig.search.toLowerCase()
        const matchesSearch =
          item.id.toString().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtro de fecha
      if (filterConfig.dateRange.start && item.capture_date) {
        const itemDate = new Date(item.capture_date)
        const startDate = new Date(filterConfig.dateRange.start)
        if (itemDate < startDate) return false
      }
      if (filterConfig.dateRange.end && item.capture_date) {
        const itemDate = new Date(item.capture_date)
        const endDate = new Date(filterConfig.dateRange.end)
        if (itemDate > endDate) return false
      }

      // Filtro de vegetación
      if (item.vegetation_percentage < filterConfig.vegetationRange.min ||
        item.vegetation_percentage > filterConfig.vegetationRange.max) return false

      // Filtro de agua
      if (item.water_percentage < filterConfig.waterRange.min ||
        item.water_percentage > filterConfig.waterRange.max) return false

      return true
    })
  }, [sortedData, filterConfig])

  // Función para manejar el ordenamiento
  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Función para obtener datos de tendencia
  const getTrendData = useCallback((currentIndex: number, key: 'vegetation_percentage' | 'water_percentage') => {
    const trendData = []
    for (let i = Math.max(0, currentIndex - 4); i <= currentIndex; i++) {
      if (filteredData[i]) {
        trendData.push(filteredData[i][key])
      }
    }
    return trendData.length > 1 ? trendData : [filteredData[currentIndex][key]]
  }, [filteredData])

  // Renderizado de la tabla profesional
  const renderTable = () => (
    <div className="overflow-hidden border border-slate-200 rounded-lg bg-white">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center space-x-2">
                <span>ID</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Imagen
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handleSort('capture_date')}
            >
              <div className="flex items-center space-x-2">
                <span>Fecha</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handleSort('vegetation_percentage')}
            >
              <div className="flex items-center space-x-2">
                <Leaf className="w-3 h-3" />
                <span>Lirio Acuático</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handleSort('water_percentage')}
            >
              <div className="flex items-center space-x-2">
                <Droplets className="w-3 h-3" />
                <span>Cuerpo de Agua</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tendencias
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredData.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-slate-900">#{item.id}</div>
                  {index === 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Más Reciente
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={`${REMOTE_BASE_URL}${item.image}`}
                    alt={`Captura ${item.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
                    }}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">
                  {formatDateForDisplay(item.capture_date)}
                </div>
                <div className="text-xs text-slate-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.capture_date ? new Date(item.capture_date).toLocaleTimeString() : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-700">
                      {item.vegetation_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.vegetation_area_m2.toFixed(0)} m²
                    </div>
                  </div>
                  <div className="w-12 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.vegetation_percentage}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700">
                      {item.water_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.water_area_m2.toFixed(0)} m²
                    </div>
                  </div>
                  <div className="w-12 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.water_percentage}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <MiniTrendChart
                      data={getTrendData(index, 'vegetation_percentage')}
                      color="#10b981"
                      currentValue={item.vegetation_percentage}
                    />
                    <div className="text-xs text-slate-500 mt-1">Lirio</div>
                  </div>
                  <div className="text-center">
                    <MiniTrendChart
                      data={getTrendData(index, 'water_percentage')}
                      color="#3b82f6"
                      currentValue={item.water_percentage}
                    />
                    <div className="text-xs text-slate-500 mt-1">Agua</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onViewDetail(item)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Renderizado de vista en cuadrícula
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredData.map((item, index) => (
        <Card key={item.id} className="overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300">
          <div className="relative">
            <img
              src={`${REMOTE_BASE_URL}${item.image}`}
              alt={`Captura ${item.id}`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
              }}
            />
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              ID: {item.id}
            </div>
            {index === 0 && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Más Reciente
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDateForDisplay(item.capture_date)}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-green-700 flex items-center">
                    <Leaf className="w-4 h-4 mr-1" />
                    Lirio Acuático
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {item.vegetation_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.vegetation_percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {item.vegetation_area_m2.toFixed(0)} m²
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-blue-700 flex items-center">
                    <Droplets className="w-4 h-4 mr-1" />
                    Cuerpo de Agua
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {item.water_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.water_percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {item.water_area_m2.toFixed(0)} m²
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button
                onClick={() => onViewDetail(item)}
                variant="default"
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Historial de Capturas</h3>
          <p className="text-sm text-slate-600">
            {filteredData.length} de {data.length} capturas encontradas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por ID o descripción..."
              value={filterConfig.search}
              onChange={(e) => setFilterConfig(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-64 bg-white border-slate-300"
            />
          </div>

          {/* Botón de filtros */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters && <ChevronUp className="w-4 h-4 ml-2" />}
            {!showFilters && <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>

          {/* Selector de vista */}
          <div className="flex border border-slate-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none border-0 shadow-none"
            >
              <Table className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none border-0 shadow-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>

          {/* Exportar */}
          <Button
            onClick={onExportCSV}
            variant="outline"
            className="border-slate-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <Card className="p-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Rango de Fechas
              </Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filterConfig.dateRange.start}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full"
                />
                <Input
                  type="date"
                  value={filterConfig.dateRange.end}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Lirio Acuático ({filterConfig.vegetationRange.min}% - {filterConfig.vegetationRange.max}%)
              </Label>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filterConfig.vegetationRange.min}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    vegetationRange: { ...prev.vegetationRange, min: Number(e.target.value) }
                  }))}
                  className="w-full"
                />
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filterConfig.vegetationRange.max}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    vegetationRange: { ...prev.vegetationRange, max: Number(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Cuerpo de Agua ({filterConfig.waterRange.min}% - {filterConfig.waterRange.max}%)
              </Label>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filterConfig.waterRange.min}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    waterRange: { ...prev.waterRange, min: Number(e.target.value) }
                  }))}
                  className="w-full"
                />
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filterConfig.waterRange.max}
                  onChange={(e) => setFilterConfig(prev => ({
                    ...prev,
                    waterRange: { ...prev.waterRange, max: Number(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilterConfig({
                  search: '',
                  dateRange: { start: '', end: '' },
                  vegetationRange: { min: 0, max: 100 },
                  waterRange: { min: 0, max: 100 }
                })}
                variant="outline"
                className="w-full border-slate-300"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Vista principal */}
      {viewMode === 'table' ? renderTable() : renderGrid()}

      {/* Estado vacío */}
      {filteredData.length === 0 && (
        <Card className="text-center p-12 border border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No se encontraron capturas</h4>
          <p className="text-slate-600 mb-4">
            No hay capturas que coincidan con los criterios de búsqueda actuales.
          </p>
          <Button
            onClick={() => setFilterConfig({
              search: '',
              dateRange: { start: '', end: '' },
              vegetationRange: { min: 0, max: 100 },
              waterRange: { min: 0, max: 100 }
            })}
            variant="outline"
          >
            Limpiar filtros
          </Button>
        </Card>
      )}
    </div>
  )
}

// ------------------------------ //
// MODAL DE HISTORIAL PROFESIONAL
// ------------------------------ //

interface ProfessionalHistoryModalProps extends Omit<ModalProps, "title" | "children"> {
  historicalImages: ImageResult[]
  ecosystemName: string
  ecosystemId: string | null
  onViewDetail: (image: ImageResult) => void
  remoteBaseUrl: string
}

const ProfessionalHistoryModal: React.FC<ProfessionalHistoryModalProps> = ({
  isOpen,
  onClose,
  historicalImages,
  ecosystemName,
  onViewDetail,
}) => {
  const [exporting, setExporting] = useState(false)

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 1000))

      const headers = ['ID', 'Fecha', 'Lirio (%)', 'Lirio (m²)', 'Agua (%)', 'Agua (m²)', 'Descripción']
      const csvData = historicalImages.map(img => [
        img.id,
        formatDateForDisplay(img.capture_date),
        img.vegetation_percentage.toFixed(2),
        img.vegetation_area_m2.toFixed(2),
        img.water_percentage.toFixed(2),
        img.water_area_m2.toFixed(2),
        img.description || ''
      ])

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `historial-${ecosystemName}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      {/* Header personalizado */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historial de Capturas</h2>
          <p className="text-slate-600 mt-1">
            Ecosistema: <span className="font-semibold">{ecosystemName}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExportCSV}
            disabled={exporting}
            variant="outline"
            className="border-slate-300"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        <ProfessionalHistoryTable
          data={historicalImages}
          onViewDetail={onViewDetail}
          onExportCSV={handleExportCSV}
        />
      </div>
    </Modal>
  )
}

// ------------------------------ //
// COMPONENTES BASE (MODAL, SELECT, etc.)
// ------------------------------ //

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
    <div className="fixed inset-0 z-50 bg-black/10 flex items-start justify-center overflow-y-auto p-4 md:p-10">
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

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {props.children}
  </select>
)

// ------------------------------ //
// COMPONENTES DE PASOS (UPLOAD, CONFIGURE, etc.)
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
  setEcosystemId: (id: string | null) => void
  onAddMore: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ecosystems: Ecosystem[]
  historicalImages: ImageResult[]
  loadingHistory: boolean
  onOpenHistoryListModal: () => void
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
  ecosystems,
  historicalImages,
  loadingHistory,
  onOpenHistoryListModal,
}) => {
  const selectedEcosystem = useMemo(() => {
    return ecosystems.find((e) => e.id.toString() === ecosystemId)
  }, [ecosystemId, ecosystems])

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setEcosystemId(value)
      if (value === "new") {
        setEcosystemName("")
      } else {
        const selected = ecosystems.find((e) => e.id.toString() === value)
        setEcosystemName(selected ? selected.name : "")
      }
    },
    [ecosystems, setEcosystemId, setEcosystemName],
  )

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ecosystem-select" className="mb-2 flex items-center text-[13px] font-medium text-slate-700">
              <Map className="w-4 h-4 mr-2 text-blue-500" />
              Seleccionar Ecosistema
            </Label>
            <Select id="ecosystem-select" value={ecosystemId || "new"} onChange={handleSelectChange}>
              <option value="new">Crear nuevo cuerpo de agua</option>
              {ecosystems.map((ecosystem) => (
                <option key={ecosystem.id} value={ecosystem.id}>
                  {ecosystem.name} (ID: {ecosystem.id})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ecosystem-name" className="mb-2 flex items-center text-[13px] font-medium text-slate-700">
              <LandPlot className="w-4 h-4 mr-2 text-blue-500" />
              Nombre del Cuerpo de Agua
            </Label>
            <Input
              id="ecosystem-name"
              placeholder="Ej: Laguna de Términos"
              value={ecosystemName}
              onChange={(e) => setEcosystemName(e.target.value)}
              disabled={!!selectedEcosystem}
              className="h-10"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 flex items-center">
            {loadingHistory ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
            ) : (
              <ListOrdered className="w-4 h-4 mr-2" />
            )}
            Historial: {historicalImages.length} capturas previas encontradas.
          </p>
          <Button
            onClick={onOpenHistoryListModal}
            variant="outline"
            size="sm"
            disabled={loadingHistory || historicalImages.length === 0}
            className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8 bg-transparent"
          >
            {loadingHistory ? "Cargando..." : "Ver Historial Profesional"}
          </Button>
        </div>
      </Card>

      <h3 className="text-[18px] font-medium text-slate-900 flex items-center">
        Imágenes a Analizar ({selectedFiles.length})
      </h3>

      <div className="space-y-6">
        {selectedFiles.map((file, index) => (
          <Card key={index} className="p-4 border border-slate-200 shadow-sm bg-white flex space-x-4">
            <div className="flex-shrink-0 w-48 h-32 relative rounded-lg overflow-hidden">
              <img
                src={imagePreviewUrls[index] || "/placeholder.svg"}
                alt={`Vista previa de ${file ? file.name : 'imagen'}`}
                style={getImageFilterStyle()}
                className="w-full h-full object-cover transition-filter duration-300"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-medium">
                {file.name}
              </div>
              <Button
                onClick={() => onRemoveFile(index)}
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label
                  htmlFor={`date-${index}`}
                  className="mb-1 flex items-center text-[13px] font-medium text-slate-700"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Fecha de Captura
                </Label>
                <Input
                  id={`date-${index}`}
                  type="datetime-local"
                  value={captureDates[index] || ""}
                  onChange={(e) => onDateChange(index, e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor={`desc-${index}`}
                  className="mb-1 flex items-center text-[13px] font-medium text-slate-700"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Descripción (Opcional)
                </Label>
                <Input
                  id={`desc-${index}`}
                  placeholder="Ej: Toma aérea a 100m con drone DJI"
                  value={descriptions[index] || ""}
                  onChange={(e) => onDescriptionChange(index, e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={onAddMore}
        variant="outline"
        className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 h-11 text-[14px] font-medium rounded-lg bg-transparent"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir más imágenes
      </Button>
    </div>
  )
}

interface AnalyzeStepProps {
  loading: boolean
}

const AnalyzeStep: React.FC<AnalyzeStepProps> = ({ loading }) => (
  <Card className="p-10 border-0 shadow-sm bg-white text-center">
    <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-blue-600" />
    <h3 className="text-[28px] font-normal text-slate-900 mb-2">Analizando Imágenes</h3>
    <p className="text-[16px] text-slate-600">
      Estamos procesando las {loading ? "imágenes seleccionadas" : "imágenes"}. Esto puede tardar unos segundos...
    </p>
  </Card>
)

interface ResultsStepProps {
  result: UploadResponse
  remoteBaseUrl: string
  onOpenModal: (result: ImageResult) => void
  historicalImages: ImageResult[]
}

const ResultsStep: React.FC<ResultsStepProps> = ({ result, onOpenModal }) => (
  <div className="space-y-6">
    <Card className="p-6 border-0 shadow-sm bg-blue-50">
      <h3 className="text-[24px] font-semibold text-slate-900 mb-2 flex items-center">
        Análisis Finalizado
      </h3>
      <p className="text-[16px] text-slate-700">
        Las {result.images.length} imágenes fueron analizadas y guardadas en el ecosistema {result.ecosystem_name}
        (ID: {result.ecosystem_id}).
      </p>
    </Card>

    <h4 className="text-[18px] font-medium text-slate-900 flex items-center border-b pb-2">
      Resultados de las Nuevas Capturas
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {result.images.map((image, index) => (
        <Card key={image.id} className="p-4 border shadow-md bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">
              Captura #{index + 1} (ID: {image.id})
            </span>
            <span className="text-xs text-slate-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDateForDisplay(image.capture_date)}
            </span>
          </div>

          <div className="relative h-32 rounded-lg overflow-hidden bg-slate-100">
            <img
              src={`${REMOTE_BASE_URL}${image.image}` || "/placeholder.svg"}
              alt={`Imagen ${image.id}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-slate-600 text-xs">Agua</p>
                <p className="font-bold text-blue-700">{image.water_percentage.toFixed(2)}%</p>
                <p className="text-xs text-blue-700 opacity-80">({image.water_area_m2.toFixed(2)} m²)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <Leaf className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-slate-600 text-xs">Lirio</p>
                <p className="font-bold text-green-700">{image.vegetation_percentage.toFixed(2)}%</p>
                <p className="text-xs text-green-700 opacity-80">({image.vegetation_area_m2.toFixed(2)} m²)</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => onOpenModal(image)}
            variant="secondary"
            className="w-full text-blue-600 bg-slate-100 hover:bg-slate-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalle Completo
          </Button>
        </Card>
      ))}
    </div>
  </div>
)

// ------------------------------ //
// FUNCIONES UTILITARIAS
// ------------------------------ //

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

  // Si ya tiene formato completo, dejarlo como está
  if (dateString.includes('T') && dateString.includes(':')) {
    // Asegurar que termine con Z si no tiene zona horaria
    if (!dateString.endsWith('Z')) {
      return dateString + 'Z'
    }
    return dateString
  }

  // Si es formato datetime-local (YYYY-MM-DDTHH:MM), agregar segundos y Z
  if (dateString.length === 16) {
    return `${dateString}:00Z`
  }

  return dateString
}

// ------------------------------ //
// COMPONENTE PRINCIPAL
// ------------------------------ //

export default function PhotoAnalyzer() {
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
  const [isHistoryListModalOpen, setIsHistoryListModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const configureFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const getNowDatetimeLocal = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  // Función para manejar la selección de archivos
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
        if (currentStep === "upload") {
          setCurrentStep("configure")
        }

        // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
        e.target.value = ""
      }
    },
    [currentStep],
  )

  // Función para manejar el drag & drop
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

  // Función para abrir el selector de archivos desde el paso de upload
  const handleUploadAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Función para abrir el selector de archivos desde el paso de configure
  const handleAddMoreClick = () => {
    if (configureFileInputRef.current) {
      configureFileInputRef.current.click()
    }
  }

  useEffect(() => {
    // Manejar la creación de URLs para previsualización
    if (selectedFiles.length > imagePreviewUrls.length) {
      const newFiles = selectedFiles.slice(imagePreviewUrls.length)
      const newUrls = newFiles.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prevUrls) => [...prevUrls, ...newUrls])

      // Sincronizar descripciones y fechas para los nuevos archivos
      const newDescriptions = Array(newFiles.length).fill("")
      setDescriptions((prev) => [...prev, ...newDescriptions])
      const newDates = Array(newFiles.length).fill(getNowDatetimeLocal())
      setCaptureDates((prev) => [...prev, ...newDates])
    } else if (selectedFiles.length < imagePreviewUrls.length) {
      // Manejar la eliminación de archivos
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
    const fetchHistoricalImages = async () => {
      setHistoricalImages([])
      setSelectedFiles([])

      if (!ecosystemId || ecosystemId === "new") {
        setEcosystemName("")
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
          description: `Se cargaron ${filteredImages.length} imágenes históricas. Haz clic en "Ver Historial Completo" para ver los datos.`,
        })
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setHistoricalImages([])
        toast({
          title: "Error de Historial",
          description: "No se pudieron obtener o filtrar las imágenes históricas para este ID. Vuelve a seleccionar.",
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

  const validateForm = () => {
    if (selectedFiles.length === 0) {
      return "Por favor, selecciona al menos una imagen para analizar."
    }
    if (!ecosystemName.trim()) {
      return "El nombre del cuerpo de agua (ecosistema) es requerido."
    }

    const missingDates = captureDates.some((date) => !date)
    if (missingDates) {
      return "Todas las imágenes deben tener una fecha de captura."
    }
    return null
  }

  const handleAnalyze = async () => {
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
      const formData = new FormData()

      // ✅ CORREGIDO: Usar ecosystem_id cuando existe
      if (ecosystemId && ecosystemId.trim() !== "new") {
        formData.append("ecosystem_id", ecosystemId.trim())
      } else {
        formData.append("ecosystem_name", ecosystemName.trim())
      }

      // Agregar imágenes
      selectedFiles.forEach((file) => {
        formData.append("images", file)
      })

      // ✅ CORREGIDO: Usar capture_dates (sin []) y formato correcto
      captureDates.forEach((date) => {
        const normalizedDate = normalizeDateForAPI(date)
        formData.append("capture_dates", normalizedDate || getNowDatetimeLocal() + ":00Z")
      })

      // ✅ CORREGIDO: Usar descriptions (sin [])
      descriptions.forEach((desc) => {
        formData.append("descriptions", desc || "")
      })

      const response = await fetch(`${REMOTE_BASE_URL}/api/monitoring/images/upload-multiple/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const responseBody = await response.text()
        let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`
        try {
          const errorData = JSON.parse(responseBody)
          errorMessage = errorData.error || errorData.detail || JSON.stringify(errorData) || errorMessage
        } catch (parseError) {
          if (responseBody) errorMessage = responseBody
        }
        throw new Error(errorMessage)
      }

      const result: UploadResponse = await response.json()
      setAnalysisResult(result)
      setCurrentStep("results")

      toast({
        title: "Análisis Completado",
        description: result.message || "Las imágenes se analizaron con éxito.",
        variant: "default",
      })
    } catch (error) {
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
    setSelectedImageResult(null)
  }, [])

  const handleOpenHistoryListModal = useCallback(() => {
    setIsModalOpen(false)
    setIsHistoryListModalOpen(true)
  }, [])

  const handleCloseHistoryListModal = useCallback(() => {
    setIsHistoryListModalOpen(false)
  }, [])

  const handleViewHistoryDetail = useCallback(
    (image: ImageResult) => {
      handleCloseHistoryListModal()
      handleOpenModal(image)
    },
    [handleCloseHistoryListModal, handleOpenModal],
  )

  const handleBackToHistoryList = () => {
    handleCloseModal()
    handleOpenHistoryListModal()
  }

  const steps = [
    { id: "upload", label: "Subir", icon: Upload },
    { id: "configure", label: "Configurar", icon: FileText },
    { id: "analyze", label: "Analizar", icon: Sparkles },
    { id: "results", label: "Resultados", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
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
    historicalImages,
    onBackToList,
  }) => {
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

    // 1. Obtener la URL de la API
    const imageUrlFromAPI = result.image;

    // 2. Determinar la fuente final
    let finalSrc;

    if (typeof imageUrlFromAPI === 'string' && imageUrlFromAPI.length > 0) {
      // Caso A: Si ya empieza con 'http' o 'https', ¡es una URL absoluta!
      if (imageUrlFromAPI.startsWith('http://') || imageUrlFromAPI.startsWith('https://')) {
        finalSrc = imageUrlFromAPI;
      }
      // Caso B: Si no es una URL absoluta (es una ruta relativa como '/media/drones/...')
      else {
        // Normalizamos la base para evitar dobles barras y concatenamos
        const normalizedBase = REMOTE_BASE_URL.endsWith('/')
          ? REMOTE_BASE_URL.slice(0, -1) // Quitar barra final si existe
          : REMOTE_BASE_URL;

        // Aseguramos que la ruta de la imagen empiece con una barra para la concatenación
        const normalizedPath = imageUrlFromAPI.startsWith('/')
          ? imageUrlFromAPI
          : `/${imageUrlFromAPI}`;

        finalSrc = `${normalizedBase}${normalizedPath}`;
      }
    } else {
      // Caso C: Si el campo 'image' está vacío o nulo
      finalSrc = '/placeholder.jpg'; // Usa una imagen de reserva local
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de Captura ID: ${result.id}`} size="xl">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={finalSrc}
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
            {/* ✅ CORREGIDO: Verificar si metadata existe */}
            {result.metadata && (
              <p className="text-xs text-slate-500 flex items-center">
                <Ruler className="w-3 h-3 mr-1" />
                Resolución: 1 píxel = {result.metadata.resolution_m_per_px} m²
              </p>
            )}
            {/* ✅ Mostrar mensaje si no hay metadata */}
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
                  ? formatDateForDisplay(mostRecentHistoricalImage.capture_date)
                  : "No hay historial previo."}

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
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[32px] font-normal text-slate-900 mb-2">Análisis de Imágenes</h2>
          <p className="text-[16px] text-slate-600">
            Detecta y cuantifica el área de cuerpos de agua y cobertura vegetal mediante análisis de imágenes satelitales.
          </p>
        </div>
        <Card className="mb-8 p-6 border-0 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStepIndex === index
              const isCompleted = currentStepIndex > index

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

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
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
                onAreaClick={handleUploadAreaClick}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            )}

            {currentStep === "configure" && (
              <>
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
                  onAddMore={handleAddMoreClick}
                  fileInputRef={configureFileInputRef}
                  onFileChange={handleFileChange}
                  ecosystems={ecosystems}
                  historicalImages={historicalImages}
                  loadingHistory={loadingHistory}
                  onOpenHistoryListModal={handleOpenHistoryListModal}
                />
                {/* Input file oculto específico para el paso de configuración */}
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

            {currentStep === "analyze" && <AnalyzeStep loading={loading} />}

            {currentStep === "results" && analysisResult && (
              <ResultsStep
                result={analysisResult}
                remoteBaseUrl={REMOTE_BASE_URL}
                onOpenModal={handleOpenModal}
                historicalImages={historicalImages}
              />
            )}
          </div>

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
            <Card className="p-6 border-0 shadow-sm bg-white">
              <div className="space-y-3">
                {currentStep === "configure" && (
                  <>
                    <Button
                      onClick={() => handleAnalyze()}
                      disabled={
                        selectedFiles.length === 0 ||
                        loadingHistory ||
                        // Lógica corregida: Deshabilitar solo si NO hay ID Y el nombre está vacío
                        !((ecosystemId && ecosystemId.trim()) || ecosystemName.trim())
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-[14px] font-medium rounded-lg shadow-sm"
                    >
                      {loadingHistory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Iniciar Análisis"}
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

            {currentStep !== "results" && (
              <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="text-[14px] font-medium text-slate-900 mb-1">Análisis de Imagen</h4>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      Nuestro sistema utiliza modelos entrenados y herramientas de procesamiento de imágenes para detectar y cuantificar áreas de agua y Lirio con alta precisión.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

                {/* Modal de detalle de imagen (existente) */}
        <ImageDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          result={selectedImageResult}
          remoteBaseUrl={REMOTE_BASE_URL}
          historicalImages={historicalImages}
          onBackToList={handleBackToHistoryList}
        />

        {/* Nuevo Modal de Historial Profesional */}
        <ProfessionalHistoryModal
          isOpen={isHistoryListModalOpen}
          onClose={handleCloseHistoryListModal}
          historicalImages={historicalImages}
          ecosystemName={ecosystemName}
          ecosystemId={ecosystemId}
          onViewDetail={handleViewHistoryDetail}
          remoteBaseUrl={REMOTE_BASE_URL}
        />
      </div>
      <Toaster />
    </div>
  )
}