"use client";

import { useState } from "react";
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
  const on = tone === "light" ? "text-black" : "text-white";
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
      <button type="button" aria-pressed={mine} aria-label={mine ? "Unlike" : "Like"} className={`text-sm ${mine ? on : off}`} onClick={like}>
        {mine ? "♥" : "♡"} {likes.length}
      </button>
      <button type="button" aria-label="Presets" className={`text-sm ${off}`} onClick={(event) => { stopControl(event); setOpen(true); }}>
        💬 {count}
      </button>
      {open && <PresetDialog record={live} people={people || live?.participants} onClose={() => setOpen(false)} />}
    </span>
  );
}

function PresetDialog({ record, people, onClose }) {
  const bb = useBB();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  if (!record || typeof document === "undefined") return null;
  const live = resolveSocial(record, bb.content) || record;
  const role = viewerSeat(live, bb.session);
  const lines = signalRows(live, people).filter((item) => !item.system);
  const posted = role === "host"
    ? live.hostSignal?.code || ""
    : (live.signals || []).find((item) => item.userId && item.userId === bb.session?.userId)?.code || "";
  const choices = role === "host" ? HOST_LINES : role === "member" ? JOINER_LINES : [];
  const story = contextCopy(live);
  const author = contextPerson(live, people);
  async function publish() {
    if (!selected) return;
    const res = await bb.setQuickSignal?.(live, selected);
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) setError(res.error);
    else {
      setError("");
      setSelected("");
    }
  }
  async function remove() {
    const res = await bb.clearQuickSignal?.(live);
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) setError(res.error);
    else {
      setError("");
      setSelected("");
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
      <div className="max-h-[50vh] space-y-2 overflow-y-auto">
        {lines.map((item) => (
          <div key={item.key} className="flex items-start gap-2">
            <HostBadge handle={item.person.handle} userId={item.person.userId || ""} />
            <p className="text-sm leading-snug text-white/80 [overflow-wrap:anywhere]">{item.text}</p>
          </div>
        ))}
        {lines.length === 0 && <p className="text-sm text-white/45">Nothing yet.</p>}
      </div>
      {choices.length > 0 && (
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
      {selected && (
        <button type="button" className="mt-4 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={publish}>POST</button>
      )}
      {posted && (
        <button type="button" className="mt-3 block text-xs text-white/45" aria-label="Remove my currently posted comment" onClick={remove}>Remove</button>
      )}
      {role === "none" && <p className="mt-4 text-sm text-white/45">Join to leave a comment.</p>}
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
    </WizardDialog>,
    document.body,
  );
}
