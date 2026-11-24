/**
 * Read a Layer 2 semantic token at runtime.
 *
 * For anything that draws through a JS API rather than CSS — Leaflet
 * `pathOptions`, canvas, chart libraries — which cannot accept `var(--token)`
 * under every renderer (Leaflet's canvas backend assigns straight to
 * `ctx.strokeStyle`). DESIGN.md Appendix B.
 *
 * Client-side only: call it during render or an effect of a `'use client'`
 * component, never at module scope, where `document` does not exist on the
 * server. Server-rendered SVG should use `var(--color-…)` or a `stroke-*` /
 * `fill-*` utility instead.
 *
 * Once the theme toggle lands (DESIGN.md §15 Phase 3) callers also need to
 * re-read on the `treva:themechange` event; nothing can change the theme yet.
 */
export const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
