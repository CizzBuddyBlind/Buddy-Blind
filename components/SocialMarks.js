"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HostBadge } from "./Flows";
import { WizardDialog } from "./Wizard";
import { useBB } from "./Providers";
import { viewerSeat } from "@/lib/joinOffer";
import { commentCount, HOST_LINES, JOINER_LINES, locateSocial, signalRows } from "@/lib/quickSocial";

function stopControl(event) {
  event.preventDefault();
  event.stopPropagation();
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.7} strokeLinejoin="round">
      <path d="M19.5 12.57 12 20.25l-7.5-7.68a4.5 4.5 0 1 1 6.36-6.36L12 7.35l1.14-1.14a4.5 4.5 0 1 1 6.36 6.36Z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.5 4.5 8.4 8.4 0 0 1-4-.9L3 21l1.5-5.5A8.4 8.4 0 0 1 3.6 11 8.5 8.5 0 0 1 8.1 3.5 8.4 8.4 0 0 1 12.1 2.6h.5A8.5 8.5 0 0 1 21 11.1Z" />
    </svg>
  );
}

function resolveSocial(row, content) {
  const found = locateSocial(content, row);
  if (!found || !row) return row;
  if (row.source === "table") return { ...found, source: "table", venueId: row.venueId, tableId: found.id };
  if (row.source === "private") return { ...found, source: "private" };
  if (row.source === "partner") return { ...row, likes: found.likes, signals: found.signals, hostSignal: found.hostSignal };
  if (row.source === "own") return { ...row, ...found, source: "own" };
  return row;
}

function contextCopy(record) {
  if (!record) return "";
  if (record.source === "private") return String(record.description || "").trim();
  if (record.source === "table") return String(record.inviteText || "").trim();
  return String(record.post || "").trim();
}

function contextPerson(record, people) {
  const list = (Array.isArray(people) && people.length ? people : record?.participants) || [];
  const host = list.find((person) => person?.role === "host" || (record?.hostUserId && person?.userId === record.hostUserId));
  if (host) return host;
  return {
    userId: record?.hostUserId || "",
    handle: record?.hostHandle || record?.hostName || "",
  };
}

export function SocialBar({ target, people, tone = "light" }) {
  const bb = useBB();
  const [open, setOpen] = useState(false);
  if (!target) return null;
  const live = resolveSocial(target, bb.content);
  const likes = Array.isArray(live?.likes) ? live.likes : [];
  const mine = !!(bb.session?.userId && likes.includes(bb.session.userId));
  const count = commentCount(live, people || live?.participants);
  const off = tone === "light" ? "text-black/55" : "text-white/55";
  async function like(event) {
    stopControl(event);
    const res = await bb.likeQuick?.(live);
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) bb.notify?.(res.error);
  }
  return (
    <span className="inline-flex items-center gap-3" onClick={stopControl} onMouseDown={stopControl}>
      <button type="button" aria-pressed={mine} aria-label={mine ? "Unlike" : "Like"} className={`inline-flex items-center gap-1 text-sm ${mine ? "text-red-600" : off}`} onClick={like}>
        <HeartIcon filled={mine} /> {likes.length}
      </button>
      <button type="button" aria-label="Presets" className={`inline-flex items-center gap-1 text-sm ${off}`} onClick={(event) => { stopControl(event); setOpen(true); }}>
        <CommentIcon /> {count}
      </button>
      {open && <PresetDialog record={live} people={people || live?.participants} onClose={() => setOpen(false)} />}
    </span>
  );
}

function PresetDialog({ record, people, onClose }) {
  const bb = useBB();
  const [composing, setComposing] = useState(false);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const saving = useRef(false);
  if (!record || typeof document === "undefined") return null;
  const live = resolveSocial(record, bb.content) || record;
  const role = viewerSeat(live, bb.session);
  const lines = signalRows(live, people).filter((item) => !item.system);
  const mine = bb.session?.userId || "";
  const choices = role === "host" ? HOST_LINES : role === "member" ? JOINER_LINES : [];
  const story = contextCopy(live);
  const author = contextPerson(live, people);
  function cancel() {
    setSelected("");
    setComposing(false);
    setError("");
  }
  async function publish() {
    if (!selected || saving.current) return;
    saving.current = true;
    try {
      const res = await bb.setQuickSignal?.(live, selected);
      if (res?.needLogin) {
        window.location.href = "/login";
        return;
      }
      if (res?.error) setError(res.error);
      else {
        setError("");
        setSelected("");
        setComposing(false);
      }
    } finally {
      saving.current = false;
    }
  }
  async function remove(id) {
    if (saving.current) return;
    saving.current = true;
    try {
      const res = await bb.clearQuickSignal?.(live, id);
      if (res?.needLogin) {
        window.location.href = "/login";
        return;
      }
      if (res?.error) setError(res.error);
      else {
        setError("");
        setSelected("");
      }
    } finally {
      saving.current = false;
    }
  }
  return createPortal(
    <WizardDialog onClose={onClose} backdropClose>
      {story && (author.userId || author.handle) && (
        <div className="mb-4 flex items-start gap-2">
          <HostBadge handle={author.handle} userId={author.userId || ""} />
          <p className="text-sm leading-snug text-white/80 [overflow-wrap:anywhere]">{story}</p>
        </div>
      )}
      <div className="max-h-[50vh] space-y-3 overflow-y-auto">
        {lines.map((item) => (
          <div key={item.key} className="flex items-start gap-2">
            <HostBadge handle={item.person.handle} userId={item.person.userId || ""} />
            <div>
              <p className="text-sm leading-snug text-white/80 [overflow-wrap:anywhere]">{item.text}</p>
              {item.userId && item.userId === mine && (
                <button type="button" className="mt-1 block text-xs text-white/45" aria-label="Remove my currently posted comment" onClick={() => remove(item.id)}>Remove</button>
              )}
            </div>
          </div>
        ))}
        {lines.length === 0 && <p className="text-sm text-white/45">Nothing yet.</p>}
      </div>
      {choices.length > 0 && !composing && (
        <button type="button" className="mt-4 text-xs font-semibold tracking-[0.14em] text-fg" onClick={() => { setError(""); setComposing(true); }}>ADD COMMENT</button>
      )}
      {composing && choices.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {choices.map((line) => (
            <button
              key={line.code}
              type="button"
              aria-pressed={selected === line.code}
              className={`rounded-2xl px-3 py-2 text-left text-sm ${selected === line.code ? "bg-fg text-ink" : "border border-white/20 text-fg"}`}
              onClick={() => setSelected(line.code)}
            >
              {line.text}
            </button>
          ))}
        </div>
      )}
      {composing && selected && (
        <button type="button" className="mt-4 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={publish}>POST</button>
      )}
      {composing && (
        <button type="button" className="mt-3 block text-xs text-white/45" onClick={cancel}>Cancel</button>
      )}
      {role === "none" && <p className="mt-4 text-sm text-white/45">Join to leave a comment.</p>}
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
    </WizardDialog>,
    document.body,
  );
}
