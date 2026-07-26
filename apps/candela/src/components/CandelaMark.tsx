// The Candela flame mark, inline so it inherits currentColor where useful. This
// is a placeholder brand mark (a flame on the brand navy), not the final logo.
export function CandelaMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Candela"
      className="candela-mark"
    >
      <rect width="64" height="64" rx="14" fill="#22135B" />
      <path
        d="M32 8 Q30 20 26 26 Q19 34 21.5 42.5 Q24 53 32 55 Q40 53 42.5 42.5 Q45 33 38 25 Q34 20.5 34 14 Q32.5 18.5 32 8 Z"
        fill="#F16529"
      />
      <path
        d="M33 27 Q29 32 30 38 Q31 45 34 46.5 Q39 44.5 39 38 Q39 31.5 35.5 28 Q34 31 33 27 Z"
        fill="#FBBF6B"
      />
    </svg>
  );
}
