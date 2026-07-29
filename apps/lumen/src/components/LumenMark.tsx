// The Lumen logo, served from public/. Sized inline so it sits with the
// wordmark at any scale.
export function LumenMark({ size = 26 }: { size?: number }) {
  return (
    <img
      src="/lumen-logo.svg"
      width={size}
      height={size}
      alt="Lumen"
      className="lumen-mark"
      decoding="async"
    />
  );
}
