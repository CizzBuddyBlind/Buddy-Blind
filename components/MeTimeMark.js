export function MeTimeMark({ className = "h-9 w-9", on = false }) {
  if (on) {
    return <img src="/me-time-on.png" alt="" className={`${className} object-contain`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/me-time-ink.png)",
        maskImage: "url(/me-time-ink.png)",
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
