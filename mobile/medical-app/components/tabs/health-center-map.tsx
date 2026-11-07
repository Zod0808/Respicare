"use client"

/**
 * Nombre de Objeto: HealthCenterMap
 * Fecha de Creación: 2026-11-07
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-012 - Geolocalización de centros de salud
 * Descripción: Mapa embebido (Leaflet + OpenStreetMap, sin API key) que
 * muestra la ubicación del paciente y los centros de salud cercanos,
 * implementando el "mapa de resultados" propuesto en el diagrama de clases
 * de RF-012 (useGeolocation -> CentroDeSaludService.buscarCercanos).
 */
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet"
import L from "leaflet"
import type { HealthCenter } from "@/lib/api/services/healthCenterService"

const HEALTH_CENTER_TYPE_LABELS: Record<HealthCenter["type"], string> = {
  hospital: "Hospital",
  centro_salud: "Centro de Salud",
  posta_medica: "Posta Médica",
  clinica: "Clínica",
}

const centerIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2563eb;width:16px;height:16px;border-radius:9999px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

interface HealthCenterMapProps {
  userLocation: { latitude: number; longitude: number }
  centers: HealthCenter[]
}

export function HealthCenterMap({ userLocation, centers }: HealthCenterMapProps) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[userLocation.latitude, userLocation.longitude]}
          radius={8}
          pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.8 }}
        >
          <Popup>Tu ubicación</Popup>
        </CircleMarker>
        {centers.map((center) => (
          <Marker
            key={center.id}
            position={[center.location.latitude, center.location.longitude]}
            icon={centerIcon}
          >
            <Popup>
              <strong>{center.name}</strong>
              <br />
              {HEALTH_CENTER_TYPE_LABELS[center.type]} — {center.distanceKm} km
              <br />
              {center.address}, {center.district}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default HealthCenterMap
