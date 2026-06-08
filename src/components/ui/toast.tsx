'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

/**
 * Minimal single-message toast state. Call `showToast(msg)` to display; it
 * auto-dismisses after `duration` ms. Render `<Toast message={message} />`.
 */
export function useToast(duration = 3500) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), duration)
    return () => clearTimeout(t)
  }, [message, duration])

  return {
    message,
    showToast: (msg: string) => setMessage(msg),
    clearToast: () => setMessage(null),
  }
}

/** Transient success notice, bottom-centre. Renders nothing when message is null. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-line bg-panel px-4 py-3 text-sm font-medium text-ink shadow-xl"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
      {message}
    </div>
  )
}
