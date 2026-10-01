"use client";

import { useEffect } from "react";
import { useBB } from "./Providers";

const mem = new Map();
let loaded = false;

function code(lang) {
  if (lang === "zh-HK") return "zh-TW";
  if (lang === "zh") return "zh-CN";
  return "en";
}

function readCache() {
  try {
    Object.entries(JSON.parse(localStorage.getItem("bb_tr") || "{}")).forEach(([key, value]) => mem.set(key, value));
  } catch {
    /* ignore */
  }
}

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
  const missing = texts.filter((text) => !mem.has(`${to}\n${text}`));
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

export function PageLang() {
  const { lang } = useBB();
  useEffect(() => {
    if (!loaded) {
      readCache();
      loaded = true;
    }
    const source = new WeakMap();
    const applied = new WeakMap();
    let lock = false;
    let timer = 0;

    async function run() {
      if (lock) return;
      lock = true;
      try {
        const to = code(lang);
        const jobs = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          const el = node.parentElement;
          if (el && !el.closest("[data-keep], script, style, noscript, textarea, svg")) {
            if (applied.get(node) !== node.nodeValue) source.set(node, node.nodeValue);
            const raw = source.get(node) || "";
            const text = raw.trim();
            if (text && /[A-Za-z]/.test(text)) jobs.push({ node, raw, text: text.slice(0, 450) });
          }
          node = walker.nextNode();
        }
        const fields = [...document.querySelectorAll("input[placeholder], textarea[placeholder]")].filter((el) => !el.closest("[data-keep]"));
        fields.forEach((el) => {
          if (!el.dataset.srcPh) el.dataset.srcPh = el.placeholder;
        });
        if (to === "en") {
          jobs.forEach(({ node, raw }) => {
            if (node.nodeValue !== raw) {
              applied.set(node, raw);
              node.nodeValue = raw;
            }
          });
          fields.forEach((el) => {
            if (el.dataset.srcPh) el.placeholder = el.dataset.srcPh;
          });
          return;
        }
        const unique = [...new Set([
          ...jobs.map((job) => job.text),
          ...fields.map((el) => (el.dataset.srcPh || "").trim()).filter((text) => /[A-Za-z]/.test(text)),
        ])];
        await fill(unique, lang);
        jobs.forEach(({ node, raw, text }) => {
          const lead = raw.match(/^\s*/)[0];
          const tail = raw.match(/\s*$/)[0];
          const next = `${lead}${mem.get(`${lang}\n${text}`) || text}${tail}`;
          if (node.nodeValue !== next) {
            applied.set(node, next);
            node.nodeValue = next;
          }
        });
        fields.forEach((el) => {
          const text = (el.dataset.srcPh || "").trim();
          if (text) el.placeholder = mem.get(`${lang}\n${text.slice(0, 450)}`) || el.dataset.srcPh;
        });
      } finally {
        lock = false;
      }
    }

    const obs = new MutationObserver(() => {
      if (lock) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 280);
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
    run();
    return () => {
      window.clearTimeout(timer);
      obs.disconnect();
    };
  }, [lang]);
  return null;
}
