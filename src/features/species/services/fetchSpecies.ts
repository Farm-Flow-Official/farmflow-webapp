import { api, unwrap } from '@/lib/api'
import type { SpeciesLookups, SpeciesRow } from '@/features/species/types'

/** Every species with the usage counts the editor turns into a warning. */
export async function fetchSpecies(): Promise<SpeciesRow[]> {
  return unwrap(api.GET('/api/v1/admin/species/'))
}

/**
 * Pickers for the editor — equation groups, forest categories, and the families
 * the carbon engine implements.
 *
 * The family list comes from the engine itself, never a list typed out here: a
 * species saved with an unimplemented formula produces an error instead of
 * carbon for every tree recorded against it, and nobody would find out until
 * after the field work.
 */
export async function fetchSpeciesLookups(): Promise<SpeciesLookups> {
  return unwrap(api.GET('/api/v1/admin/species/lookups'))
}
