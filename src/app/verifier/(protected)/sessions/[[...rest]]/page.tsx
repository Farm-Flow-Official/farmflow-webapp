import { redirect } from 'next/navigation'
import { fetchSessionById } from '@/features/verifier/services/fetchSessionById'
import { projectSegment } from '@/features/verifier/lib/routes'

/**
 * Compatibility redirect for the pre-project URLs.
 *
 * The review queue moved under `/verifier/projects/<id>/sessions` so every screen
 * can name the project being reviewed. Verifiers bookmark individual sessions
 * mid-review, so the old links keep working for one release rather than 404ing.
 * Remove once those bookmarks have aged out.
 */
export default async function LegacySessionRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>
}) {
  const { rest = [] } = await params
  const [sessionId, ...tail] = rest

  // /verifier/sessions → the project picker, since there is no longer one queue.
  if (!sessionId) redirect('/verifier')

  const session = await fetchSessionById(sessionId)
  // Unknown or out-of-scope session: send them to the picker rather than a dead end.
  if (!session) redirect('/verifier')

  const suffix = tail.length > 0 ? `/${tail.join('/')}` : ''
  redirect(`/verifier/projects/${projectSegment(session.projectId)}/sessions/${sessionId}${suffix}`)
}
