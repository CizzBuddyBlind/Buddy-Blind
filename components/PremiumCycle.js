"use client";

import { say } from "@/lib/say";
import { yearlyQuote } from "@/lib/market";

export function PremiumCycle({ lang, market, discount, value, onChange }) {
  const quote = yearlyQuote(market?.premium || "HK$50", discount);
  const saveLine = say(lang, "SAVE {n}% WITH AN ANNUAL PAYMENT").replaceAll("{n}", String(quote.discount));
  const yearlyName = say(lang, "YEARLY — SAVE {n}%").replaceAll("{n}", String(quote.discount));
  const choices = [
    { id: "month", name: say(lang, "MONTHLY"), price: `${quote.monthly}${say(lang, "/month")}` },
    { id: "year", name: yearlyName, price: `${quote.yearly}${say(lang, "/year")}` },
  ];
  return (
    <div data-keep>
      <p className="text-sm font-semibold tracking-[0.04em] text-ember">{saveLine}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {choices.map((choice) => {
          const on = value === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange(choice.id)}
              className={`rounded-2xl px-4 py-4 text-left ${on ? "bg-white text-ink" : "bg-[#1c1c1c] text-white"}`}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">{choice.name}</span>
              <span className="mt-2 block font-serif text-2xl">{choice.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
