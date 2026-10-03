export function MeTimeMark({ className = "h-9 w-9", on = false }) {
  const ink = on ? "#1a1408" : "currentColor";
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {on ? (
        <circle cx="50" cy="50" r="50" fill="#F5D20A" />
      ) : (
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      )}
      <path
        fill={ink}
        d="M27 20c3.2-.4 6.4 1.2 7.6 4.2.6 1.6 2.2 1.2 2.6 3.2.4 2.4-.6 3.6.8 5.2-1.8 2.2-4.6 1.4-6.8 2.4-2.8 1-5.8-.2-7.4-2.6-1.8-2.6-1.2-6 .2-8.4 1.2-2 2.2-3.6 3-4z"
      />
      <path d="M31.2 24.5v7.5M34.2 23.8v8.2M37.1 25v6.4" stroke={on ? "#F5D20A" : "transparent"} strokeWidth="1.15" strokeLinecap="round" />
      <path
        fill={ink}
        d="M63 19.5c3.4-.2 6.6 2 7.4 5.2.8 3.2-.6 6.2-3.4 7.4-3.2 1.4-6.8.2-8.2-2.8-1.4-3 .2-7 4.2-9.8z"
      />
      <path
        d="M16 45h16M23 45c-1 10 1 22 12 30 12 9 28 8 40-6 6-7 10-16 11-22"
        fill="none"
        stroke={ink}
        strokeWidth="5.2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path d="M74 38h18M84 34v16" fill="none" stroke={ink} strokeWidth="5.2" strokeLinecap="square" />
      {on && (
        <path
          fill="#E23B32"
          d="M66 66c3 1 5 5 8 8 4 4 9 7 14 5 4-1 6-5 4-8-2-3-6-4-9-6-2-1-5-4-8-4-4 0-7 2-9 5z"
        />
      )}
    </svg>
  );
}
