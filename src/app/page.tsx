import { redirect } from 'next/navigation'

// No public landing page yet — send the root to the admin login. Subdomain
// routing (dashboard.* / verifier.*) will later be handled in proxy.ts.
export default function RootPage() {
  redirect('/admin/login')
}
