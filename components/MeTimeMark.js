export function MeTimeMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#F2C14E" />
      <path d="M16 27c2.2-3.4 7.2-3.2 8.6.4" fill="none" stroke="#1a1408" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="44" cy="26" r="3.1" fill="#1a1408" />
      <path d="M18 40.5c5.5 7 22.5 7.2 28.2-.2" fill="none" stroke="#1a1408" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M39 43.5c1.2 4.8 7.4 6.2 10.2 2.4 1.4-2-1.2-4.6-5.4-4.2-2.2.2-3.8.8-4.8 1.8z" fill="#E25B4A" />
    </svg>
  );
}
