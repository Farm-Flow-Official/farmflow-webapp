'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, CircleMarker, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { token } from '@/styles/token'

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
 * Recomputes the map's pixel size after mount. Needed when the map is created
 * inside a container that sizes late (e.g. the expand modal) — without this,
 * Leaflet renders grey tiles until the next interaction.
 */
function Resizer() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
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
  pinToken = 'gis-flagged',
  interactive = false,
}: {
  polygon: [number, number][]
  pin?: [number, number]
  /**
   * Semantic token name for the pin fill (e.g. 'primary', 'gis-flagged') —
   * resolved here rather than passed as a colour, because the callers are
   * server components and Leaflet cannot take a `var(--token)` (DESIGN.md
   * Appendix B).
   */
  pinToken?: string
  /**
   * When false (default) the map is a fully locked reference thumbnail — no
   * pan/zoom, so a stray finger on iPad can't move it. When true (the expand
   * modal) all user interaction is enabled for exploration.
   */
  interactive?: boolean
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
      // Locked thumbnail vs. interactive modal — every user-interaction flag
      // follows `interactive`. The programmatic `Fit` below always frames the
      // polygon regardless.
      dragging={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      scrollWheelZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      zoomControl={interactive}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        attribution="Tiles &copy; Esri"
      />
      <Polygon
        positions={positions}
        pathOptions={{ color: token('gis-verified'), weight: 2, fillColor: token('gis-verified'), fillOpacity: 0.25 }}
      />
      {pinLatLng && (
        <CircleMarker
          center={pinLatLng}
          radius={7}
          pathOptions={{ color: token('on-imagery'), weight: 2, fillColor: token(pinToken), fillOpacity: 1 }}
        />
      )}
      <Fit positions={pinLatLng ? [...positions, pinLatLng] : positions} />
      <Resizer />
    </MapContainer>
  )
}
