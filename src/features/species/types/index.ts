import type { Ok } from '@/lib/api/types'

/**
 * Species shapes, derived from the generated OpenAPI schema so the UI cannot
 * drift from the API.
 *
 * Declared here rather than beside the fetchers: `SpeciesManager` is a client
 * component and needs these, but the fetchers import the server-only API
 * client. `@/lib/api/types` is types-all-the-way-down, so it is safe to follow.
 */
export type SpeciesRow = Ok<'/api/v1/admin/species/', 'get'>[number]
export type SpeciesLookups = Ok<'/api/v1/admin/species/lookups', 'get'>
export type EquationFamily = SpeciesLookups['families'][number]
export type SpeciesUsage = SpeciesRow['usage']

/** What the create/edit form produces; the API derives the rest from the family. */
export type SpeciesInput = {
  speciesCode: string
  speciesNameTh: string
  speciesNameEn?: string | null
  equationFormula: string
  equationGroupId?: string | null
  forestCategoryId?: string | null
  rValue?: number | null
  cfValue?: number | null
  tverReference?: string | null
  equationStatus?: 'approved' | 'provisional'
}

/**
 * Fields whose change moves future carbon figures.
 *
 * Editing one of these on a species that is already in use is what the typed
 * confirmation guards. Renaming is not: making someone type a project name to
 * fix a spelling is how a confirmation stops being read.
 */
export const CALCULATION_FIELDS = ['equationFormula', 'rValue', 'cfValue'] as const

/** True when a patch touches anything that changes how carbon is computed. */
export function touchesCalculation(before: SpeciesRow, patch: SpeciesInput): boolean {
  return (
    patch.equationFormula !== before.equationFormula ||
    nudged(patch.rValue, before.rValue) ||
    nudged(patch.cfValue, before.cfValue)
  )
}

function nudged(next: number | null | undefined, before: number | null): boolean {
  return (next ?? null) !== before
}

/** Whether anything at all is standing on this species. */
export function isInUse(usage: SpeciesUsage): boolean {
  return usage.farms > 0 || usage.projects > 0 || usage.calculatedTrees > 0
}
