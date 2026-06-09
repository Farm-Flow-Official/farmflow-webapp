type Props = {
  /** Rendered square size in px. */
  size?: number
  className?: string
}

/**
 * FarmFlow brand mark (green geometric line-art + red accents). It has white
 * interior cells, so it must sit on a white / very-light surface — never on a
 * tinted or dark background. Pair it with the "FarmFlow" wordmark text.
 */
export function Logo({ size = 28, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/FarmFlow-OriginalNewLogo.svg"
      alt="FarmFlow"
      width={size}
      height={size}
      className={className}
    />
  )
}
