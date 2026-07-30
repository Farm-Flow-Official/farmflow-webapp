'use client'

import { useId, useRef, useState } from 'react'
import { UploadCloud, FileText, ImageIcon, Trash2, Loader2, Map, ExternalLink } from 'lucide-react'

/**
 * Upload control for the PDD's attachment slots.
 *
 * This is the app's first file input — every other image in the portal arrives
 * from the mobile app. Uploads go straight to the server rather than being held
 * in form state: the files are evidence, and a draft that "has" a land deed only
 * in the browser would be a lie the wizard tells its user.
 */

export type UploadedFile = {
  id: string
  displayName: string | null
  mimeType: string
  sizeBytes: number
}

type Props = {
  label: string
  /** Slot description — what the official form asks for here. */
  hint?: string
  required?: boolean
  /** `accept` attribute; also what the picker filters by. */
  accept: string
  /** Existing files in this slot. */
  files: UploadedFile[]
  /** Resolves once the server has stored the file. Rejections surface inline. */
  onUpload: (file: File) => Promise<{ ok: boolean; error?: string }>
  onRemove: (fileId: string) => Promise<{ ok: boolean; error?: string }>
  /** One file only — a replacement supersedes the previous (e.g. the boundary). */
  single?: boolean
  disabled?: boolean
}

function iconFor(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.includes('google-earth') || mimeType.includes('kml')) return Map
  return FileText
}

/**
 * Where the browser can fetch a stored file's bytes.
 *
 * A same-origin proxy, not the API directly: these are private files and the
 * session cookie is httpOnly and scoped to this origin.
 */
const contentUrl = (fileId: string) => `/admin/files/${fileId}`

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function FileField({
  label,
  hint,
  required,
  accept,
  files,
  onUpload,
  onRemove,
  single = false,
  disabled = false,
}: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const atCapacity = single && files.length > 0
  const canDrop = !disabled && !busy

  async function handleFiles(list: FileList | null) {
    const picked = list?.[0]
    if (!picked) return

    setError(null)
    setBusy(true)
    const res = await onUpload(picked)
    setBusy(false)

    if (!res.ok) setError(res.error ?? 'อัปโหลดไม่สำเร็จ')
    // Clear the native input so re-picking the same file still fires a change.
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove(fileId: string) {
    setError(null)
    setBusy(true)
    const res = await onRemove(fileId)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'ลบไฟล์ไม่สำเร็จ')
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </p>

      {files.length > 0 && (
        <ul className="mb-2 flex flex-col gap-2">
          {files.map((f) => {
            const Icon = iconFor(f.mimeType)
            return (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2"
              >
                {/* A preview, not just a filename: the point of looking at an
                    attachment is to catch the wrong page of the wrong document,
                    which a name and a byte count cannot tell you. */}
                {f.mimeType.startsWith('image/') ? (
                  <a
                    href={contentUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`เปิดดู ${f.displayName ?? 'ไฟล์แนบ'} ขนาดเต็ม`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contentUrl(f.id)}
                      alt=""
                      className="h-12 w-12 rounded border border-line object-cover"
                    />
                  </a>
                ) : (
                  <Icon className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {f.displayName ?? 'ไฟล์แนบ'}
                  </span>
                  <span className="block text-xs text-ink-muted">{formatBytes(f.sizeBytes)}</span>
                  <a
                    href={contentUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                    เปิดดูไฟล์
                  </a>
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(f.id)}
                    disabled={busy}
                    aria-label={`ลบ ${f.displayName ?? 'ไฟล์แนบ'}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!atCapacity && !disabled && (
        <div
          onDragOver={(e) => {
            if (!canDrop) return
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (!canDrop) return
            e.preventDefault()
            setDragging(false)
            void handleFiles(e.dataTransfer.files)
          }}
          className={`rounded-lg border border-dashed transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-line bg-surface'
          }`}
        >
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center gap-1.5 px-4 py-6 text-center focus-within:outline-none"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
            ) : (
              <UploadCloud className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            )}
            <span className="text-sm text-ink-secondary">
              {busy ? 'กำลังอัปโหลด…' : 'ลากไฟล์มาวาง หรือกดเพื่อเลือก'}
            </span>
            {hint && <span className="text-xs text-ink-muted">{hint}</span>}
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={accept}
              disabled={busy}
              onChange={(e) => void handleFiles(e.target.files)}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {atCapacity && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          เปลี่ยนไฟล์
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => void handleFiles(e.target.files)}
            className="sr-only"
          />
        </button>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
