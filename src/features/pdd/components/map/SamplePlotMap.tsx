'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'

/** GeoJSON position, [lng, lat]. */
export type Position = [number, number]

export type PlotShape = {
  id: string
  name: string
  /** Outer ring, [lng, lat] — closed. */
  ring: Position[]
}

/** GeoJSON [lng, lat] → Leaflet [lat, lng]. Swapping these silently misplaces geometry. */
const toLatLng = (ring: Position[]): LatLngTuple[] => ring.map(([lng, lat]) => [lat, lng])

function boundsOf(rings: Position[][]): [[number, number], [number, number]] | null {
  const points = rings.flat()
  if (points.length === 0) return null
  const lats = points.map(([, lat]) => lat)
  const lngs = points.map(([lng]) => lng)
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}

/** Frames whatever context exists, so the author never starts on an empty ocean. */
function FitContext({ rings }: { rings: Position[][] }) {
  const map = useMap()
  const key = rings.length

  useEffect(() => {
    const bounds = boundsOf(rings)
    if (!bounds) return
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
    // Refit only when the *set* of context shapes changes, not on every render —
    // otherwise the viewport would fight the author mid-draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])

  return null
}

/** Turns map clicks into vertices while drawing is armed. */
function DrawCapture({
  drawing,
  onPoint,
}: {
  drawing: boolean
  onPoint: (position: Position) => void
}) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    container.style.cursor = drawing ? 'crosshair' : ''
    // Double-click finishes the shape, so it must not also zoom.
    if (drawing) map.doubleClickZoom.disable()
    else map.doubleClickZoom.enable()

    return () => {
      container.style.cursor = ''
      map.doubleClickZoom.enable()
    }
  }, [drawing, map])

  useMapEvents({
    click(e) {
      if (!drawing) return
      onPoint([e.latlng.lng, e.latlng.lat])
    },
  })

  return null
}

/**
 * The map behind the sample-plot editor.
 *
 * Drawing is hand-rolled rather than pulled from a plugin: react-leaflet 5 has
 * no maintained draw wrapper, and the plugins that do work ship an English
 * icon toolbar that would sit oddly inside a Thai form. The interaction here is
 * narrow — one closed polygon, drawn once — so the affordances (undo, cancel,
 * close-by-clicking-the-first-point) can be exactly the ones this task needs.
 */
export default function SamplePlotMap({
  declaredBoundary,
  plots,
  draftRing,
  drawing,
  onPoint,
  onCloseRing,
  selectedPlotId,
  onSelectPlot,
}: {
  /** The project's declared boundary, drawn as context. */
  declaredBoundary: Position[] | null
  plots: PlotShape[]
  /** Vertices placed so far in the current draw. */
  draftRing: Position[]
  drawing: boolean
  onPoint: (position: Position) => void
  /** Fired when the author clicks the first vertex again to close the shape. */
  onCloseRing: () => void
  selectedPlotId: string | null
  onSelectPlot: (id: string) => void
}) {
  const context = useMemo(
    () => [...(declaredBoundary ? [declaredBoundary] : []), ...plots.map((p) => p.ring)],
    [declaredBoundary, plots],
  )

  const draftLatLng = toLatLng(draftRing)

  return (
    <MapContainer
      className="h-full w-full"
      center={[15.87, 100.99]}
      zoom={6}
      scrollWheelZoom
      doubleClickZoom={!drawing}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        maxZoom={19}
      />

      {/* Context: the declared project boundary. */}
      {declaredBoundary && (
        <Polygon
          positions={toLatLng(declaredBoundary)}
          pathOptions={{
            color: '#1E40AF',
            weight: 2,
            fill: false,
            dashArray: '8 6',
            interactive: false,
          }}
        />
      )}

      {/* Saved sample plots. */}
      {plots.map((plot) => {
        const selected = plot.id === selectedPlotId
        return (
          <Polygon
            key={plot.id}
            positions={toLatLng(plot.ring)}
            pathOptions={{
              color: '#F59E0B',
              weight: selected ? 3.5 : 2,
              fillColor: '#F59E0B',
              fillOpacity: selected ? 0.4 : 0.2,
            }}
            eventHandlers={{ click: () => onSelectPlot(plot.id) }}
          />
        )
      })}

      {/* The shape being drawn: an open line until it is closed. */}
      {draftLatLng.length > 1 && (
        <Polyline
          positions={draftLatLng as LatLngExpression[]}
          pathOptions={{ color: '#0EA5E9', weight: 3, dashArray: '6 4' }}
        />
      )}

      {draftLatLng.map((position, i) => {
        const isFirst = i === 0
        return (
          <CircleMarker
            key={`v-${i}`}
            center={position}
            radius={isFirst ? 7 : 5}
            pathOptions={{
              color: '#0EA5E9',
              weight: 2,
              fillColor: isFirst ? '#0EA5E9' : '#fff',
              fillOpacity: 1,
            }}
            eventHandlers={
              // Clicking the first vertex closes the ring — the convention every
              // mapping tool uses, so it needs no explaining.
              isFirst && draftRing.length >= 3
                ? {
                    click: (e) => {
                      e.originalEvent.stopPropagation()
                      onCloseRing()
                    },
                  }
                : undefined
            }
          />
        )
      })}

      <DrawCapture drawing={drawing} onPoint={onPoint} />
      <FitContext rings={context} />
    </MapContainer>
  )
}
