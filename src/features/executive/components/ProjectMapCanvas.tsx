'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

export type ProjectPin = {
  id: string
  name: string
  tco2e: number
  lat: number
  lng: number
  active: boolean
}

/** Frames the pins — the selected one alone when there is a selection. */
function Fit({ pins }: { pins: ProjectPin[] }) {
  const map = useMap()
  useEffect(() => {
    const focus = pins.filter((p) => p.active)
    const framed = focus.length > 0 ? focus : pins
    if (framed.length === 0) return
    if (framed.length === 1) {
      map.setView([framed[0].lat, framed[0].lng], 11)
      return
    }
    const lats = framed.map((p) => p.lat)
    const lngs = framed.map((p) => p.lng)
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [32, 32], maxZoom: 12 },
    )
  }, [pins, map])
  return null
}

/** Leaflet sizes late inside a grid cell; without this the tiles render grey. */
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
 * One pin per PROJECT, placed at the centroid of that project's farm boundaries
 * — never a per-farm point. At this altitude a board member has no business
 * being able to locate an individual farmer's plot.
 *
 * A locked thumbnail: no dragging or zooming, so a stray touch cannot lose the
 * framing on a tablet.
 */
export default function ProjectMapCanvas({ pins }: { pins: ProjectPin[] }) {
  const maxTonnes = Math.max(...pins.map((p) => p.tco2e), 1)
  const hasSelection = pins.some((p) => p.active)
  const center: LatLngExpression = [15.87, 100.99]

  return (
    <MapContainer
      className="h-full w-full"
      center={center}
      zoom={5}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        attribution="Tiles &copy; Esri"
      />
      {pins.map((p) => {
        // Dimmed rather than hidden: the unselected projects are the context
        // that makes the selected one's position mean anything.
        const muted = hasSelection && !p.active
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            // Area, not radius, tracks the tonnage — a radius-proportional circle
            // exaggerates the biggest project by its square.
            radius={(6 + Math.sqrt(p.tco2e / maxTonnes) * 10) * (p.active ? 1.35 : 1)}
            pathOptions={{
              color: '#ffffff',
              weight: p.active ? 3 : 2,
              fillColor: '#1F7A46',
              fillOpacity: muted ? 0.3 : 0.9,
              opacity: muted ? 0.4 : 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]} permanent={p.active}>
              {p.name}
            </Tooltip>
          </CircleMarker>
        )
      })}
      <Fit pins={pins} />
      <Resizer />
    </MapContainer>
  )
}
