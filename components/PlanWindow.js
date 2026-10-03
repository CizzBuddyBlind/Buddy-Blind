"use client";

import { useEffect, useState } from "react";
import { useBB } from "@/components/Providers";
import { PremiumCycle } from "@/components/PremiumCycle";
import { annualDiscount, yearlyQuote } from "@/lib/market";

const CHOICES = [
  { id: "lite", name: "Lite", note: "A month. Cancel any time." },
  { id: "premium", name: "Premium", note: "90 days free, then a month." },
];

function line(kind, market, cycle, discount) {
  if (kind === "premium" && cycle === "year") {
    const quote = yearlyQuote(market.premium, discount);
    return `I understand the first 90 days are free. Then Premium is ${quote.yearly} a year unless I cancel first.`;
  }
  if (kind === "premium") return `I understand the first 90 days are free. Then Premium is ${market.premium} a month unless I cancel first.`;
  return `I understand Lite is ${market.lite} a month until I cancel.`;
}

async function confirmSession(sessionId) {
  try {
    const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
    return await res.json();
  } catch {
    return null;
  }
}

export function PlanWindow({ onClose }) {
  const bb = useBB();
  const market = bb.market || { id: "HK", lite: "HK$10", premium: "HK$50" };
  const [kind, setKind] = useState("");
  const [cycle, setCycle] = useState("month");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(null);

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
            bb.notify(data.kind === "premium" ? "You're Premium." : "You're on Lite.");
            onClose();
          });
        },
      });
      if (gone) {
        checkout.destroy();
        return;
      }
      checkout.mount("#bb-plan-pay");
    })().catch(() => {
      if (!gone) bb.notify("Card form did not open.");
    });
    return () => {
      gone = true;
      checkout?.destroy();
    };
  }, [sheet]);

  async function pay() {
    if (!kind || !checked || busy) return;
    if (!bb.session) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          cycle: kind === "premium" ? cycle : "month",
          market: market.id,
          email: bb.session.email || "",
          next: "/profile",
        }),
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
    } catch {
      bb.notify("Could not open payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/75 p-3 md:place-items-center md:p-6" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-md overflow-auto rounded-[28px] bg-[#141414] p-5 text-fg shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-serif text-3xl">Unlock</p>
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={onClose}>Close</button>
        </div>
        <p className="mt-2 text-sm text-white/55">Comments and stars. Lite or Premium.</p>

        {!sheet && (
          <div className="mt-5 grid gap-3">
            {CHOICES.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => { setKind(card.id); setCycle("month"); setChecked(false); }}
                className={`rounded-2xl px-4 py-4 text-left ${kind === card.id ? "bg-white text-ink" : "bg-[#1c1c1c] text-white"}`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-2xl">{card.name}</span>
                  <span data-bb-live className="text-sm">{card.id === "lite" ? market.lite : market.premium}</span>
                </span>
                <span className={`mt-1 block text-xs ${kind === card.id ? "text-ink/50" : "text-white/45"}`}>{card.note}</span>
              </button>
            ))}
          </div>
        )}

        {kind === "premium" && !sheet && (
          <div className="mt-5">
            <PremiumCycle lang={bb.lang} market={market} discount={annualDiscount(bb.content?.billing?.annualDiscount)} value={cycle} onChange={(next) => { setCycle(next); setChecked(false); }} />
          </div>
        )}

        {kind && !sheet && (
          <div className="mt-5">
            <label className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
              <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span>{line(kind, market, cycle, annualDiscount(bb.content?.billing?.annualDiscount))}</span>
            </label>
            <button type="button" disabled={!checked || busy} onClick={pay} className="mt-4 w-full rounded-full bg-ember py-3 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? "One moment" : "Pay"}
            </button>
          </div>
        )}

        {sheet && <div id="bb-plan-pay" className="mt-5 min-h-[420px] overflow-hidden rounded-2xl bg-white" />}
      </div>
    </div>
  );
}
