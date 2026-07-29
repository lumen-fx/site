// The Candela flame mark, served from public/. Sized inline so it sits with the
// wordmark at any scale.
export function CandelaMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/candela-mark.svg"
      width={size}
      height={size}
      alt="Candela"
      className="candela-mark"
      decoding="async"
    />
  );
}
