"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";

export default function SubscribePage() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [busy, setBusy] = useState(false);
  const live = !!(bb.trial?.at && !bb.trial.cancelled);
  const ends = bb.trial?.at ? new Date(bb.trial.at + 90 * 86400000).toLocaleDateString("en-HK") : "";

  async function card() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "premium" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      bb.notify(data.reason || "Card checkout is not configured. The trial itself does not charge HK$50 today.");
    } catch {
      bb.notify("Card checkout is not configured.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bb-frame mx-auto max-w-xl pb-28 pt-10 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-mute">{t("btn.back")}</Link>
      <p className="bb-kicker mt-6 text-ember">{t("trial.kicker")}</p>
      <h1 className="mt-3 font-serif text-4xl">{t("trial.title")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">{t("trial.body")}</p>
      {live ? (
        <div className="mt-6 rounded-2xl border border-white/10 p-4 text-sm">
          <p>Trial accepted. Premium is open until {ends}, then HK$50/month unless you cancel.</p>
          <button type="button" className="mt-4 rounded-full border border-white/15 px-4 py-2" onClick={bb.cancelTrial}>Cancel trial</button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-mute">Accept the disclaimer on the first screen to start. Nothing is charged today.</p>
      )}
      <button type="button" disabled={busy} onClick={card} className="mt-4 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">
        Set up HK$50 card later
      </button>
      <p className="mt-3 text-xs text-mute">Stripe is used only if the server has a premium price. Otherwise this stays a recorded trial.</p>
    </main>
  );
}
