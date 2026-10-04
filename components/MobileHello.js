"use client";

import { useEffect, useRef, useState } from "react";
import { useBB } from "./Providers";
import { helloAfterDismiss, helloStep, isMobileWeb } from "@/lib/layoutMode";
import { storeLink } from "@/lib/media";
import { say } from "@/lib/say";

const KEY = "bb_mobile_hello";

function readSaved() {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

function writeSaved(value) {
  try {
    sessionStorage.setItem(KEY, value);
  } catch { /* ignore */ }
}

export function MobileHello() {
  const bb = useBB();
  const opened = useRef(false);
  const [step, setStep] = useState("");
  const [href, setHref] = useState("");
  const [apple, setApple] = useState(false);

  useEffect(() => {
    if (!bb.ready || opened.current) return;
    opened.current = true;
    const saved = readSaved();
    const next = helloStep({ saved, loggedIn: !!bb.session, mobileWeb: isMobileWeb() });
    if (!next) {
      if (saved === "login" && bb.session) writeSaved("done");
      return;
    }
    const link = storeLink();
    setHref(link);
    setApple(/apps\.apple\.com/.test(link));
    setStep(next);
  }, [bb.ready]);

  if (!step) return null;

  function dismiss() {
    const next = helloAfterDismiss(step, !!bb.session);
    writeSaved(next === "login" ? "login" : "done");
    setStep(next === "login" ? "login" : "");
  }

  function goAccount() {
    writeSaved("done");
    setStep("");
  }

  const t = (text) => say(bb.lang, text);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-end bg-black/70 p-4 sm:place-items-center" onClick={dismiss}>
      <div className="relative w-full max-w-sm rounded-3xl bg-[#141414] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" aria-label={t("Close")} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-white/70" onClick={dismiss}>×</button>
        {step === "app" ? (
          <>
            <h2 className="pr-8 font-serif text-3xl">{t("Get the app")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{t("Same tables. Easier in the app.")}</p>
            <a href={href || storeLink()} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-full bg-ember px-4 py-3 text-center text-sm font-semibold text-[#1a1408]">
              {t(apple ? "App Store" : "Google Play")}
            </a>
          </>
        ) : (
          <>
            <h2 className="pr-8 font-serif text-3xl">{t("Register or log in")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{t("Looking around is free.")}</p>
            <div className="mt-6 grid gap-2">
              <a href="/register?from=app" onClick={goAccount} className="rounded-full bg-ember px-4 py-3 text-center text-sm font-semibold text-[#1a1408]">{t("Register")}</a>
              <a href="/login?from=app" onClick={goAccount} className="rounded-full border border-white/20 px-4 py-3 text-center text-sm">{t("Log in")}</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
