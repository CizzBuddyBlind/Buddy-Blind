"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
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

function skip(el, leaveApp) {
  if (!el || el.closest("[data-keep], script, style, noscript, textarea, svg, select, option, input")) return true;
  if (leaveApp && el.closest(".bb-store")) return true;
  return false;
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

function collect(book, leaveApp) {
  const list = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const el = node.parentElement;
    if (!skip(el, leaveApp)) {
      if (node.nodeValue !== HOLD && book.applied.get(node) !== node.nodeValue) book.source.set(node, node.nodeValue);
      const raw = book.source.get(node) || "";
      const text = raw.trim();
      if (text && /[A-Za-z]/.test(text)) list.push({ node, raw, text: text.slice(0, 450) });
    }
    node = walker.nextNode();
  }
  return list;
}

function write(book, node, value) {
  book.applied.set(node, value);
  if (node.nodeValue !== value) node.nodeValue = value;
}

function apply(book, lang, preferDict) {
  book.lock = true;
  const missing = [];
  try {
    const list = collect(book, preferDict);
    if (!lang || lang === "en") {
      list.forEach(({ node, raw }) => write(book, node, raw));
      return missing;
    }
    list.forEach(({ node, raw, text }) => {
      const hit = knownLine(lang, text, preferDict);
      if (!hit) {
        missing.push(text);
        return;
      }
      const lead = raw.match(/^\s*/)[0];
      const tail = raw.match(/\s*$/)[0];
      write(book, node, `${lead}${hit}${tail}`);
    });
  } finally {
    queueMicrotask(() => {
      book.lock = false;
    });
  }
  return [...new Set(missing)];
}

export function PageLang() {
  const { lang } = useBB();
  const path = usePathname() || "/";
  const website = path !== "/m" && !path.startsWith("/m/");
  const book = useRef({ source: new WeakMap(), applied: new WeakMap(), lock: false });

  useLayoutEffect(() => {
    if (website) return undefined;
    return watchApp(lang, book.current);
  }, [lang, path, website]);

  useLayoutEffect(() => {
    if (!website) {
      document.documentElement.classList.remove("bb-lang-wait");
      return;
    }
    const waiting = (!lang || lang === "en") && storedLang() !== "en";
    if (waiting) {
      document.documentElement.classList.add("bb-lang-wait");
      return;
    }
    const missing = apply(book.current, lang, true);
    if (!missing.length) document.documentElement.classList.remove("bb-lang-wait");
  });

  useEffect(() => {
    if (!website) return undefined;
    let timer = 0;
    let safety = 0;
    let dead = false;

    async function load(texts) {
      if (dead || !texts.length || !lang || lang === "en") {
        document.documentElement.classList.remove("bb-lang-wait");
        return;
      }
      try {
        await fill(texts, lang);
      } catch {
        /* show the page even if a line stays in English */
      }
      if (dead) return;
      apply(book.current, lang, true);
      document.documentElement.classList.remove("bb-lang-wait");
    }

    function arm(texts, hide) {
      if (!texts.length) {
        document.documentElement.classList.remove("bb-lang-wait");
        return;
      }
      if (hide) document.documentElement.classList.add("bb-lang-wait");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => load(texts), 0);
      if (hide) {
        window.clearTimeout(safety);
        safety = window.setTimeout(() => document.documentElement.classList.remove("bb-lang-wait"), 2500);
      }
    }

    const waiting = (!lang || lang === "en") && storedLang() !== "en";
    if (!waiting) arm(apply(book.current, lang, true), true);

    function onClick(event) {
      if (!lang || lang === "en") return;
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

    document.addEventListener("click", onClick, true);
    const obs = new MutationObserver(() => {
      if (book.current.lock) return;
      const missing = apply(book.current, lang, true);
      if (missing.length) arm(missing, false);
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });

    return () => {
      dead = true;
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      obs.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, [lang, path, website]);

  return null;
}

function watchApp(lang, book) {
  let timer = 0;
  let lock = false;

  function conceal(node) {
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

  function applyApp() {
    lock = true;
    const missing = [];
    try {
      const list = collect(book, false);
      if (!lang || lang === "en") {
        list.forEach(({ node, raw }) => {
          write(book, node, raw);
          reveal(node);
        });
        return missing;
      }
      list.forEach(({ node, raw, text }) => {
        const hit = mem.get(`${lang}\n${text}`) || "";
        if (!hit) {
          conceal(node);
          if (node.nodeValue !== HOLD) write(book, node, HOLD);
          missing.push(text);
          return;
        }
        const lead = raw.match(/^\s*/)[0];
        const tail = raw.match(/\s*$/)[0];
        write(book, node, `${lead}${hit}${tail}`);
        reveal(node);
      });
    } finally {
      queueMicrotask(() => {
        lock = false;
      });
    }
    return [...new Set(missing)];
  }

  async function fetchMissing(texts) {
    if (!texts.length || !lang || lang === "en") return;
    lock = true;
    try {
      await fill(texts, lang);
    } catch {
      /* keep the app as it is */
    } finally {
      lock = false;
    }
    applyApp();
  }

  const obs = new MutationObserver(() => {
    if (lock) return;
    const missing = applyApp();
    if (!missing.length) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fetchMissing(missing), 30);
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  const missing = applyApp();
  if (missing.length) timer = window.setTimeout(() => fetchMissing(missing), 30);
  return () => {
    window.clearTimeout(timer);
    obs.disconnect();
  };
}
