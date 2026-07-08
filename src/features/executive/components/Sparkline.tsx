/**
 * Tiny inline trend for a KPI tile — an area + line sparkline, no axes or labels
 * (dataviz: a sparkline is a mark, not a chart). Pure SVG so it renders on the
 * server. `preserveAspectRatio="none"` stretches it to the tile width while
 * `vector-effect="non-scaling-stroke"` keeps the line crisp at any width.
 */
export function Sparkline({
  data,
  color,
  className = 'h-9 w-full',
}: {
  data: number[]
  color: string
  className?: string
}) {
  if (data.length < 2) return null

  const H = 32
  const PAD = 2
  const plotH = H - PAD * 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const n = data.length

  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * 100
    const y = PAD + (1 - (v - min) / range) * plotH
    return [x, y] as const
  })

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L100,${H} L0,${H} Z`

  return (
    <svg
      viewBox={`0 0 100 ${H}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={area} fill={color} fillOpacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
