"use client";

import { useState } from "react";
import { useBB } from "./Providers";

const CODES = [
  ["Hong Kong", "+852"],
  ["New Zealand", "+64"],
  ["Australia", "+61"],
  ["China", "+86"],
  ["Singapore", "+65"],
  ["Japan", "+81"],
  ["United Kingdom", "+44"],
  ["United States", "+1"],
];

export function ChangePhone({ className = "" }) {
  const bb = useBB();
  const [step, setStep] = useState("");
  const [code, setCode] = useState("+852");
  const [local, setLocal] = useState("");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!bb.session) return null;

  function close() {
    setStep("");
    setLocal("");
    setOtp("");
    setSentTo("");
    setError("");
    setBusy(false);
  }

  const full = `${code}${String(local || "").replace(/\D/g, "")}`;

  async function send() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: full, action: "send" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) {
        setError(data.reason || "The code could not be sent. Your number is unchanged.");
        return;
      }
      setSentTo(data.phone || full);
      setStep("code");
    } catch {
      setError("The code could not be sent. Your number is unchanged.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: sentTo || full, action: "check", code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) {
        setError(data.reason || "That code didn't match. Your number is unchanged.");
        return;
      }
      const result = bb.changePhone(data.phone || sentTo);
      if (!result?.ok) {
        setError(result?.error || "That number could not be saved. Your number is unchanged.");
        return;
      }
      close();
    } catch {
      setError("That didn't go through. Your number is unchanged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => { setError(""); setStep("warn"); }}>Change Phone Number</button>
      {step && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" onClick={close}>
          <div className="w-full max-w-md rounded-3xl bg-[#141414] p-6 text-left text-white" onClick={(e) => e.stopPropagation()}>
            {step === "warn" && (
              <>
                <h2 className="font-serif text-2xl">Change Phone Number</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Your old phone number will be permanently unlinked from this Buddy Blind account. Once the change is complete, you will no longer be able to use the old number to access this account. Your account, Points, Circle, Buddies, Reviews and event history will not be affected. Your new phone number must be verified by OTP before the change is completed.
                </p>
                {bb.session.phone && <p className="mt-3 text-xs text-white/45">Current number · {bb.session.phone}</p>}
                <div className="mt-6 flex gap-3">
                  <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-sm" onClick={close}>Cancel</button>
                  <button type="button" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-[#1a1408]" onClick={() => { setError(""); setStep("number"); }}>Continue</button>
                </div>
              </>
            )}
            {step === "number" && (
              <>
                <h2 className="font-serif text-2xl">New number</h2>
                <p className="mt-3 text-sm text-white/60">Nothing changes until this number passes the code.</p>
                <label className="mt-4 block text-xs text-white/50">Country
                  <select value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-sm text-white">
                    {CODES.map(([name, dial]) => <option key={dial} value={dial}>{name} {dial}</option>)}
                  </select>
                </label>
                <label className="mt-3 block text-xs text-white/50">Phone number
                  <input value={local} onChange={(e) => setLocal(e.target.value)} inputMode="tel" placeholder="9123 4567" className="mt-1 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-sm text-white outline-none" />
                </label>
                {error && <p className="mt-3 text-sm text-ember">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-sm" onClick={close}>Cancel</button>
                  <button type="button" disabled={busy} className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-[#1a1408] disabled:opacity-50" onClick={send}>{busy ? "Sending" : "Send code"}</button>
                </div>
              </>
            )}
            {step === "code" && (
              <>
                <h2 className="font-serif text-2xl">Enter the code</h2>
                <p className="mt-3 text-sm text-white/60">Sent to {sentTo}. Your old number stays until this matches.</p>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" placeholder="Code" className="mt-4 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-sm text-white outline-none" />
                {error && <p className="mt-3 text-sm text-ember">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-sm" onClick={close}>Cancel</button>
                  <button type="button" disabled={busy} className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-[#1a1408] disabled:opacity-50" onClick={verify}>{busy ? "Checking" : "Verify"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
