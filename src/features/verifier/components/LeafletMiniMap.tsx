'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, CircleMarker, useMap } from 'react-leaflet'
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

/**
 * Small read-only satellite map showing one farm polygon. Optionally pins a
 * capture point ([lng, lat]) via a CircleMarker — avoids Leaflet's default
 * marker-icon asset (which 404s under bundlers). Used by V-04 and V-05.
 */
export default function LeafletMiniMap({
  polygon,
  pin,
  pinColor = '#C8000E',
}: {
  polygon: [number, number][]
  pin?: [number, number]
  pinColor?: string
}) {
  // GeoJSON [lng, lat] → Leaflet [lat, lng].
  const positions = polygon.map(([lng, lat]) => [lat, lng] as [number, number])
  const pinLatLng: [number, number] | null = pin ? [pin[1], pin[0]] : null
  const center: LatLngExpression = [15.87, 100.99]

  return (
    <MapContainer
      className="h-full w-full"
      center={center}
      zoom={6}
      // Fully locked: a static reference thumbnail. On touch (iPad) a stray
      // finger must not pan/zoom it. The programmatic `Fit` below still frames
      // the polygon — these flags only disable *user* interaction.
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
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
      {pinLatLng && (
        <CircleMarker
          center={pinLatLng}
          radius={7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: pinColor, fillOpacity: 1 }}
        />
      )}
      <Fit positions={pinLatLng ? [...positions, pinLatLng] : positions} />
    </MapContainer>
  )
}
