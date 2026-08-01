'use client'

import { useState } from 'react'

/**
 * Raw `<img>` (served via the file/cover proxy routes, so Next's `<Image>` is
 * not used) that fades in once loaded instead of popping in. Renders as a
 * fragment — an absolute skeleton overlay + the image — so it drops into an
 * existing `relative` container without changing its layout.
 *
 * `skeleton` (default true) shows a pulsing `bg-sunken` fill while loading. Pass
 * `skeleton={false}` where the container already has its own loading backdrop
 * (e.g. the tree snapshots' earthy gradient) so the fade happens over that.
 *
 * The component only toggles `opacity` — include a `transition*` utility in
 * `className` so the fade animates (e.g. `transition-opacity`, or plain
 * `transition` when the image also has a hover transform to animate).
 */
export function ImageWithSkeleton({
  src,
  alt,
  className = '',
  loading,
  skeleton = true,
}: {
  src: string
  alt: string
  /** Classes for the `<img>` — pass exactly what the raw img used before. */
  className?: string
  loading?: 'lazy' | 'eager'
  skeleton?: boolean
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {skeleton && !loaded && (
        <span aria-hidden className="absolute inset-0 z-[1] animate-pulse bg-sunken" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        // Don't pulse forever on a broken image — reveal the fallback backdrop.
        onError={() => setLoaded(true)}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )
}
