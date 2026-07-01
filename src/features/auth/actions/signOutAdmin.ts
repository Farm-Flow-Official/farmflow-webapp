'use server'

import { redirect } from 'next/navigation'
import { signOutAdminSession } from '@/features/auth/services/adminSession'

export async function signOutAdmin(): Promise<void> {
  await signOutAdminSession()
  redirect('/admin/login')
}
