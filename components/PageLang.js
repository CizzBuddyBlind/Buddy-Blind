"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useBB } from "./Providers";
import { say } from "@/lib/say";

const mem = new Map();
const HOLD = "\u2060";

function readCache() {
  try {
    Object.entries(JSON.parse(localStorage.getItem("bb_tr") || "{}")).forEach(([key, value]) => mem.set(key, value));
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined") readCache();

function writeCache() {
  const dump = {};
  let count = 0;
  mem.forEach((value, key) => {
    if (count < 700) dump[key] = value;
    count += 1;
  });
  try {
    localStorage.setItem("bb_tr", JSON.stringify(dump));
  } catch {
    /* ignore */
  }
}

async function fill(texts, to) {
  const missing = [...new Set(texts.filter((text) => text && !mem.has(`${to}\n${text}`)))];
  for (let start = 0; start < missing.length; start += 10) {
    const slice = missing.slice(start, start + 10);
    const res = await fetch("/api/tr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: slice, to }),
    });
    const data = await res.json();
    slice.forEach((text, index) => mem.set(`${to}\n${text}`, data.texts?.[index] || text));
  }
  if (missing.length) writeCache();
}

function skip(el) {
  return !el || el.closest("[data-keep], script, style, noscript, textarea, svg, select, option, input");
}

function storedLang() {
  try {
    const raw = localStorage.getItem("bb_lang_v1");
    if (!raw) return "en";
    return raw.charAt(0) === "\"" ? JSON.parse(raw) : raw;
  } catch {
    return "en";
  }
}

function knownLine(lang, text, preferDict) {
  if (preferDict) {
    const line = say(lang, text);
    if (line && line !== text) return line;
  }
  return mem.get(`${lang}\n${text}`) || "";
}

export function PageLang() {
  const { lang } = useBB();
  const path = usePathname() || "/";
  const website = path !== "/m" && !path.startsWith("/m/");

  useLayoutEffect(() => {
    if (website) return undefined;
    return watch(lang, false);
  }, [lang, path, website]);

  useLayoutEffect(() => {
    if (!website) {
      document.documentElement.classList.remove("bb-lang-wait");
      return undefined;
    }
    return watch(lang, true);
  });

  return null;
}

function watch(lang, website) {
  const source = new WeakMap();
  const applied = new WeakMap();
  let lock = false;
  let timer = 0;
  let safety = 0;

  function revealPage() {
    if (website) document.documentElement.classList.remove("bb-lang-wait");
  }

  function remember(node) {
    if (node.nodeValue === HOLD) return;
    if (applied.get(node) !== node.nodeValue) source.set(node, node.nodeValue);
  }

  function write(node, value) {
    if (node.nodeValue === value) {
      applied.set(node, value);
      return;
    }
    applied.set(node, value);
    node.nodeValue = value;
  }

  function conceal(node) {
    if (website) return;
    const el = node.parentElement;
    if (!el || el.dataset.bbHold || el.childElementCount > 6) return;
    el.dataset.bbHold = el.style.color || "inherit";
    el.style.color = "transparent";
  }

  function reveal(node) {
    const el = node.parentElement;
    if (!el?.dataset.bbHold) return;
    el.style.color = el.dataset.bbHold === "inherit" ? "" : el.dataset.bbHold;
    delete el.dataset.bbHold;
  }

  function jobs() {
    const list = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const el = node.parentElement;
      if (!skip(el)) {
        remember(node);
        const raw = source.get(node) || "";
        const text = raw.trim();
        if (text && /[A-Za-z]/.test(text)) list.push({ node, raw, text: text.slice(0, 450) });
      }
      node = walker.nextNode();
    }
    return list;
  }

  function fields() {
    return [...document.querySelectorAll("input[placeholder], textarea[placeholder]")].filter((el) => !skip(el));
  }

  function applyNow() {
    lock = true;
    const missing = [];
    try {
      const list = jobs();
      const inputs = fields();
      inputs.forEach((el) => {
        if (!el.dataset.srcPh) el.dataset.srcPh = el.placeholder;
      });
      if (!lang || lang === "en") {
        list.forEach(({ node, raw }) => {
          write(node, raw);
          reveal(node);
        });
        inputs.forEach((el) => {
          if (el.dataset.srcPh) el.placeholder = el.dataset.srcPh;
        });
        return missing;
      }
      list.forEach(({ node, raw, text }) => {
        const hit = knownLine(lang, text, website);
        if (!hit) {
          conceal(node);
          if (!website && node.nodeValue !== HOLD) write(node, HOLD);
          missing.push(text);
          return;
        }
        const lead = raw.match(/^\s*/)[0];
        const tail = raw.match(/\s*$/)[0];
        write(node, `${lead}${hit}${tail}`);
        reveal(node);
      });
      inputs.forEach((el) => {
        const text = (el.dataset.srcPh || "").trim().slice(0, 450);
        if (!text || !/[A-Za-z]/.test(text)) return;
        const hit = knownLine(lang, text, website);
        if (hit) el.placeholder = hit;
        else if (!website) missing.push(text);
      });
    } finally {
      queueMicrotask(() => {
        lock = false;
      });
    }
    return missing;
  }

  async function fetchMissing(texts) {
    if (!texts.length || !lang || lang === "en") {
      revealPage();
      return;
    }
    lock = true;
    try {
      await fill(texts, lang);
    } catch {
      /* show the page even if a line could not be translated */
    } finally {
      lock = false;
    }
    applyNow();
    revealPage();
  }

  function schedule(texts) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fetchMissing(texts), website ? 0 : 30);
  }

  function onClick(event) {
    if (!website || !lang || lang === "en") return;
    const link = event.target.closest?.("a");
    if (!link || link.target === "_blank" || !link.href) return;
    let url;
    try {
      url = new URL(link.href, location.origin);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (url.pathname === "/m" || url.pathname.startsWith("/m/")) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    document.documentElement.classList.add("bb-lang-wait");
  }

  if (website) document.addEventListener("click", onClick, true);
  const obs = new MutationObserver(() => {
    if (lock) return;
    const missing = applyNow();
    if (missing.length) schedule(missing);
    else revealPage();
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  const waitingForLang = website && (!lang || lang === "en") && storedLang() !== "en";
  const missing = applyNow();
  if (waitingForLang) document.documentElement.classList.add("bb-lang-wait");
  else if (missing.length) {
    if (website && lang && lang !== "en") document.documentElement.classList.add("bb-lang-wait");
    schedule(missing);
    safety = window.setTimeout(revealPage, 2500);
  } else revealPage();

  return () => {
    window.clearTimeout(timer);
    window.clearTimeout(safety);
    obs.disconnect();
    if (website) document.removeEventListener("click", onClick, true);
  };
}
