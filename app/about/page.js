"use client";

import { Copy } from "@/components/Bits";

export default function AboutPage() {
  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-ember"><Copy k="about.kicker" /></p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] md:text-6xl"><Copy k="about.title" /></h1>
      <div className="mt-10 overflow-hidden rounded-[1.6rem] border border-white/15">
        {["1", "2", "3", "4"].map((n) => (
          <section key={n} className="border-t border-white/10 px-5 py-6 first:border-t-0 sm:px-8">
            <h2 className="font-serif text-2xl md:text-[1.7rem]"><Copy k={`about.${n}t`} /></h2>
            <Copy as="p" k={`about.${n}`} className="mt-2 max-w-xl text-sm leading-relaxed text-mute" />
          </section>
        ))}
      </div>
    </main>
  );
}
