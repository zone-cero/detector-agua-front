"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMap,
  LayersControl,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { Button } from "@/components/ui/button";

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

// Componente para añadir el control de búsqueda con GeoSearch dentro del mapa
const GeoSearch = () => {
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
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

// Componente principal del mapa
const MapComponent = () => {
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  // Se ejecuta cuando el FeatureGroup se monta
  useEffect(() => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current);
    }
  }, []);

  // Maneja la creación de nuevos dibujos
  const handleCreated = (e: any) => {
    const { layer } = e;
    if (drawnItems) {
      drawnItems.addLayer(layer);
    }
  };
  
  // Maneja la edición de un dibujo
  const handleEdited = (e: any) => {
    console.log("Dibujo editado:", e);
  };
  
  // Maneja la eliminación de un dibujo
  const handleDeleted = (e: any) => {
    console.log("Dibujo eliminado:", e);
  };

  // Exporta todos los dibujos como un archivo GeoJSON
  const handleExport = () => {
    if (!drawnItems || drawnItems.getLayers().length === 0) {
      alert("Por favor, dibuja al menos un polígono primero.");
      return;
    }
    
    // Convierte todas las capas a GeoJSON y las combina
    const allLayers = drawnItems.getLayers();
    const featureCollection = {
      type: "FeatureCollection",
      features: allLayers.map(layer => (layer as any).toGeoJSON()),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "zona.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="relative mx-[50px] mt-10 h-[600px] border rounded-xl overflow-hidden shadow-lg">
      {/* Botón de exportación */}
      <Button onClick={handleExport} className="absolute top-28 right-4 z-10 shadow-md">
        Exportar GeoJSON
      </Button>

      <MapContainer
        center={[19.43, -99.13]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full z-0"
      >
        {/* Control para cambiar capas base */}
        <LayersControl position="topright" collapsed={true}>
          {/* Capa Claro */}
          <LayersControl.BaseLayer checked name="Claro">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* Capa Satélite */}
          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* Capa Híbrida (Satélite + Nombres) */}
          <LayersControl.BaseLayer name="Híbrido (Satélite + Nombres)">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              pane="tilePane"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Grupo para dibujos creados */}
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
            }}
          />
        </FeatureGroup>

        {/* Control del buscador */}
        <GeoSearch />
      </MapContainer>
    </div>
  );
};

export default MapComponent;