"use client";

import { useState } from "react";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setBad(false);
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setBad(true);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  return (
    <main data-keep className="grid min-h-dvh place-items-center bg-ink px-6 text-fg">
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <p className="bb-word text-sm tracking-[0.16em]">BUDDY BLIND</p>
        <h1 className="mt-6 font-serif text-4xl">Private for now.</h1>
        <p className="mt-3 text-sm text-white/55">The website and the app are closed to the public.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="mt-8 w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-center outline-none"
        />
        {bad && <p className="mt-3 text-sm text-ember">That password is not it.</p>}
        <button type="submit" disabled={busy} className="mt-4 w-full rounded-full bg-ember py-3 text-sm font-semibold text-[#1a1408]">
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
