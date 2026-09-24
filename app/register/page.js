"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { OTP_DEMO } from "@/lib/bible";
import { LangSwitch } from "@/components/Flows";

export default function RegisterPage() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [handle, setHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!sent || otp !== OTP_DEMO) {
      setError(t("reg.otp"));
      return;
    }
    if (!agreed) {
      setError(t("trial.check"));
      return;
    }
    const message = bb.register({ email, username, password, handle, phone, verified: false });
    if (message) {
      setError(message);
      return;
    }
    router.push("/subscribe?trial=1");
    router.refresh();
  }

  return (
    <main className="bb-frame grid min-h-[80dvh] place-items-center py-16 pb-28">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-4 flex justify-end">
          <LangSwitch />
        </div>
        <p className="bb-kicker text-ember">{t("trial.kicker")}</p>
        <h1 className="mt-3 font-serif text-3xl">{t("trial.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">{t("trial.body")}</p>
        <div className="mt-6 space-y-3">
          <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={t("reg.name")} className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <button type="button" className="text-xs text-ember" onClick={() => setSent(true)}>{t("reg.send")}</button>
          {sent && <p className="text-xs text-mute">{t("reg.demo")} {OTP_DEMO}</p>}
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>{t("trial.check")}</span>
          </label>
          <p className="text-xs text-mute">{t("reg.card")}</p>
          <p className="text-xs text-mute">{t("reg.optional")}</p>
        </div>
        {error && <p className="mt-3 text-sm text-ember">{error}</p>}
        <button type="submit" className="mt-5 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink">{t("trial.start")}</button>
        <a href="/login" className="mt-4 block text-center text-sm text-mute">{t("reg.login")}</a>
      </form>
    </main>
  );
}
