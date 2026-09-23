"use client";

import Link from "next/link";
import { Copy } from "@/components/Bits";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";

export default function AboutPage() {
  const { lang } = useBB();
  const t = (key) => translate(lang, key);
  return (
    <main className="bb-frame mx-auto max-w-2xl pb-28 pt-10 md:pb-16">
      <Link href="/how" className="text-xs uppercase tracking-[0.14em] text-mute">{t("btn.back")} · {t("nav.how")}</Link>
      <p className="bb-kicker mt-6 text-ember"><Copy k="about.kicker" /></p>
      <h1 className="mt-3 font-serif text-4xl"><Copy k="about.title" /></h1>
      {["1", "2", "3", "4"].map((n) => (
        <section key={n} className="mt-8">
          <h2 className="font-serif text-2xl"><Copy k={`about.${n}t`} /></h2>
          <Copy as="p" k={`about.${n}`} className="mt-2 text-sm leading-relaxed text-mute" />
        </section>
      ))}
    </main>
  );
}
