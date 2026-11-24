import type { Metadata } from 'next'
import { Montserrat, Open_Sans, Inter, Prompt, IBM_Plex_Sans_Thai } from 'next/font/google'
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

// TDG brand only (DESIGN-TDG-Flavor.md §5): the Thai half of the stack
// truedigital.com uses, carrying Latin as well since Satoshi is not on Google
// Fonts and its commercial licence is still unconfirmed.
//
// `preload: false` on purpose. Every brand ships in one build, so this font is
// present even in the Treva build — without the preload tag the browser only
// fetches it if a rule actually references it, which happens solely under
// data-brand="tdg". The cost is a short swap on the TDG build's first paint;
// the alternative taxes every other build with a preload it never uses.
const plexThai = IBM_Plex_Sans_Thai({
  variable: '--font-plex-thai',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
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
    // data-brand picks the palette (src/styles/brands.css): unset = Treva CI,
    // "classic" = FarmFlow v1, "tdg" = the True Digital flavor. Read at BUILD
    // time, not per request: reading a cookie here would make every route in
    // the app dynamic and cost all 29 static pages. Two Vercel projects point
    // at this one branch and differ only by NEXT_PUBLIC_BRAND.
    // When the variable is unset the attribute is omitted entirely, which is
    // the Treva default.
    <html
      lang="th"
      data-theme="light"
      data-brand={process.env.NEXT_PUBLIC_BRAND}
      className={`${montserrat.variable} ${openSans.variable} ${inter.variable} ${prompt.variable} ${plexThai.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
