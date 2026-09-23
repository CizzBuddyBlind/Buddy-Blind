"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";

export default function SharePrivatePage() {
  const { id } = useParams();
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const event = bb.content.events.find((item) => item.id === id && item.kind === "private");
  if (!bb.ready) return <main className="bb-frame py-20 text-mute">Loading…</main>;
  if (!event) {
    return (
      <main className="bb-frame py-20">
        <Link href="/private" className="text-ember">Private events</Link>
      </main>
    );
  }
  return (
    <main className="bb-frame mx-auto max-w-lg pb-28 pt-10">
      <p className="bb-kicker text-ember">Private event</p>
      <h1 className="mt-3 font-serif text-4xl">{event.name}</h1>
      <ul className="mt-4 space-y-1 text-sm text-mute">
        <li>Host · {event.hostName || event.hostLabel}</li>
        <li>{event.location} · {event.dateISO} · {event.timeLabel}</li>
        <li>{event.forWhom}</li>
        <li>{event.spots} places · max {event.capacity || 20}</li>
        {event.ageRange && <li>{event.ageRange}</li>}
      </ul>
      <p className="mt-4 text-sm">{event.description}</p>
      <p className="mt-4 text-sm text-mute">{t("share.cta")}</p>
      <Link href={`/private/${event.id}`} className="mt-6 inline-block rounded-full bg-char px-5 py-3 text-sm font-semibold text-paper">{t("btn.join")}</Link>
    </main>
  );
}
