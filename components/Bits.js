"use client";

import { useEffect, useRef, useState } from "react";
import { useBB } from "./Providers";
import { resolveCopy } from "@/lib/i18n";
import { getMedia } from "@/lib/media";

function escapeText(value) {
  return String(value ?? "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

export function Editable({ value, onChange, className = "", as = "span", locked = false }) {
  const { editing } = useBB();
  const ref = useRef(null);
  const Tag = as;
  const safe = value ?? "";
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== safe) el.textContent = safe;
  }, [safe, editing]);
  if (!editing || locked) return <Tag className={className}>{safe}</Tag>;
  return (
    <Tag
      ref={ref}
      className={`${className} cursor-text rounded-sm`}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: escapeText(safe) }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onBlur={(e) => {
        const next = (e.currentTarget.textContent || "").replace(/\s+/g, " ").trim();
        if (next !== safe) onChange(next);
      }}
    />
  );
}

export function Copy({ k, legacy, className = "", as = "span", locked = false, onEnglish }) {
  const { lang, content, update } = useBB();
  const value = resolveCopy(content, lang, k, legacy);
  return (
    <Editable
      as={as}
      className={className}
      locked={locked}
      value={value}
      onChange={(next) => update((draft) => {
        if (!draft.copy.locales) draft.copy.locales = {};
        if (!draft.copy.locales[lang]) draft.copy.locales[lang] = {};
        draft.copy.locales[lang][k] = next;
        if (lang === "en" && onEnglish) onEnglish(draft, next);
      })}
    />
  );
}

export function fileToCover(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1100;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read photo"));
    };
    img.src = url;
  });
}

export function Photo({ src, fallback = "", alt, onChange, className = "" }) {
  const { editing } = useBB();
  const [shown, setShown] = useState("");
  useEffect(() => {
    let cancel = false;
    async function load(value) {
      if (!value) return "";
      if (!String(value).startsWith("idb:")) return value;
      try {
        return (await getMedia(String(value).slice(4))) || "";
      } catch {
        return "";
      }
    }
    (async () => {
      const primary = await load(src);
      const next = primary || await load(fallback);
      if (!cancel) setShown(next || "");
    })();
    return () => {
      cancel = true;
    };
  }, [src, fallback]);
  async function take(file) {
    if (!file || !onChange) return;
    try {
      onChange(await fileToCover(file));
    } catch {
      /* ignore bad files */
    }
  }
  return (
    <div
      className={`relative h-full w-full ${className}`}
      onDragOver={(e) => {
        if (!editing) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!editing) return;
        e.preventDefault();
        take(e.dataTransfer.files?.[0]);
      }}
    >
      {shown ? <img src={shown} alt={alt || ""} className="absolute inset-0 h-full w-full object-cover" /> : null}
      {editing && onChange && (
        <label
          className="absolute bottom-3 right-3 z-10 rounded-full bg-black/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              take(file);
            }}
          />
        </label>
      )}
    </div>
  );
}

export function Sheet({ open, title, body, confirmLabel, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/70 p-4 sm:place-items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 text-fg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="bb-kicker text-mute">Buddy Blind</p>
        <h2 className="mt-2 font-serif text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">{body}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/15 py-3 text-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
