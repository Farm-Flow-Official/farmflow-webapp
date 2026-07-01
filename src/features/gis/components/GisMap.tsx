'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { farmMapState, type FarmGeo, type FarmMapState } from '@/features/gis/types'

/** Hex values mirror the --color-gis-* design tokens (Leaflet draws via JS, not CSS). */
const STATE_COLOR: Record<FarmMapState, string> = {
  flagged: '#EF4444',
  pending: '#F59E0B',
  verified: '#22C55E',
}

/** GeoJSON [lng, lat] → Leaflet [lat, lng]. */
function toLatLng(poly: FarmGeo['polygon']): LatLngExpression[] {
  return poly.map(([lng, lat]) => [lat, lng])
}

/** [lat, lng] bounds corners for a polygon. */
function polygonBounds(poly: FarmGeo['polygon']): [[number, number], [number, number]] {
  const lats = poly.map(([, lat]) => lat)
  const lngs = poly.map(([lng]) => lng)
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}

/** Fits the viewport to the currently shown farms whenever that set changes. */
function FitBounds({ farms }: { farms: FarmGeo[] }) {
  const map = useMap()
  useEffect(() => {
    if (farms.length === 0) return
    const pts = farms.flatMap((f) =>
      f.polygon.map(([lng, lat]) => [lat, lng] as [number, number]),
    )
    const lats = pts.map((p) => p[0])
    const lngs = pts.map((p) => p[1])
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [48, 48], maxZoom: 16 },
    )
  }, [farms, map])
  return null
}

/** Flies to a farm when `nonce` changes (used by the search box). */
function FocusFarm({ farm, nonce }: { farm: FarmGeo | null; nonce: number }) {
  const map = useMap()
  useEffect(() => {
    if (!farm) return
    map.flyToBounds(polygonBounds(farm.polygon), {
      padding: [80, 80],
      maxZoom: 17,
      duration: 0.8,
    })
    // Intentionally fire only on nonce change, not on every farm-ref change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])
  return null
}

export default function GisMap({
  farms,
  selectedId,
  onSelect,
  focusFarm,
  focusNonce,
}: {
  farms: FarmGeo[]
  selectedId: string | null
  onSelect: (id: string) => void
  focusFarm: FarmGeo | null
  focusNonce: number
}) {
  return (
    <MapContainer
      className="h-full w-full"
      center={[15.87, 100.99]}
      zoom={6}
      scrollWheelZoom
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        maxZoom={19}
      />
      {farms.map((f) => {
        const color = STATE_COLOR[farmMapState(f)]
        const selected = f.id === selectedId
        return (
          <Polygon
            key={f.id}
            positions={toLatLng(f.polygon)}
            pathOptions={{
              color,
              weight: selected ? 4 : 2,
              fillColor: color,
              fillOpacity: selected ? 0.5 : 0.25,
              // Dashed outline flags a not-yet-verified GEE land-check (e.g. plot
              // on water, or GEE hasn't run yet); solid once verified.
              dashArray: f.gee?.status !== 'verified' ? '6 6' : undefined,
            }}
            eventHandlers={{ click: () => onSelect(f.id) }}
          />
        )
      })}
      <FitBounds farms={farms} />
      <FocusFarm farm={focusFarm} nonce={focusNonce} />
    </MapContainer>
  )
}
