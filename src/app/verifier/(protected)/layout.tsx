import { redirect } from 'next/navigation'
import { getVerifierSession } from '@/features/verifier/auth/session'
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

  return <VerifierShell verifier={verifier}>{children}</VerifierShell>
}
