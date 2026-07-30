'use client'

import { useCallback, useMemo } from 'react'
import { removeAttachment, uploadAttachment } from '@/features/pdd/actions/pddActions'
import type { AttachmentSlot, PddDetail } from '@/features/pdd/types'
import type { UploadedFile } from '@/features/pdd/components/fields/FileField'

/**
 * Wire one attachment slot to the API.
 *
 * Uploads go through a Server Action, which cannot take a `File` inside a plain
 * object — so the file is packed into `FormData` here rather than in each step.
 */
export function useAttachmentSlot(
  pdd: PddDetail,
  slot: AttachmentSlot,
  {
    onSaved,
    onError,
  }: { onSaved: (pdd: PddDetail) => void; onError: (message: string) => void },
) {
  const files: UploadedFile[] = useMemo(
    () =>
      pdd.attachments
        .filter((a) => a.slot === slot)
        .map((a) => ({
          id: a.id,
          displayName: a.displayName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
        })),
    [pdd.attachments, slot],
  )

  const upload = useCallback(
    async (file: File) => {
      const form = new FormData()
      form.append('slot', slot)
      form.append('file', file)

      const res = await uploadAttachment(pdd.id, form)
      if (res.ok) {
        onSaved(res.data)
        return { ok: true }
      }
      onError(res.error)
      return { ok: false, error: res.error }
    },
    [pdd.id, slot, onSaved, onError],
  )

  const remove = useCallback(
    async (attachmentId: string) => {
      const res = await removeAttachment(pdd.id, attachmentId)
      if (res.ok) {
        onSaved(res.data)
        return { ok: true }
      }
      onError(res.error)
      return { ok: false, error: res.error }
    },
    [pdd.id, onSaved, onError],
  )

  return { files, upload, remove }
}
