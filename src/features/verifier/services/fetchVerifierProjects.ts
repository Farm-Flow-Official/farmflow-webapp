import { api, unwrap } from '@/lib/api'
import type { Ok } from '@/lib/api/types'

export type VerifierProject = Ok<'/api/v1/verifier/projects', 'get'>[number]

/**
 * The projects this verifier may review, busiest first. Includes the
 * `"unassigned"` bucket for farms that joined no project — those predate
 * projects entirely and still need reviewing.
 */
export async function fetchVerifierProjects(): Promise<VerifierProject[]> {
  const projects = await unwrap(api.GET('/api/v1/verifier/projects'))
  return [...projects].sort((a, b) => b.pendingCount - a.pendingCount)
}

/**
 * The same list, but never throwing — for the chrome.
 *
 * The protected layout used the strict version, which made the project list a
 * hard dependency of every verifier screen: against an API that lacks the
 * endpoint (one deployed behind the webapp), the whole portal went down,
 * including the session and tree pages that predate projects entirely. The names
 * are a label. A label must not be able to take the portal offline.
 */
export async function fetchVerifierProjectsSafe(): Promise<VerifierProject[]> {
  try {
    return await fetchVerifierProjects()
  } catch (err) {
    console.error('[verifier chrome] project list unavailable:', err)
    return []
  }
}

/**
 * One project's identity for the portal chrome. Reads from the same queue-derived
 * list, so a project the verifier may not review simply is not found.
 */
export async function findVerifierProject(projectId: string): Promise<VerifierProject | null> {
  const projects = await fetchVerifierProjects()
  return projects.find((p) => p.id === projectId) ?? null
}
