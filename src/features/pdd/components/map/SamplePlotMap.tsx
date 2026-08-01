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

/**
 * Leaflet measures its container once, at init. When the map mounts inside a
 * dialog that is still being laid out, that measurement can be a frame early —
 * the tiles come out clipped and `fitBounds` frames the wrong rectangle. One
 * re-measure after paint costs nothing and removes the whole class of bug.
 */
function InvalidateOnMount() {
  const map = useMap()
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(id)
  }, [map])
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
  locked = false,
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
  /**
   * Turn every pan/zoom gesture off. On a tablet the map is a trap: the finger
   * that meant to scroll the form lands on it, the page stops moving and the
   * viewport jumps somewhere else instead. Locked, Leaflet stops swallowing
   * touchmove and the page scrolls the way the reader expected. Tapping a plot
   * still selects it — that is a tap, not a swipe, and nobody does it by
   * accident.
   */
  locked?: boolean
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
      dragging={!locked}
      touchZoom={!locked}
      scrollWheelZoom={!locked}
      boxZoom={!locked}
      keyboard={!locked}
      zoomControl={!locked}
      doubleClickZoom={!locked && !drawing}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        maxZoom={19}
      />

      {/* Context: the declared project boundary.

          Drawn as a white dashed line over a dark casing rather than in a
          single colour. Satellite imagery is every colour at once — the old
          navy line vanished into tree canopy and shadow, which is precisely
          where a plantation boundary runs. A light line with a dark outline
          keeps its edge against both bright soil and dark cover, the same
          trick road labels use on aerial basemaps. */}
      {declaredBoundary && (
        <>
          <Polygon
            positions={toLatLng(declaredBoundary)}
            pathOptions={{
              color: '#0F172A',
              weight: 6,
              opacity: 0.55,
              fill: false,
              interactive: false,
            }}
          />
          <Polygon
            positions={toLatLng(declaredBoundary)}
            pathOptions={{
              color: '#FFFFFF',
              weight: 2.5,
              fill: false,
              dashArray: '10 7',
              interactive: false,
            }}
          />
        </>
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
      <InvalidateOnMount />
    </MapContainer>
  )
}
