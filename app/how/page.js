"use client";

import { Copy, Editable } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function HowPage() {
  const { content, update } = useBB();
  const copy = content.copy.how;
  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <div className="grid grid-cols-2 items-start gap-4 md:gap-12">
        <section>
          <Editable className="bb-kicker text-mute" value={copy.kicker} onChange={(kicker) => update((d) => { d.copy.how.kicker = kicker; })} />
          <h1 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">
            <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.how.title = title; })} />{" "}
            <Editable className="italic text-ember" value={copy.accent} onChange={(accent) => update((d) => { d.copy.how.accent = accent; })} />
          </h1>
          <Editable as="p" className="mt-3 text-sm leading-relaxed text-mute" value={copy.sub} onChange={(sub) => update((d) => { d.copy.how.sub = sub; })} />
          <ol className="mt-6 space-y-3">
            {(copy.steps || []).map((step, index) => (
              <li key={step.n} className="border-t border-white/10 pt-3">
                <div className="text-[10px] tracking-[0.16em] text-ember">{step.n}</div>
                <h2 className="mt-1 font-serif text-lg md:text-2xl">
                  <Editable value={step.title} onChange={(title) => update((d) => { d.copy.how.steps[index].title = title; })} />
                </h2>
                <Editable as="p" className="mt-1 text-sm leading-relaxed text-mute" value={step.body} onChange={(body) => update((d) => { d.copy.how.steps[index].body = body; })} />
              </li>
            ))}
          </ol>
        </section>
        <section id="about">
          <p className="bb-kicker text-ember"><Copy k="about.kicker" /></p>
          <h2 className="mt-3 font-serif text-3xl leading-tight md:text-5xl"><Copy k="about.title" /></h2>
          <div className="mt-6 space-y-3">
            {["1", "2", "3", "4"].map((n) => (
              <div key={n} className="border-t border-white/10 pt-3">
                <h3 className="font-serif text-lg md:text-2xl"><Copy k={`about.${n}t`} /></h3>
                <Copy as="p" k={`about.${n}`} className="mt-1 text-sm leading-relaxed text-mute" />
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="mt-8 text-center text-xs text-mute">
        <Copy as="span" k="how.note" />
      </p>
    </main>
  );
}
