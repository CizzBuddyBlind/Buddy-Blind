"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBB } from "./Providers";
import { isSavedWording, pageFromPath, say, setWordingPage, wordingFor } from "@/lib/say";

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
  const missing = [...new Set(texts.filter((text) => text && !isSavedWording(text) && !hasHan(text) && !mem.has(`${to}\n${text}`)))];
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
  if (!el || el.closest("script, style, noscript, textarea, svg, select, option, input")) return true;
  const keep = el.closest("[data-keep]");
  if (keep && keep.getAttribute("data-keep") !== "said") return true;
  if (leaveApp && el.closest(".bb-store")) return true;
  return false;
}

function hasHan(text) {
  return /[\u3400-\u9fff]/.test(text || "");
}

function localLine(lang, text) {
  const own = wordingFor(lang, text);
  if (own) return own;
  const line = say(lang, text);
  return line && line !== text ? line : "";
}

function englishOf(node, book) {
  const parent = node.parentElement;
  const marked = parent?.getAttribute("data-bb-src") || "";
  if (marked) return marked;
  const stored = book.source.get(node);
  if (stored && stored !== HOLD && !hasHan(stored)) return stored;
  const current = node.nodeValue || "";
  if (!current || current === HOLD || hasHan(current) || isSavedWording(current) || !/[A-Za-z]/.test(current)) return "";
  book.source.set(node, current);
  if (parent && parent.childNodes.length === 1) parent.setAttribute("data-bb-src", current.trim());
  return current;
}

function paint(book, lang, leaveApp) {
  if (typeof location !== "undefined") setWordingPage(pageFromPath(location.pathname));
  book.lock = true;
  const missing = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const next = walker.nextNode();
    if (!skip(node.parentElement, leaveApp)) {
      const raw = englishOf(node, book);
      const text = raw.trim().slice(0, 450);
      if (text) {
        let value = raw;
        if (!lang || lang === "en") {
          const hit = wordingFor("en", text);
          if (hit) {
            const lead = raw.match(/^\s*/)[0];
            const tail = raw.match(/\s*$/)[0];
            value = `${lead}${hit}${tail}`;
          }
        } else {
          const hit = localLine(lang, text) || (!isSavedWording(text) ? mem.get(`${lang}\n${text}`) || "" : "");
          if (hit) {
            const lead = raw.match(/^\s*/)[0];
            const tail = raw.match(/\s*$/)[0];
            value = `${lead}${hit}${tail}`;
          } else if (!hasHan(text)) missing.push(text);
        }
        if (node.nodeValue !== value) node.nodeValue = value;
      }
    }
    node = next;
  }
  queueMicrotask(() => {
    book.lock = false;
  });
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
    if (!website) return;
    document.querySelectorAll("[data-keep='said']").forEach((el) => el.removeAttribute("data-keep"));
    paint(book.current, lang, false);
    document.documentElement.classList.remove("bb-lang-wait");
  }, [lang, path, website]);

  useEffect(() => {
    if (!website) return undefined;
    let dead = false;
    let timer = 0;
    const missing = paint(book.current, lang, false);
    if (missing.length && lang && lang !== "en") {
      fill(missing, lang).then(() => {
        if (!dead) paint(book.current, lang, false);
      }).catch(() => {});
    }

    const obs = new MutationObserver(() => {
      if (book.current.lock) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (dead || book.current.lock) return;
        const left = paint(book.current, lang, false);
        if (left.length && lang && lang !== "en") {
          fill(left, lang).then(() => {
            if (!dead) paint(book.current, lang, false);
          }).catch(() => {});
        }
      }, 40);
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => {
      dead = true;
      window.clearTimeout(timer);
      obs.disconnect();
    };
  }, [lang, path, website]);

  return null;
}

function watchApp(lang, book) {
  let dead = false;
  let timer = 0;
  const missing = paint(book, lang, false);
  if (missing.length && lang && lang !== "en") {
    fill(missing, lang).then(() => {
      if (!dead) paint(book, lang, false);
    }).catch(() => {});
  }
  const obs = new MutationObserver(() => {
    if (book.lock) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (dead) return;
      const left = paint(book, lang, false);
      if (left.length && lang && lang !== "en") {
        fill(left, lang).then(() => {
          if (!dead) paint(book, lang, false);
        }).catch(() => {});
      }
    }, 40);
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  return () => {
    dead = true;
    window.clearTimeout(timer);
    obs.disconnect();
  };
}
