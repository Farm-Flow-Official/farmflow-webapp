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
 * One project's identity for the portal chrome. Reads from the same queue-derived
 * list, so a project the verifier may not review simply is not found.
 */
export async function findVerifierProject(projectId: string): Promise<VerifierProject | null> {
  const projects = await fetchVerifierProjects()
  return projects.find((p) => p.id === projectId) ?? null
}
