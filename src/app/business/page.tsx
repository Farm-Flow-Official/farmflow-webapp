import { redirect } from 'next/navigation'

/** The Business Dashboard landing — send to the Overview. */
export default function BusinessIndexPage() {
  redirect('/business/overview')
}
