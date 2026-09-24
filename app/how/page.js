"use client";

import { Editable } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function HowPage() {
  const { content, update } = useBB();
  const copy = content.copy.how;
  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-ember">
        <Editable value={copy.kicker} onChange={(kicker) => update((d) => { d.copy.how.kicker = kicker; })} />
      </p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] md:text-6xl">
        <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.how.title = title; })} />
        {copy.accent ? " " : ""}
        <Editable className="italic" value={copy.accent} onChange={(accent) => update((d) => { d.copy.how.accent = accent; })} />
      </h1>
      <ol className="mt-10 overflow-hidden rounded-[1.6rem] border border-white/15">
        {(copy.steps || []).map((step, index) => (
          <li key={step.n || index} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 px-5 py-6 first:border-t-0 sm:px-8">
            <span className="pt-2 text-xs tracking-[0.14em] text-mute">{step.n}</span>
            <div>
              <h2 className="font-serif text-2xl md:text-[1.7rem]">
                <Editable value={step.title} onChange={(title) => update((d) => { d.copy.how.steps[index].title = title; })} />
              </h2>
              <Editable as="p" className="mt-2 max-w-xl text-sm leading-relaxed text-mute" value={step.body} onChange={(body) => update((d) => { d.copy.how.steps[index].body = body; })} />
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
