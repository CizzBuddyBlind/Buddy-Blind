"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBB } from "./Providers";
import { englishKeyFor, hasSavedSource, isSavedWording, pageFromPath, say, setWordingPage, wordingFor } from "@/lib/say";

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

function hasHan(text) {
  return /[\u3400-\u9fff]/.test(text || "");
}

function skip(el) {
  if (!el || el.closest("script, style, noscript, textarea, svg, select, option, input")) return true;
  const keep = el.closest("[data-keep]");
  if (keep && keep.getAttribute("data-keep") !== "said") return true;
  if (el.closest("[data-bb-live]")) return true;
  return false;
}

function localLine(lang, text) {
  const line = say(lang, text);
  return line && line !== text ? line : "";
}

function englishOf(node, book) {
  const parent = node.parentElement;
  const marked = parent?.getAttribute("data-bb-src") || "";
  if (marked) return marked;
  const stored = book.source.get(node);
  if (stored && stored !== HOLD) return stored;
  const current = node.nodeValue || "";
  const recovered = englishKeyFor(current);
  if (recovered && recovered !== current.trim()) {
    book.source.set(node, recovered);
    if (parent && parent.childNodes.length === 1) parent.setAttribute("data-bb-src", recovered);
    return recovered;
  }
  if (!current || current === HOLD || hasHan(current) || isSavedWording(current) || !/[A-Za-z]/.test(current)) return "";
  book.source.set(node, current);
  if (parent && parent.childNodes.length === 1) parent.setAttribute("data-bb-src", current.trim());
  return current;
}

function paint(book, lang) {
  if (typeof location !== "undefined") setWordingPage(pageFromPath(location.pathname));
  book.lock = true;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const next = walker.nextNode();
    if (!skip(node.parentElement)) {
      const raw = englishOf(node, book);
      const text = raw.trim().slice(0, 450);
      if (text) {
        let value = text;
        if (!lang || lang === "en") {
          const hit = wordingFor("en", text);
          if (hit != null) value = hit;
        } else {
          const own = wordingFor(lang, text);
          if (own != null) value = own;
          else if (!hasSavedSource(lang, text)) {
            const cached = mem.get(`${lang}\n${text}`) || "";
            const hit = localLine(lang, text) || (/<x\b|<\//i.test(cached) ? "" : cached);
            if (hit) value = hit;
          }
        }
        const original = node.nodeValue || "";
        const lead = original.match(/^\s*/)[0];
        const tail = original.match(/\s*$/)[0];
        const next = `${lead}${String(value).replace(/^\s+|\s+$/g, "")}${tail}`;
        if (original !== next) node.nodeValue = next;
      }
    }
    node = next;
  }
  queueMicrotask(() => {
    book.lock = false;
  });
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
    paint(book.current, lang);
    document.documentElement.classList.remove("bb-lang-wait");
  }, [lang, path, website]);

  useEffect(() => {
    if (!website) return undefined;
    let dead = false;
    let timer = 0;
    const obs = new MutationObserver(() => {
      if (book.current.lock) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (dead || book.current.lock) return;
        paint(book.current, lang);
      }, 80);
    });
    obs.observe(document.body, { subtree: true, childList: true });
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
  paint(book, lang);
  const obs = new MutationObserver(() => {
    if (book.lock) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (dead || book.lock) return;
      paint(book, lang);
    }, 80);
  });
  obs.observe(document.body, { subtree: true, childList: true });
  return () => {
    dead = true;
    window.clearTimeout(timer);
    obs.disconnect();
  };
}
