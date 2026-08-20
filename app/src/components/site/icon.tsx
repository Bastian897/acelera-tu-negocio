/** The generated icon set was drawn in the old steel/chrome palette. Rather
 * than regenerating it, recolor it on the fly: use the PNG's alpha shape as a
 * CSS mask and fill with any brand color, so every icon matches exactly. */
export function BrandIcon({
  src,
  color = "var(--brand-primary)",
  size = 32,
  className = "",
}: {
  src: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={"inline-block shrink-0 " + className}
      style={{
        backgroundColor: color,
        height: size,
        width: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
