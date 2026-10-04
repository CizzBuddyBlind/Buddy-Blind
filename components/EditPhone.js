"use client";

import { useState } from "react";
import { useBB } from "./Providers";
import { phoneDigits } from "@/lib/people";

export function usePhoneEdit() {
  const bb = useBB();
  const [nextPhone, setNextPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const typed = nextPhone.trim();
  const current = phoneDigits(bb.session?.phone);
  const same = typed && phoneDigits(typed) === current;
  const asked = !!sentTo && phoneDigits(sentTo) === phoneDigits(typed);

  function reset() {
    setNextPhone("");
    setSentTo("");
    setOtp("");
    setNote("");
    setBusy(false);
  }

  async function send() {
    setNote("");
    setBusy(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: typed, action: "send" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) {
        setNote(data.reason || "The code could not be sent. Your number is unchanged.");
        return;
      }
      setSentTo(data.phone || typed);
      setOtp("");
    } catch {
      setNote("The code could not be sent. Your number is unchanged.");
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    if (!typed || same) return { ok: true, skipped: true };
    if (!asked) {
      setNote("Send a code to the new number first. Your number is unchanged.");
      return { ok: false };
    }
    setBusy(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: sentTo, action: "check", code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) {
        setNote(data.reason || "That code didn't match. Your number is unchanged.");
        return { ok: false };
      }
      const result = bb.changePhone(data.phone || sentTo);
      if (!result?.ok) {
        setNote(result?.error || "That number is already on another account. Your number is unchanged.");
        return { ok: false };
      }
      reset();
      return { ok: true };
    } catch {
      setNote("That didn't go through. Your number is unchanged.");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  const fields = (
    <>
      <label className="block text-xs text-white/45">New phone number
        <input
          value={nextPhone}
          onChange={(e) => {
            setNextPhone(e.target.value);
            setNote("");
          }}
          inputMode="tel"
          placeholder="+852 9123 4567"
          className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white outline-none"
        />
      </label>
      {typed && !same && (
        <button type="button" disabled={busy} className="text-xs text-white/70 disabled:opacity-50" onClick={send}>
          {busy && !asked ? "Sending" : asked ? "Send a new code" : "Send code"}
        </button>
      )}
      {asked && (
        <label className="block text-xs text-white/45">OTP
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white outline-none"
          />
        </label>
      )}
      {note && <p className="text-xs text-ember">{note}</p>}
    </>
  );

  return { fields, commit, reset, busy };
}
