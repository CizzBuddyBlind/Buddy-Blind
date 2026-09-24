"use client";

import { useEffect, useState } from "react";
import { useBB } from "@/components/Providers";

const CARDS = [
  {
    id: "free",
    name: "Free",
    cadence: "Try once",
    price: "HK$0",
    perks: ["1 blind box / month", "Venues only", "No private creation"],
  },
  {
    id: "lite",
    name: "Lite",
    cadence: "Per month",
    price: "HK$10",
    perks: ["5 blind boxes / month", "Join private events", "Create quick meet"],
  },
  {
    id: "premium",
    name: "Premium",
    cadence: "Per month · 90 days trial",
    price: "HK$50",
    perks: [
      "Unlimited blind boxes",
      "Create private up to 20",
      "Industry / wine / 50+ social / hike",
      "Host badge gold",
      "HK$5 admin fee per event",
    ],
  },
];

export default function SubscribePage() {
  const bb = useBB();
  const [busy, setBusy] = useState("");
  const plan = bb.plan || "free";

  useEffect(() => {
    if (!bb.ready) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("pay") === "cancel") {
      bb.notify("Checkout closed. Nothing was charged.");
      window.history.replaceState({}, "", "/subscribe");
    }
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    let stop = false;
    (async () => {
      try {
        const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (stop) return;
        if (data.ok && (data.kind === "lite" || data.kind === "premium")) {
          bb.setPlan(data.kind);
          bb.notify(data.kind === "premium" ? "You're Premium. 90 days on us, then HK$50 a month." : "You're on Lite. HK$10 a month.");
        } else {
          bb.notify(data.reason || "Payment did not finish.");
        }
      } catch {
        if (!stop) bb.notify("Payment did not finish.");
      } finally {
        if (!stop) window.history.replaceState({}, "", "/subscribe");
      }
    })();
    return () => {
      stop = true;
    };
  }, [bb.ready]);

  async function pay(kind) {
    if (kind === plan) return;
    if (!bb.session) {
      try { sessionStorage.setItem("bb_next", "/subscribe"); } catch { /* ignore */ }
      window.location.href = "/login";
      return;
    }
    setBusy(kind);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, email: bb.session.email || "" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      bb.notify(data.reason || "Card checkout is not ready.");
    } catch {
      bb.notify("Card checkout is not ready.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="bb-frame mx-auto pb-28 pt-8 md:pb-20 md:pt-12">
      <p className="bb-kicker text-ember">Premium · More heart, more reasons</p>
      <h1 className="mt-4 max-w-4xl font-serif text-[2.7rem] leading-[1.02] tracking-tight md:text-7xl">
        Why Premium unlocks Private up to 20.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mute">
        Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies. Host creates attraction and download reasons — people join for the reason, stay for the people.
      </p>

      <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_1fr_1.08fr] lg:gap-0">
        {CARDS.map((card) => {
          const current = plan === card.id;
          const light = card.id === "premium";
          const label = current ? "Current" : card.id === "lite" ? "Upgrade to Lite" : card.id === "premium" ? "Go Premium" : "Free";
          return (
            <article
              key={card.id}
              className={`flex flex-col px-6 py-8 md:px-8 md:py-10 ${
                light
                  ? "rounded-[28px] bg-[#f6f3ee] text-ink lg:-ml-px lg:min-h-[540px]"
                  : `border border-white/12 bg-transparent ${card.id === "free" ? "lg:rounded-l-[28px] lg:border-r-0" : "lg:rounded-none"}`
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-4xl">{card.name}</h2>
                <p className={`max-w-[9rem] text-right text-[10px] font-semibold uppercase tracking-[0.16em] ${light ? "text-ink/55" : "text-mute"}`}>
                  {card.cadence}
                </p>
              </div>
              <p className="mt-8 font-serif text-6xl tracking-tight">{card.price}</p>
              <ul className={`mt-8 space-y-3 text-[12px] font-medium uppercase tracking-[0.12em] ${light ? "text-ink/80" : "text-mute"}`}>
                {card.perks.map((perk) => (
                  <li key={perk}>— {perk}</li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <button
                  type="button"
                  disabled={!!busy || current || card.id === "free"}
                  onClick={() => pay(card.id)}
                  className={`w-full rounded-full px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] disabled:opacity-70 ${
                    light ? "bg-ink text-[#f6f3ee]" : "bg-[#f6f3ee] text-ink"
                  }`}
                >
                  {busy === card.id ? "Opening checkout…" : label}
                </button>
                {light && (
                  <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-ink/45">
                    90 days trial · Cancel anytime · HK$5 admin fee per confirmed join
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
