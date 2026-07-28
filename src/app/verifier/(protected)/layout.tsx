import { redirect } from 'next/navigation'
import { getVerifierSession } from '@/features/verifier/auth/session'
import { fetchVerifierProjects } from '@/features/verifier/services/fetchVerifierProjects'
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
  const projects = await fetchVerifierProjects()

  return (
    <VerifierShell verifier={verifier} projects={projects}>
      {children}
    </VerifierShell>
  )
}
