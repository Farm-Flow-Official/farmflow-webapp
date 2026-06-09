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

export function BatchMiniMap({ polygon }: { polygon: [number, number][] }) {
  return <Map polygon={polygon} />
}
