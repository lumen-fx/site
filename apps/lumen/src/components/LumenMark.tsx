// The Lumen mark, inline so it can sit next to the wordmark at any size. This is
// a placeholder brand mark (a luminous aperture on the brand navy), not the
// final logo.
export function LumenMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Lumen"
      className="lumen-mark"
    >
      <rect width="64" height="64" rx="14" fill="#0f1d38" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#35d0d8" strokeWidth="3.2" opacity="0.5" />
      <circle cx="32" cy="32" r="10" fill="#35d0d8" />
      <circle cx="28.5" cy="28.5" r="3.4" fill="#a6f0f2" />
    </svg>
  );
}
