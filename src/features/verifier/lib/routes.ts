/**
 * Verifier portal routes.
 *
 * Every review screen lives under a project so the portal can always name the
 * project on screen. Farms enrolled in no project share the `unassigned`
 * bucket — a real destination, not a missing value, which is why a null
 * `projectId` resolves to it rather than to a broken link.
 */
export const UNASSIGNED_PROJECT = 'unassigned'

/** Route segment for a batch's project; `null` means the unassigned bucket. */
export function projectSegment(projectId: string | null | undefined): string {
  return projectId ?? UNASSIGNED_PROJECT
}

export function projectHref(projectId: string | null | undefined): string {
  return `/verifier/projects/${projectSegment(projectId)}`
}

export function queueHref(projectId: string | null | undefined): string {
  return `${projectHref(projectId)}/batches`
}

export function batchHref(projectId: string | null | undefined, batchId: string): string {
  return `${queueHref(projectId)}/${batchId}`
}

export function treeHref(
  projectId: string | null | undefined,
  batchId: string,
  treeId: string,
): string {
  return `${batchHref(projectId, batchId)}/tree/${treeId}`
}
