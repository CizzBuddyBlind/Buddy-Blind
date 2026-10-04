import Link from "next/link";

export function HelpMark({ section, className = "" }) {
  return (
    <Link
      href={`/about?tab=how#help-${section}`}
      data-keep
      aria-label="Help"
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember text-sm font-semibold text-[#1a1408] ${className}`}
    >
      ?
    </Link>
  );
}
