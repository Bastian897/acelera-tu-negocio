/** "Kicker + section rule" (Brand assets, client design system): a small
 * cyan label with a short accent rule underneath it, sitting above a section
 * headline. Cyan is reserved for this one role site-wide so it never
 * competes with the brand-primary blue used on buttons/numbers/CTAs. */
export function SectionKicker({
  children,
  tone = "light",
}: {
  children: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
        {children}
      </p>
      <span
        aria-hidden="true"
        className={
          "mt-2 block h-[3px] w-10 rounded-full bg-[var(--brand-accent)] " +
          (tone === "dark" ? "opacity-90" : "opacity-70")
        }
      />
    </div>
  );
}
