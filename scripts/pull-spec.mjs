// Refresh the vendored OpenAPI spec from the live API's /openapi/json.
// Usage: FARMFLOW_API_URL=http://localhost:3000 node scripts/pull-spec.mjs
import { writeFile } from 'node:fs/promises'

const origin = process.env.FARMFLOW_API_URL ?? 'http://localhost:3000'
const url = `${origin}/openapi/json`
const out = 'docs/api-version-3.0.3.json'

const res = await fetch(url)
if (!res.ok) {
  console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const spec = await res.json()
await writeFile(out, `${JSON.stringify(spec, null, 2)}\n`)
console.log(`Wrote ${out} from ${url}. Now run: npm run api:types`)
