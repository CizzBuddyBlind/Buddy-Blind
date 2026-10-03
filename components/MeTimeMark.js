export function MeTimeMark({ className = "h-9 w-9", on = false }) {
  const ink = on ? "#1a1408" : "currentColor";
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {on ? (
        <circle cx="50" cy="50" r="50" fill="#F5C400" />
      ) : (
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      )}
      <circle cx="38" cy="38" r="4.2" fill={ink} />
      <circle cx="62" cy="38" r="3.8" fill={ink} />
      <path
        d="M22 49h14M32 49c-2 16 6 28 18 28 13 0 22-12 22-28M66 49h14"
        fill="none"
        stroke={ink}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {on && <ellipse cx="71" cy="73" rx="6" ry="4.6" fill="#F04B3A" transform="rotate(-24 71 73)" />}
    </svg>
  );
}
