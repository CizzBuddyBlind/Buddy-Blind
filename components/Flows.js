"use client";

import { useMemo, useState } from "react";
import { useBB } from "./Providers";
import { translate } from "@/lib/i18n";
import {
  AGE_RANGES,
  TIMES,
  adminFee,
  bookingHold,
  iso,
  nextDays,
  prettyDate,
  tablePrefs,
} from "@/lib/bible";

export function HostBadge({ handle = "?", tier = "bronze" }) {
  const letter = String(handle || "?").slice(0, 1).toUpperCase();
  const metal = tier === "gold" ? "bg-amber-300 text-ink" : tier === "silver" ? "bg-zinc-200 text-ink" : "bg-amber-700 text-white";
  const label = tier === "gold" ? "Gold" : tier === "silver" ? "Silver" : "Bronze";
  return (
    <span className="relative inline-grid h-9 w-9 shrink-0 place-items-center" title={label}>
      <span className={`absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full px-1 text-[8px] font-bold uppercase leading-3 ${metal}`}>
        {label.slice(0, 1)}
      </span>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-800 font-serif text-sm text-amber-100 ring-1 ring-white/30">
        {letter}
      </span>
    </span>
  );
}

function Frame({ title, step, total, onBack, onClose, children }) {
  const { lang } = useBB();
  const t = (key) => translate(lang, key);
  return (
    <div className="fixed inset-0 z-[85] grid place-items-end bg-black/75 p-3 sm:place-items-center" role="dialog">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-auto rounded-2xl border border-white/10 bg-[#121212] p-5 text-fg shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={onBack || onClose}>
            {t("btn.back")}
          </button>
          <span className="text-[10px] uppercase tracking-[0.16em] text-mute">{step}/{total}</span>
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={onClose}>{t("btn.close")}</button>
        </div>
        <h2 className="mt-3 font-serif text-2xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Choice({ on, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-2 text-left text-sm ${on ? "border-white bg-white text-ink" : "border-white/15 text-fg"}`}>
      {children}
    </button>
  );
}

function PayStep({ fee, checked, setChecked, onConfirm, busy }) {
  const { lang } = useBB();
  const t = (key) => translate(lang, key);
  const paid = fee.total > 0;
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl border border-white/10 p-3">
        <div className="flex justify-between"><span>{t("pay.admin")}</span><span>HK${fee.base.toFixed(2)}</span></div>
        {fee.off > 0 && <div className="mt-1 flex justify-between text-ember"><span>Points {Math.round(fee.off * 100)}%</span><span>− HK${(fee.base - fee.total).toFixed(2)}</span></div>}
        <div className="mt-2 flex justify-between font-semibold"><span>{t("pay.total")}</span><span>HK${fee.total.toFixed(2)}</span></div>
      </div>
      <p className="text-mute">{paid ? t("pay.why") : t("pay.free")}</p>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>{paid ? t("pay.check") : t("pay.freeCheck")}</span>
      </label>
      <p className="text-xs text-mute">{t("pay.emailNote")}</p>
      <button type="button" disabled={!checked || busy} onClick={onConfirm} className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40">
        {paid ? t("pay.confirm") : t("pay.confirmFree")}
      </button>
    </div>
  );
}

export function OpenTableWizard({ venue, onClose }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState(venue.branches?.[0]?.id || "main");
  const [dateISO, setDateISO] = useState(nextDays()[0]);
  const [time, setTime] = useState("7:00 PM");
  const [tableType, setTableType] = useState("meet-friends");
  const [participants, setParticipants] = useState(4);
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const branch = (venue.branches || []).find((b) => b.id === branchId) || venue.branches?.[0];
  const fee = adminFee(bb.session?.points || 0);
  const titles = ["Location", "Date", "Time", "Table type", "Participants", "Preferences", "Summary", "Payment"];

  async function close() {
    if (step > 0) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function confirmPay() {
    setBusy(true);
    const res = await bb.openTable({
      venueId: venue.id,
      branchId: branch?.id,
      dateISO,
      time,
      tableType,
      participants,
      gender,
      orientation,
      ageRange,
    });
    setBusy(false);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) {
      bb.notify(res.error);
      return;
    }
    bb.notify("Table opened · +2 pts");
    onClose();
  }

  return (
    <Frame title={`${titles[step]} · ${venue.name}`} step={step + 1} total={8} onBack={step === 0 ? close : () => setStep((s) => s - 1)} onClose={close}>
      <p className="mb-3 text-xs text-mute">{t("adult.note")}</p>
      {step === 0 && (
        <div className="space-y-2">
          {(venue.branches || []).map((b) => (
            <Choice key={b.id} on={branchId === b.id} onClick={() => setBranchId(b.id)}>
              {b.label} — {b.address}
            </Choice>
          ))}
          <button type="button" className="mt-3 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(1)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-2">
          {nextDays(7).map((day) => (
            <Choice key={day} on={dateISO === day} onClick={() => setDateISO(day)}>{prettyDate(day, bb.lang)}</Choice>
          ))}
          <button type="button" className="col-span-2 mt-2 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(2)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-wrap gap-2">
          {TIMES.map((item) => (
            <Choice key={item} on={time === item} onClick={() => setTime(item)}>{item}</Choice>
          ))}
          <button type="button" className="mt-2 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(3)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Choice on={tableType === "blind-date"} onClick={() => setTableType("blind-date")}>Blind Date</Choice>
            <Choice on={tableType === "meet-friends"} onClick={() => setTableType("meet-friends")}>Meet Friends</Choice>
          </div>
          <button type="button" className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(4)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <p className="mb-2 text-sm text-mute">Maximum 6, including you.</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <Choice key={n} on={participants === n} onClick={() => setParticipants(n)}>{n}</Choice>
            ))}
          </div>
          <button type="button" className="mt-4 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(5)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-mute">Gender · optional</p>
          <div className="flex flex-wrap gap-2">
            {["", "Women", "Men", "Mixed"].map((g) => (
              <Choice key={g || "any"} on={gender === g} onClick={() => setGender(g)}>{g || "No preference"}</Choice>
            ))}
          </div>
          <p className="text-xs uppercase tracking-widest text-mute">Orientation · optional</p>
          <div className="flex flex-wrap gap-2">
            {["", "Gay", "Lesbian", "Dating"].map((g) => (
              <Choice key={g || "any2"} on={orientation === g} onClick={() => setOrientation(g)}>{g || "No preference"}</Choice>
            ))}
          </div>
          <p className="text-xs uppercase tracking-widest text-mute">Age range · optional</p>
          <div className="flex flex-wrap gap-2">
            <Choice on={ageRange === ""} onClick={() => setAgeRange("")}>Any</Choice>
            {AGE_RANGES.map((g) => (
              <Choice key={g} on={ageRange === g} onClick={() => setAgeRange(g)}>{g}</Choice>
            ))}
          </div>
          <button type="button" className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(6)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 6 && (
        <div className="space-y-1 text-sm text-mute">
          <p>Restaurant · {venue.name}</p>
          <p>Location · {branch?.label} · {branch?.address}</p>
          <p>Date · {prettyDate(dateISO, bb.lang)}</p>
          <p>Time · {time}</p>
          <p>Type · {tableType === "blind-date" ? "Blind Date" : "Meet Friends"}</p>
          <p>Participants · {participants} · places after you sit · {participants - 1}</p>
          <p>Gender · {gender || "—"}</p>
          <p>Preference · {[orientation, ageRange].filter(Boolean).join(", ") || "—"}</p>
          <button type="button" className="mt-3 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(7)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 7 && <PayStep fee={fee} checked={checked} setChecked={setChecked} onConfirm={confirmPay} busy={busy} />}
    </Frame>
  );
}

export function JoinWizard({ venue, tableId, onClose }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const tables = useMemo(
    () => (venue.tables || []).map((table) => ({ table, hold: bookingHold(table) })).filter((row) => row.hold.status !== "walk-in"),
    [venue],
  );
  const [picked, setPicked] = useState(tableId || "");
  const [step, setStep] = useState(tableId ? 1 : 0);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const row = tables.find((item) => item.table.id === picked);
  const fee = { base: 0, off: 0, total: 0 };

  async function close() {
    if (step > 0) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function confirmPay() {
    setBusy(true);
    const res = await bb.joinTable({ venueId: venue.id, tableId: picked });
    setBusy(false);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) {
      bb.notify(res.error);
      return;
    }
    bb.notify("You're in · +1 pt");
    onClose();
  }

  return (
    <Frame title={`Join · ${venue.name}`} step={step + 1} total={3} onBack={step === 0 ? close : () => setStep((s) => s - 1)} onClose={close}>
      {step === 0 && (
        <div className="space-y-2">
          {tables.length === 0 && <p className="text-sm text-mute">No open table at this restaurant.</p>}
          {tables.map(({ table, hold }) => (
            <button key={table.id} type="button" onClick={() => setPicked(table.id)} className={`block w-full rounded-xl border p-3 text-left text-sm ${picked === table.id ? "border-white" : "border-white/10"}`}>
              <div className="flex items-center gap-2">
                <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                <div>
                  <div>{prettyDate(table.dateISO, bb.lang)} · {table.time}</div>
                  <div className="text-mute">{hold.places} / {hold.held} open · {tablePrefs(table) || "No extra preference"}</div>
                  {hold.closed && <div className="text-ember">{hold.reason}</div>}
                </div>
              </div>
            </button>
          ))}
          <button type="button" disabled={!picked} className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40" onClick={() => setStep(1)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 1 && row && (
        <div className="space-y-1 text-sm text-mute">
          <p>{venue.name}</p>
          <p>{prettyDate(row.table.dateISO, bb.lang)} · {row.table.time}</p>
          <p>{tablePrefs(row.table) || "Meet friends"}</p>
          <p>{row.hold.places} places left · hold {row.hold.held} · original {row.hold.original}</p>
          <p className="text-xs">{row.hold.reason}</p>
          <button type="button" disabled={row.hold.closed} className="mt-3 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40" onClick={() => setStep(2)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 2 && <PayStep fee={fee} checked={checked} setChecked={setChecked} onConfirm={confirmPay} busy={busy} />}
    </Frame>
  );
}

export function TodayPopup({ onJoin, onBrowse }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const rows = useMemo(() => {
    const key = iso(0);
    const list = [];
    bb.content.venues.forEach((venue) => {
      if (venue.hidden && !bb.editing) return;
      (venue.tables || []).forEach((table) => {
        const hold = bookingHold(table);
        if (table.dateISO === key && hold.places > 0 && hold.places <= 2) {
          list.push({ venue, table, hold });
        }
      });
    });
    return list.sort((a, b) => a.hold.places - b.hold.places);
  }, [bb.content.venues, bb.editing]);
  if (!rows.length) return null;
  return (
    <div className="fixed inset-0 z-[75] grid place-items-end bg-black/70 p-3 sm:place-items-center">
      <div className="max-h-[88dvh] w-full max-w-md overflow-auto rounded-2xl border border-white/10 bg-[#121212] p-5 text-fg">
        <p className="bb-kicker text-ember">Today</p>
        <h2 className="mt-2 font-serif text-2xl">{t("today.title")}</h2>
        <p className="mt-2 text-sm text-mute">{t("today.sub")}</p>
        <div className="mt-4 space-y-3">
          {rows.map(({ venue, table, hold }) => (
            <div key={table.id} className="rounded-xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                <div>
                  <div className="font-medium">{venue.name}</div>
                  <div className="text-xs text-mute">{venue.locationLabel} · {table.time}</div>
                </div>
              </div>
              <p className="mt-2 text-sm">{hold.places === 1 ? t("today.one") : t("today.two")}</p>
              <p className="text-xs text-mute">{tablePrefs(table)}</p>
              <button type="button" className="mt-2 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => onJoin(venue.id, table.id)}>{t("btn.join")}</button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-4 text-sm text-mute" onClick={onBrowse}>{t("today.browse")}</button>
      </div>
    </div>
  );
}

export function TrialGate() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [checked, setChecked] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] p-6 text-fg">
        <p className="bb-kicker text-ember">{t("trial.kicker")}</p>
        <h2 className="mt-2 font-serif text-3xl">{t("trial.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">{t("trial.body")}</p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>{t("trial.check")}</span>
        </label>
        <button type="button" disabled={!checked} onClick={bb.acceptTrial} className="mt-5 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40">
          {t("trial.start")}
        </button>
        <p className="mt-3 text-xs text-mute">{t("trial.note")}</p>
      </div>
    </div>
  );
}

export function PrivateWizard({ onClose }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    forWhom: "Business networking",
    description: "",
    location: "Central",
    dateISO: nextDays(7)[1],
    time: "7:00 PM",
    capacity: 8,
    ageRange: "",
    videoUrl: "",
    showHostPhoto: false,
  });
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const fee = adminFee(bb.session?.points || 0);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function close() {
    if (step > 0 || form.name) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function confirmPay() {
    if (!form.name.trim()) {
      bb.notify("Name the event first.");
      setStep(0);
      return;
    }
    setBusy(true);
    const res = await bb.createPrivate({ ...form, capacity: Number(form.capacity) || 8 });
    setBusy(false);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) {
      bb.notify(res.error);
      return;
    }
    bb.notify("Private event published · +5 pts");
    onClose();
  }

  return (
    <Frame title="Private event" step={step + 1} total={3} onBack={step === 0 ? close : () => setStep((s) => s - 1)} onClose={close}>
      {step === 0 && (
        <div className="space-y-2">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Event name" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <input value={form.forWhom} onChange={(e) => set("forWhom", e.target.value)} placeholder="Who it is for" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What people should expect" className="h-24 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Restaurant or area" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <button type="button" className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(1)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {nextDays(7).map((day) => (
              <Choice key={day} on={form.dateISO === day} onClick={() => set("dateISO", day)}>{prettyDate(day, bb.lang)}</Choice>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TIMES.map((item) => (
              <Choice key={item} on={form.time === item} onClick={() => set("time", item)}>{item}</Choice>
            ))}
          </div>
          <label className="block text-sm text-mute">
            People including you (max 20)
            <input type="number" min={2} max={20} value={form.capacity} onChange={(e) => set("capacity", Math.min(20, Math.max(2, Number(e.target.value) || 2)))} className="mt-1 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-fg" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Choice on={!form.ageRange} onClick={() => set("ageRange", "")}>Any age</Choice>
            {AGE_RANGES.map((g) => (
              <Choice key={g} on={form.ageRange === g} onClick={() => set("ageRange", g)}>{g}</Choice>
            ))}
          </div>
          <input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="Optional video URL" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showHostPhoto} onChange={(e) => set("showHostPhoto", e.target.checked)} />
            Show my host photo on this event only
          </label>
          <p className="text-xs text-mute">Your normal profile stays a letter. A photo here is only for this event, and only if you tick this.</p>
          <button type="button" className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setStep(2)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3 text-sm text-mute">
          <p>{form.name || "Untitled"} · {form.forWhom}</p>
          <p>{form.location} · {prettyDate(form.dateISO, bb.lang)} · {form.time}</p>
          <p>{form.capacity} seats including host · {form.capacity - 1} places left</p>
          <p>{form.description}</p>
          <PayStep fee={fee} checked={checked} setChecked={setChecked} onConfirm={confirmPay} busy={busy} />
        </div>
      )}
    </Frame>
  );
}

export async function shareLink(path, title) {
  const url = `${window.location.origin}${path}`;
  const text = `${title}\n${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      /* user cancelled or unsupported */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copy this event", text);
  }
}
