import { redirect } from 'next/navigation'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchVerifierProjectsSafe } from '@/features/verifier/services/fetchVerifierProjects'
import { VerifierShell } from '@/features/verifier/components/VerifierShell'

export default async function ProtectedVerifierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const verifier = await getVerifierSession()
  if (!verifier) {
    redirect('/verifier/login')
  }

  // The chrome names the project being reviewed on every screen. Resolving the
  // id → name map here keeps that a server read instead of drilling the name
  // through every page under the dynamic segment.
  //
  // Tolerant on purpose: a layout that throws takes down every route beneath it,
  // and `error.tsx` in this segment cannot catch its own layout. Losing the
  // names costs a label; losing the portal costs the review.
  const projects = await fetchVerifierProjectsSafe()

  return (
    <VerifierShell verifier={verifier} projects={projects}>
      {children}
    </VerifierShell>
  )
}
