"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useBB } from "./Providers";

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
  return !el || el.closest("[data-keep], script, style, noscript, textarea, svg");
}

export function PageLang() {
  const { lang } = useBB();
  const path = usePathname();

  useLayoutEffect(() => {
    const source = new WeakMap();
    const applied = new WeakMap();
    let lock = false;
    let timer = 0;

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
          const hit = mem.get(`${lang}\n${text}`);
          if (!hit) {
            conceal(node);
            if (node.nodeValue !== HOLD) write(node, HOLD);
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
          const hit = mem.get(`${lang}\n${text}`);
          if (hit) el.placeholder = hit;
          else {
            el.placeholder = "";
            missing.push(text);
          }
        });
      } finally {
        queueMicrotask(() => {
          lock = false;
        });
      }
      return missing;
    }

    async function fetchMissing(texts) {
      if (!texts.length || !lang || lang === "en") return;
      lock = true;
      try {
        await fill(texts, lang);
      } catch {
        /* keep the page usable if the translator is busy */
      } finally {
        lock = false;
      }
      applyNow();
    }

    function schedule(texts) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fetchMissing(texts), 30);
    }

    const obs = new MutationObserver(() => {
      if (lock) return;
      const missing = applyNow();
      if (missing.length) schedule(missing);
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
    const missing = applyNow();
    if (missing.length) schedule(missing);
    return () => {
      window.clearTimeout(timer);
      obs.disconnect();
    };
  }, [lang, path]);

  return null;
}
