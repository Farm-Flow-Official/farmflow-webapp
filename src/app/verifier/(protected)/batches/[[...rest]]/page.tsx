import { redirect } from 'next/navigation'
import { fetchBatchById } from '@/features/verifier/services/fetchBatchById'
import { projectSegment } from '@/features/verifier/lib/routes'

/**
 * Compatibility redirect for the pre-project URLs.
 *
 * The review queue moved under `/verifier/projects/<id>/batches` so every screen
 * can name the project being reviewed. Verifiers bookmark individual batches
 * mid-review, so the old links keep working for one release rather than 404ing.
 * Remove once those bookmarks have aged out.
 */
export default async function LegacyBatchRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>
}) {
  const { rest = [] } = await params
  const [batchId, ...tail] = rest

  // /verifier/batches → the project picker, since there is no longer one queue.
  if (!batchId) redirect('/verifier')

  const batch = await fetchBatchById(batchId)
  // Unknown or out-of-scope batch: send them to the picker rather than a dead end.
  if (!batch) redirect('/verifier')

  const suffix = tail.length > 0 ? `/${tail.join('/')}` : ''
  redirect(`/verifier/projects/${projectSegment(batch.projectId)}/batches/${batchId}${suffix}`)
}
