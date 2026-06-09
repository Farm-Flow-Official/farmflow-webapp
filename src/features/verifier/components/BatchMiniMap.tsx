'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/features/verifier/components/LeafletMiniMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-ink-muted">
      โหลดแผนที่…
    </div>
  ),
})

export function BatchMiniMap({
  polygon,
  pin,
  pinColor,
}: {
  polygon: [number, number][]
  pin?: [number, number]
  pinColor?: string
}) {
  return <Map polygon={polygon} pin={pin} pinColor={pinColor} />
}
