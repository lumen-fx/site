// The Lumen mark: a point of light, a glowing aperture. Inline so it can sit
// next to the wordmark at any size. Placeholder brand mark, not the final logo.
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
      <defs>
        <radialGradient id="lumen-core" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffd884" />
          <stop offset="46%" stopColor="#ffb43d" />
          <stop offset="100%" stopColor="#d97a12" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#ffb43d" strokeWidth="2.4" opacity="0.35" />
      <circle cx="32" cy="32" r="12" fill="url(#lumen-core)" />
      <circle cx="27.5" cy="27.5" r="3.2" fill="#fff2d6" opacity="0.9" />
    </svg>
  );
}
