"use client";

import { useEffect, useRef, useState } from "react";
import { useBB } from "@/components/Providers";
import { PremiumCycle } from "@/components/PremiumCycle";
import { annualDiscount } from "@/lib/market";
import { say } from "@/lib/say";

const RANK = { free: 0, lite: 1, premium: 2 };

function planNote(kind, market) {
  if (kind === "premium") return `You're Premium. 90 days on us, then ${market.premium} a month.`;
  if (kind === "lite") return `You're on Lite. ${market.lite} a month.`;
  return "You're on Free. Billing has stopped.";
}

export default function SubscribePage() {
  const bb = useBB();
  const [busy, setBusy] = useState("");
  const [sheet, setSheet] = useState(null);
  const [ask, setAsk] = useState(null);
  const market = bb.market || { id: "HK", fee: "HK$5", free: "HK$0", lite: "HK$10", premium: "HK$50" };
  const plan = bb.plan || "free";
  const cards = [
    {
      id: "free",
      name: "Free",
      cadence: "Try once",
      price: market.free || "HK$0",
      perks: ["1 blind box / month", "Venues only", "No private creation"],
    },
    {
      id: "lite",
      name: "Lite",
      cadence: "Per month",
      price: market.lite,
      perks: ["5 blind boxes / month", "Join private events", "Create quick meet"],
    },
    {
      id: "premium",
      name: "Premium",
      cadence: "Per month · 90 days trial",
      price: market.premium,
      perks: [
        "Unlimited blind boxes",
        "Create private up to 20",
        "Industry / wine / 50+ social / hike",
        "Host badge gold",
        "HK$5 admin fee per event",
      ].map((line) => say(bb.lang, line)),
    },
  ];
  const trialOpened = useRef(false);

  useEffect(() => {
    if (!bb.ready) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    let stop = false;
    (async () => {
      const data = await confirmSession(sessionId);
      if (stop) return;
      if (data?.ok) {
        bb.setPlan(data.kind, { subscriptionId: data.subscriptionId, customerId: data.customerId });
        bb.notify(planNote(data.kind, market));
      }
      window.history.replaceState({}, "", "/subscribe");
    })();
    return () => {
      stop = true;
    };
  }, [bb.ready]);

  useEffect(() => {
    if (!sheet?.clientSecret || !sheet.publishableKey) return undefined;
    let checkout;
    let gone = false;
    (async () => {
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(sheet.publishableKey);
      if (!stripe || gone) return;
      checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret: sheet.clientSecret,
        onComplete: () => {
          confirmSession(sheet.sessionId).then((data) => {
            if (!data?.ok) {
              bb.notify(data?.reason || "Payment did not finish.");
              return;
            }
            bb.setPlan(data.kind, { subscriptionId: data.subscriptionId, customerId: data.customerId });
            bb.notify(planNote(data.kind, market));
            setSheet(null);
          });
        },
      });
      if (gone) {
        checkout.destroy();
        return;
      }
      checkout.mount("#bb-pay");
    })().catch(() => {
      if (!gone) bb.notify("Card form did not open.");
    });
    return () => {
      gone = true;
      checkout?.destroy();
    };
  }, [sheet]);

  useEffect(() => {
    if (trialOpened.current || !bb.ready || !bb.session || plan === "premium") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("trial") !== "1") return;
    trialOpened.current = true;
    window.history.replaceState({}, "", "/subscribe");
    void pay("premium");
  }, [bb.ready, bb.session, plan]);

  async function pay(kind) {
    if (kind === plan || busy) return;
    if (!bb.session) {
      try { sessionStorage.setItem("bb_next", "/subscribe"); } catch { /* ignore */ }
      window.location.href = "/login";
      return;
    }
    if (kind === "premium") {
      setAsk({ cycle: "month" });
      return;
    }
    await charge(kind, "month");
  }

  async function charge(kind, cycle) {
    setBusy(kind);
    try {
      const switching = RANK[kind] < RANK[plan] || bb.planMeta?.subscriptionId;
      if (switching) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "switch",
            kind,
            cycle,
            market: market.id,
            email: bb.session.email || "",
            subscriptionId: bb.planMeta?.subscriptionId || "",
          }),
        });
        const data = await res.json();
        if (data.ok && !data.needsCheckout) {
          bb.setPlan(data.kind, { subscriptionId: data.subscriptionId, customerId: data.customerId });
          bb.notify(planNote(data.kind, market));
          setAsk(null);
          return;
        }
        if (!data.ok) {
          bb.notify(data.reason || "Could not change the plan.");
          return;
        }
        if (kind === "free") {
          bb.setPlan("free");
          bb.notify(planNote("free", market));
          setAsk(null);
          return;
        }
      }
      await openCard(kind, cycle);
      setAsk(null);
    } catch {
      bb.notify("Could not change the plan.");
    } finally {
      setBusy("");
    }
  }

  async function openCard(kind, cycle = "month") {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, cycle, market: market.id, email: bb.session.email || "" }),
    });
    const data = await res.json();
    if (!data.clientSecret || !data.publishableKey) {
      bb.notify(data.reason || "Card form is not ready.");
      return;
    }
    setSheet({
      kind,
      clientSecret: data.clientSecret,
      sessionId: data.sessionId,
      publishableKey: data.publishableKey,
    });
  }

  return (
    <main className="bb-frame mx-auto flex min-h-[calc(100dvh-4rem)] flex-col pb-28 pt-10 md:pb-0">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <p className="bb-kicker text-white/55">Subscription</p>
        <h1 className="mt-5 font-serif text-4xl leading-[1.15] sm:text-5xl md:text-6xl">
          <span className="block text-ember">{say(bb.lang, "【真】O傾")}</span>
          <span className="mt-3 block text-white">{say(bb.lang, "由O開始")}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-mute">
          Wine, work, a hike. Or whatever you care about.
        </p>

        <div className="my-auto grid items-stretch gap-3 lg:grid-cols-3">
          <div className="grid h-full overflow-hidden rounded-[28px] bg-[#111] md:grid-cols-2 lg:col-span-2">
            {cards.filter((card) => card.id !== "premium").map((card) => (
              <PlanCard key={card.id} card={card} plan={plan} busy={busy} onPay={pay} split />
            ))}
          </div>
          <PlanCard card={cards[2]} plan={plan} busy={busy} onPay={pay} light fee={market.fee} />
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/75 p-3 md:place-items-center md:p-6">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-auto rounded-[28px] bg-[#141414] p-4 text-fg shadow-2xl md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-serif text-2xl">{sheet.kind === "premium" ? "Go Premium" : "Upgrade to Lite"}</p>
              <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={() => setSheet(null)}>
                Close
              </button>
            </div>
            <div id="bb-pay" className="min-h-[420px] overflow-hidden rounded-2xl bg-white" />
          </div>
        </div>
      )}
      {ask && !sheet && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/75 p-3 md:place-items-center md:p-6">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-auto rounded-[28px] bg-[#141414] p-4 text-fg shadow-2xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-serif text-2xl">Go Premium</p>
              <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={() => setAsk(null)}>Close</button>
            </div>
            <PremiumCycle lang={bb.lang} market={market} discount={annualDiscount(bb.content?.billing?.annualDiscount)} value={ask.cycle} onChange={(cycle) => setAsk({ cycle })} />
            <button type="button" disabled={!!busy} onClick={() => charge("premium", ask.cycle)} className="mt-5 w-full rounded-full bg-ember py-3 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? "One moment…" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PlanCard({ card, plan, busy, onPay, light, split, fee = "HK$5" }) {
  const current = plan === card.id;
  const up = RANK[card.id] > RANK[plan];
  const label = current
    ? "Current"
    : card.id === "free"
      ? "Move to Free"
      : up
        ? card.id === "lite" ? "Upgrade to Lite" : "Go Premium"
        : "Downgrade to Lite";
  return (
    <article className={`flex h-full flex-col px-6 py-8 md:px-7 md:py-9 ${light ? "rounded-[28px] bg-[#f6f3ee] text-ink" : "bg-transparent"} ${split && card.id === "free" ? "md:border-r md:border-white/10" : ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-4xl leading-none">{card.name}</h2>
        <p className={`max-w-[7.5rem] text-right text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] ${light ? "text-ink/45" : "text-white/40"}`}>
          {card.cadence}
        </p>
      </div>
      <p data-bb-live className="mt-8 text-5xl tracking-tight md:text-6xl">{card.price}</p>
      <ul className={`mt-8 space-y-3 text-[11px] font-medium uppercase leading-relaxed tracking-[0.08em] ${light ? "text-ink/70" : "text-white/55"}`}>
        {card.perks.map((perk) => (
          <li key={perk}>— {perk}</li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={!!busy || current}
          onClick={() => onPay(card.id)}
          className={`w-full rounded-full px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] disabled:opacity-70 ${
            light ? "bg-ink text-[#f6f3ee]" : "bg-[#f6f3ee] text-ink"
          }`}
        >
          {busy === card.id ? "One moment…" : label}
        </button>
        <p data-bb-live className={`mt-4 min-h-[2.4rem] text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.12em] ${light ? "text-ink/40" : "invisible"}`}>
          90 days trial · Cancel anytime · {fee} admin fee per confirmed join
        </p>
      </div>
    </article>
  );
}

async function confirmSession(sessionId) {
  try {
    const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
    return await res.json();
  } catch {
    return null;
  }
}
