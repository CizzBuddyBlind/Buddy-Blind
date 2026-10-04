import Link from "next/link";

export function HelpMark({ section, className = "" }) {
  return (
    <Link
      href={`/about?tab=how#help-${section}`}
      data-keep
      aria-label="Help"
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-ink ring-1 ring-black/15 ${className}`}
    >
      ?
    </Link>
  );
}
