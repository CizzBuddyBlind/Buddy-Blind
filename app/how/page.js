"use client";

import { Copy, Editable } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function HowPage() {
  const { content, update } = useBB();
  const copy = content.copy.how;
  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <section className="mx-auto max-w-2xl text-center">
        <Editable className="bb-kicker text-mute" value={copy.kicker} onChange={(kicker) => update((d) => { d.copy.how.kicker = kicker; })} />
        <h1 className="bb-hero-title mt-4">
          <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.how.title = title; })} />{" "}
          <Editable className="italic text-ember" value={copy.accent} onChange={(accent) => update((d) => { d.copy.how.accent = accent; })} />
        </h1>
        <Editable as="p" className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mute" value={copy.sub} onChange={(sub) => update((d) => { d.copy.how.sub = sub; })} />
      </section>
      <ol className="mx-auto mt-10 max-w-2xl space-y-4">
        {(copy.steps || []).map((step, index) => (
          <li key={step.n} className="rounded-2xl border border-white/10 bg-card px-5 py-5">
            <div className="text-xs tracking-[0.16em] text-ember">{step.n}</div>
            <h2 className="mt-2 font-serif text-2xl">
              <Editable value={step.title} onChange={(title) => update((d) => { d.copy.how.steps[index].title = title; })} />
            </h2>
            <Editable as="p" className="mt-2 text-sm leading-relaxed text-mute" value={step.body} onChange={(body) => update((d) => { d.copy.how.steps[index].body = body; })} />
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-mute">
        <Copy as="span" k="how.note" />
      </p>
      <section id="about" className="mx-auto mt-16 max-w-2xl scroll-mt-24 border-t border-white/10 pt-12">
        <p className="bb-kicker text-ember"><Copy k="about.kicker" /></p>
        <h2 className="mt-3 font-serif text-4xl"><Copy k="about.title" /></h2>
        {["1", "2", "3", "4"].map((n) => (
          <div key={n} className="mt-8">
            <h3 className="font-serif text-2xl"><Copy k={`about.${n}t`} /></h3>
            <Copy as="p" k={`about.${n}`} className="mt-2 text-sm leading-relaxed text-mute" />
          </div>
        ))}
      </section>
    </main>
  );
}
