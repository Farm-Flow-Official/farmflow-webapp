'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

function Fit({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    const lats = positions.map((p) => p[0])
    const lngs = positions.map((p) => p[1])
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [24, 24], maxZoom: 17 },
    )
  }, [positions, map])
  return null
}

/** Small read-only satellite map showing one farm polygon (V-04). */
export default function LeafletMiniMap({ polygon }: { polygon: [number, number][] }) {
  // GeoJSON [lng, lat] → Leaflet [lat, lng].
  const positions = polygon.map(([lng, lat]) => [lat, lng] as [number, number])
  const center: LatLngExpression = [15.87, 100.99]

  return (
    <MapContainer
      className="h-full w-full"
      center={center}
      zoom={6}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        attribution="Tiles &copy; Esri"
      />
      <Polygon
        positions={positions}
        pathOptions={{ color: '#22C55E', weight: 2, fillColor: '#22C55E', fillOpacity: 0.25 }}
      />
      <Fit positions={positions} />
    </MapContainer>
  )
}
