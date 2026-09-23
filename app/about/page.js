"use client";

import Link from "next/link";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";

export default function AboutPage() {
  const { lang } = useBB();
  const t = (key) => translate(lang, key);
  return (
    <main className="bb-frame mx-auto max-w-2xl pb-28 pt-10 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-mute">{t("btn.back")}</Link>
      <p className="bb-kicker mt-6 text-ember">{t("about.kicker")}</p>
      <h1 className="mt-3 font-serif text-4xl">{t("about.title")}</h1>
      {["1", "2", "3", "4"].map((n) => (
        <section key={n} className="mt-8">
          <h2 className="font-serif text-2xl">{t(`about.${n}t`)}</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">{t(`about.${n}`)}</p>
        </section>
      ))}
    </main>
  );
}
