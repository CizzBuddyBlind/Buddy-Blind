"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBB } from "@/components/Providers";

export default function LoginForm() {
  const { login, register, activate } = useBB();
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("activate") || "";
  const [mode, setMode] = useState(code ? "activate" : "in");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [card, setCard] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");
    let message = null;
    if (mode === "in") message = login(email || username, password);
    else if (mode === "up") {
      window.location.href = "/register";
      return;
    } else {
      message = activate(code, username, password);
      if (!message) message = login(username, password);
    }
    if (message) {
      setError(message);
      return;
    }
    const fromApp = params.get("from") === "app";
    let next = fromApp ? "/m?tab=profile" : "/";
    try {
      const stored = sessionStorage.getItem("bb_next") || "";
      sessionStorage.removeItem("bb_next");
      if (stored.startsWith("/") && !stored.startsWith("//")) next = stored;
    } catch {
      /* ignore */
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="bb-frame grid min-h-[80dvh] place-items-center py-16 pb-28">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="bb-kicker text-mute">Buddy Blind</p>
        <h1 className="mt-3 font-serif text-3xl">
          {mode === "in" ? "Welcome back" : mode === "up" ? "Create your seat" : "Activate admin"}
        </h1>
        <p className="mt-2 text-sm text-mute">
          One Login for everyone. The account decides if you browse, edit, or assign admins.
        </p>
        {mode === "activate" && <p className="mt-3 text-xs text-ember">Activation code loaded. Choose the username and password you will use next time.</p>}
        <div className="mt-6 space-y-3">
          {mode !== "activate" && (
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or username" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          )}
          {mode !== "in" && (
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
          )}
          {mode === "up" && (
            <>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Name on the table" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
              <input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender · optional" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
              <a href="/register" className="text-xs text-ember">Create account to get a phone code</a>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
              <label className="flex items-start gap-2 text-xs text-mute">
                <input type="checkbox" className="mt-0.5" checked={card} onChange={(e) => setCard(e.target.checked)} />
                <span>I will use a card for the HK$5 admin fee later. Do not type the card number here.</span>
              </label>
              <p className="text-xs text-mute">Photo and ID checks are optional and stay off the public profile.</p>
            </>
          )}
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-sm outline-none" />
        </div>
        {error && <p className="mt-3 text-sm text-ember">{error}</p>}
        <button type="submit" className="mt-5 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink">
          {mode === "in" ? "Login" : mode === "up" ? "Create account" : "Activate and login"}
        </button>
        {mode === "in" ? (
          <a href="/register" className="mt-4 block w-full text-center text-sm text-mute">Need a seat? Create account</a>
        ) : mode !== "activate" ? (
          <button type="button" className="mt-4 w-full text-sm text-mute" onClick={() => { setMode("in"); setError(""); }}>
            Already have one? Login
          </button>
        ) : null}
      </form>
    </main>
  );
}
