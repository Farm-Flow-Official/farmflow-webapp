'use client'

import { useRef, useState, useTransition } from 'react'
import { ImagePlus, Trash2, Loader2 } from 'lucide-react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { COVER_LIMITS_TEXT, projectCoverUrl, projectPattern } from '@/lib/project-cover'
import {
  removeProjectCover,
  uploadProjectCover,
} from '@/features/projects/actions/coverActions'

const ACCEPT = 'image/jpeg,image/png,image/webp'

/**
 * The project's picture, and the controls to change it.
 *
 * Decoration with a job: the screens that list projects were text-only, so
 * telling one from another meant reading a code. Nothing here is evidence —
 * this picture is not part of the PDD and carries no caption or provenance.
 *
 * With no picture the banner draws the project's code-derived pattern rather
 * than an empty box, so a project that nobody has photographed still looks
 * finished.
 */
export function ProjectCoverPanel({
  projectId,
  projectCode,
  projectName,
  coverPhotoFileId,
  canWrite,
}: {
  projectId: string
  projectCode: string
  projectName: string
  coverPhotoFileId: string | null
  canWrite: boolean
}) {
  const [fileId, setFileId] = useState(coverPhotoFileId)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const url = projectCoverUrl(fileId)

  function pick(file: File | undefined) {
    if (!file) return
    setError(null)
    const form = new FormData()
    form.append('file', file)

    startTransition(async () => {
      const result = await uploadProjectCover(projectId, form)
      if (result.ok) setFileId(result.fileId)
      else setError(result.error)
      // Let the same file be chosen again after a failure.
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  function clear() {
    setError(null)
    startTransition(async () => {
      const result = await removeProjectCover(projectId)
      if (result.ok) setFileId(null)
      else setError(result.error)
    })
  }

  return (
    <section className="flex flex-col gap-2">
      <div
        className="relative h-40 overflow-hidden rounded-2xl border border-line sm:h-48"
        style={url ? undefined : projectPattern(projectCode)}
      >
        {url ? (
          <ImageWithSkeleton
            src={url}
            alt={`ภาพหน้าปกของ ${projectName}`}
            className="h-full w-full object-cover transition-opacity"
          />
        ) : (
          <span className="sr-only">โครงการนี้ยังไม่มีภาพหน้าปก</span>
        )}

        {canWrite && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel/90 px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.9} />
              )}
              {fileId ? 'เปลี่ยนรูป' : 'เพิ่มรูป'}
            </button>

            {fileId && (
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                aria-label="ลบภาพหน้าปก"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel/90 text-ink-secondary shadow-sm backdrop-blur transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
              </button>
            )}
          </div>
        )}
      </div>

      {canWrite && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <p className="text-[12px] leading-relaxed text-ink-muted">
            แนะนำ 1600×900 · {COVER_LIMITS_TEXT} · ใช้ภาพภูมิทัศน์หรือพื้นที่โครงการ
            ไม่ใช้ภาพที่มีใบหน้าบุคคล
          </p>
        </>
      )}

      {error && <p className="text-[12px] text-error">{error}</p>}
    </section>
  )
}
