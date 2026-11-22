import type { Metadata } from 'next'
import { Montserrat, Open_Sans, Inter, Prompt } from 'next/font/google'
import './globals.css'

// Design font system (DESIGN-WebAPP-v1.md): Montserrat = headings, Open Sans =
// body, Inter = IDs/numeric (tabular figures), Prompt = Thai glyphs.
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
})

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FarmFlow',
  description: 'FarmFlow Carbon FinTech Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Light is pinned for now. DESIGN.md §5 wants light|dark|system resolved by
    // a blocking inline script before first paint; that (and the toggle) is
    // Phase 3. CSS only ever reads data-theme, so switching later is additive.
    <html
      lang="th"
      data-theme="light"
      className={`${montserrat.variable} ${openSans.variable} ${inter.variable} ${prompt.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
