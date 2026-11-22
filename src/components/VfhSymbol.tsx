/** The VFH brand symbol: three connected nodes. Colours follow the page theme. */
export function VfhSymbol({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={className}>
      <path
        d="M9 14 C15 14 14 6 19 6 M9 14 C15 14 14 22 19 22"
        className="stroke-cable"
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={5} cy={14} r={4} className="fill-ink" />
      <circle cx={23} cy={6} r={4} className="fill-accent" />
      <circle cx={23} cy={22} r={4} className="fill-signal" />
    </svg>
  );
}
