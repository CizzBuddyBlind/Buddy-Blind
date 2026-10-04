"use client";

import Link from "next/link";
import { useBB } from "@/components/Providers";
import { JoinedEvents } from "@/components/PhoneApp";
import { say } from "@/lib/say";

export default function MeTimePage() {
  const bb = useBB();
  return (
    <main className="bb-frame min-h-[calc(100dvh-4rem)] bg-ink pb-28 pt-10 text-fg md:pb-16">
      <p className="bb-kicker text-white/55">Me Time</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] text-white md:text-6xl">
        {say(bb.lang, "Today, and")}
        <br />
        <span className="italic text-ember">{say(bb.lang, "what’s next.")}</span>
      </h1>
      {!bb.ready ? <p className="bb-lead-gap text-white/45">Loading…</p> : null}
      {bb.ready && !bb.session ? (
        <div className="bb-lead-gap">
          <p className="text-white/55">Log in to see the seats you joined.</p>
          <Link href="/login" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">Log in</Link>
        </div>
      ) : null}
      {bb.session ? (
        <div className="bb-lead-gap max-w-xl">
          <JoinedEvents />
        </div>
      ) : null}
    </main>
  );
}
