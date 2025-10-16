"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMap,
  LayersControl,
  Marker,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Download, 
  Save, 
  MapPin, 
  Navigation, 
  Layers, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Minimize2,
  Maximize2
} from "lucide-react";

// Importa CSS necesarios para Leaflet y extensiones
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";

// Corrige íconos rotos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Interfaces
interface GeoSearchProps {
  onLocationFound: (label: string) => void;
}

interface ClickHandlerProps {
  isSelecting: boolean;
  onMapClick: (latlng: L.LatLng) => void;
}

interface MapToolsProps {
  onExport: () => void;
  onSave: () => void;
  onTogglePointSelection: () => void;
  isSelectingPoint: boolean;
  locationName: string;
  referenceMarker: L.LatLng | null;
  drawnItemsCount: number;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

interface LocationInfoProps {
  locationName: string;
  referenceMarker: L.LatLng | null;
}

// Componente para la barra de herramientas del mapa (MINIMIZABLE)
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
      <Card className="absolute top-4 right-4 z-10 w-12 shadow-lg">
        <CardContent className="p-2">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onToggleMinimize}
                    size="sm"
                    variant="ghost"
                    className="w-full h-8 p-0"
                  >
                    <Maximize2 className="h-4 w-4" />
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
                    size="sm"
                    variant="ghost"
                    className="w-full h-8 p-0"
                    disabled={drawnItemsCount === 0}
                  >
                    <Download className="h-4 w-4" />
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
                    size="sm"
                    variant={isSelectingPoint ? "default" : "ghost"}
                    className={`w-full h-8 p-0 ${
                      isSelectingPoint ? "bg-yellow-500 hover:bg-yellow-600" : ""
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

            {/* Badge de contador en versión minimizada */}
            {drawnItemsCount > 0 && (
              <div className="flex justify-center">
                <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {drawnItemsCount}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-4 right-4 z-10 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Herramientas del Mapa
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleMinimize}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimizar herramientas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Información de ubicación */}
        {(locationName || referenceMarker) && (
          <div className="text-xs space-y-1 p-2 bg-muted rounded-md">
            <div className="font-medium">Ubicación seleccionada:</div>
            {locationName && (
              <div className="text-foreground font-semibold truncate" title={locationName}>
                {locationName}
              </div>
            )}
            {referenceMarker && (
              <div className="text-muted-foreground">
                Lat: {referenceMarker.lat.toFixed(5)}, Lng: {referenceMarker.lng.toFixed(5)}
              </div>
            )}
          </div>
        )}

        {/* Contador de elementos dibujados */}
        <div className="flex items-center justify-between text-xs">
          <span>Elementos dibujados:</span>
          <Badge variant={drawnItemsCount > 0 ? "default" : "secondary"}>
            {drawnItemsCount}
          </Badge>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onExport}
                  size="sm"
                  variant="outline"
                  className="w-full"
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
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={drawnItemsCount === 0}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar datos (POST)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Botón de selección de punto */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onTogglePointSelection}
                size="sm"
                variant={isSelectingPoint ? "default" : "outline"}
                className={`w-full ${
                  isSelectingPoint ? "bg-yellow-500 hover:bg-yellow-600" : ""
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

        {/* Instrucciones rápidas */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="font-medium mb-1">Instrucciones:</div>
          <ul className="space-y-1">
            <li>• Usa el buscador para ubicaciones</li>
            <li>• Dibuja polígonos con herramientas</li>
            <li>• Referencia puntos con el botón</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para el control de búsqueda
const GeoSearch: React.FC<GeoSearchProps> = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: true,
      autoClose: true,
      keepResult: true,
      searchLabel: "Buscar dirección o lugar...",
    });

    map.addControl(searchControl);

    const handleLocationFound = (result: any) => {
      if (result.location && result.location.label) {
        onLocationFound(result.location.label);
      }
    };

    map.on("geosearch/showlocation", handleLocationFound);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleLocationFound);
    };
  }, [map, onLocationFound]);

  return null;
};

// Componente para manejar clics en el mapa
const ClickHandler: React.FC<ClickHandlerProps> = ({ isSelecting, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (isSelecting) {
      const handler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
      };
      map.on("click", handler);

      return () => {
        map.off("click", handler);
      };
    }
  }, [isSelecting, map, onMapClick]);

  return null;
};

// Componente principal del mapa
const MapComponent = () => {
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isSelectingPoint, setIsSelectingPoint] = useState(false);
  const [referenceMarker, setReferenceMarker] = useState<L.LatLng | null>(null);
  const [drawnItemsCount, setDrawnItemsCount] = useState(0);
  const [isToolsMinimized, setIsToolsMinimized] = useState(false);

  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const handleLocationNameUpdate = useCallback((label: string) => {
    setLocationName(label);
  }, []);

  useEffect(() => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current);
      updateDrawnItemsCount();
    }
  }, []);

  const updateDrawnItemsCount = () => {
    if (featureGroupRef.current) {
      setDrawnItemsCount(featureGroupRef.current.getLayers().length);
    }
  };

  // Geocodificación inversa
  const handleReverseGeocode = async (latlng: L.LatLng) => {
    setIsSelectingPoint(false);
    setReferenceMarker(latlng);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SistemaDeMapeoEcosistemas/1.0",
        },
      });
      const data = await response.json();

      if (data.display_name) {
        const newName = data.display_name;
        setLocationName(newName);
      } else {
        setLocationName("Punto sin referencia detallada");
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      setLocationName("Error al obtener referencia");
    }
  };

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      if (isSelectingPoint) {
        handleReverseGeocode(latlng);
      }
    },
    [isSelectingPoint]
  );

  // Manejo de dibujos
  const handleCreated = (e: any) => {
    const { layer } = e;
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(layer);
      setDrawnItems(featureGroupRef.current);
      updateDrawnItemsCount();
    }
  };

  const handleEdited = (e: any) => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current);
      updateDrawnItemsCount();
    }
  };

  const handleDeleted = (e: any) => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current);
      updateDrawnItemsCount();
    }
  };

  // Exportar datos
  const handleExport = () => {
    const currentDrawnItems = featureGroupRef.current;

    if (!currentDrawnItems || currentDrawnItems.getLayers().length === 0) {
      alert("Por favor, dibuja al menos un polígono primero.");
      return;
    }

    const allLayers = currentDrawnItems.getLayers();
    const featureCollection = {
      type: "FeatureCollection",
      properties: {
        location_name: locationName || "No especificado",
        reference_point: referenceMarker ? [referenceMarker.lat, referenceMarker.lng] : null,
        timestamp: new Date().toISOString(),
      },
      features: allLayers.map((layer) => (layer as any).toGeoJSON()),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection));
    const downloadAnchorNode = document.createElement("a");
    const fileName = locationName
      ? locationName.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".geojson"
      : "zona.geojson";

    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Guardar datos
  const handleSaveData = () => {
    const currentDrawnItems = featureGroupRef.current;

    if (!currentDrawnItems || currentDrawnItems.getLayers().length === 0) {
      alert("Por favor, dibuja al menos un polígono primero.");
      return;
    }

    const allLayers = currentDrawnItems.getLayers();
    const featureCollection = {
      type: "FeatureCollection",
      properties: {
        location_name: locationName || "No especificado",
        reference_point: referenceMarker ? [referenceMarker.lat, referenceMarker.lng] : null,
        timestamp: new Date().toISOString(),
      },
      features: allLayers.map((layer) => (layer as any).toGeoJSON()),
    };

    console.log("--- DATOS PARA GUARDAR ---");
    console.log(JSON.stringify(featureCollection, null, 2));
    console.log("--------------------------");

    alert("Datos listos para guardar. Revisa la consola del navegador.");
  };

  const handleTogglePointSelection = () => {
    setIsSelectingPoint(!isSelectingPoint);
  };

  const handleToggleToolsMinimize = () => {
    setIsToolsMinimized(!isToolsMinimized);
  };

  return (
    <div className="relative mx-4 mb-10 mt-6 h-[700px] border rounded-xl overflow-hidden shadow-lg">
      {/* Barra de herramientas MINIMIZABLE */}
      <MapTools
        onExport={handleExport}
        onSave={handleSaveData}
        onTogglePointSelection={handleTogglePointSelection}
        isSelectingPoint={isSelectingPoint}
        locationName={locationName}
        referenceMarker={referenceMarker}
        drawnItemsCount={drawnItemsCount}
        isMinimized={isToolsMinimized}
        onToggleMinimize={handleToggleToolsMinimize}
      />

      <MapContainer
        center={[19.43, -99.13]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full z-0"
      >
        {/* Manejador de clics */}
        <ClickHandler isSelecting={isSelectingPoint} onMapClick={handleMapClick} />

        {/* Marcador de referencia */}
        {referenceMarker && <Marker position={referenceMarker} />}

        {/* Control de capas */}
        <LayersControl position="topright" collapsed={false}>
          <LayersControl.BaseLayer checked name="Satélite con Nombres">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              pane="tilePane"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Mapa Claro">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satélite Puro">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Grupo para dibujos */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              polyline: false,
              marker: false,
              circlemarker: false,
              circle: false,
              rectangle: true,
              polygon: true,
            }}
          />
        </FeatureGroup>

        {/* Control de búsqueda */}
        <GeoSearch onLocationFound={handleLocationNameUpdate} />
      </MapContainer>

      {/* Indicador de modo selección */}
      {isSelectingPoint && (
        <div className="absolute bottom-4 left-4 z-10 bg-yellow-500 text-white px-3 py-2 rounded-md shadow-lg text-sm font-semibold animate-pulse">
          <MapPin className="h-4 w-4 inline mr-2" />
          Modo selección activo - Haz clic en el mapa
        </div>
      )}

      {/* Indicador de herramientas minimizadas */}
      {isToolsMinimized && (
        <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-3 py-2 rounded-md shadow-lg text-sm">
          <Maximize2 className="h-4 w-4 inline mr-2" />
          Herramientas minimizadas
        </div>
      )}
    </div>
  );
};

export default MapComponent;