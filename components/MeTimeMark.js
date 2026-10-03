export function MeTimeMark({ className = "h-9 w-9", on = false }) {
  return (
    <span className={`grid place-items-center ${className}`}>
      <span
        aria-hidden="true"
        className="block h-[48%] w-[48%]"
        style={{
          backgroundColor: on ? "#1a1408" : "currentColor",
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
    </span>
  );
}
