"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Cargando mapa interactivo...</p>
        <p className="text-sm text-slate-500 mt-2">Preparando herramientas de visualización</p>
      </div>
    </div>
  ),
})

export default function MapaPage() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <MapComponent />
    </div>
  )
}
