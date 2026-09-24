"use client";

import { useEffect, useMemo, useState } from "react";
import { fileToCover } from "./Bits";
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
  pingWindow,
  queryHits,
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
    <div className="fixed inset-0 z-[85] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog">
      <div className="bb-sheet max-h-[92dvh] w-full max-w-lg overflow-auto rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg shadow-2xl">
        <div className="mb-4 h-px w-full bg-white/10">
          <div className="h-px bg-ember" style={{ width: `${Math.max(8, (step / total) * 100)}%` }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute hover:text-fg" onClick={onBack || onClose}>
            {t("btn.back")}
          </button>
          <span className="text-[10px] uppercase tracking-[0.16em] text-mute">{step}/{total}</span>
          <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute hover:text-fg" onClick={onClose}>{t("btn.close")}</button>
        </div>
        <h2 className="mt-4 font-serif text-3xl leading-tight">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Choice({ on, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`bb-choice rounded-2xl border px-4 py-3 text-left text-sm ${on ? "border-ember bg-white text-ink" : "border-white/15 text-fg"}`}>
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
        <p className="mt-2 text-xs text-mute">{t("pay.fixed")}</p>
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
  const fee = { base: 5, total: 5 };
  const titles = [t("step.location"), t("step.date"), t("step.time"), t("step.type"), t("step.people"), t("step.prefs"), t("step.summary"), t("step.pay")];

  async function close() {
    if (step > 0) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function confirmPay() {
    setBusy(true);
    const res = await bb.payFee({
      type: "open",
      input: {
        venueId: venue.id,
        branchId: branch?.id,
        dateISO,
        time,
        tableType,
        participants,
        gender,
        orientation,
        ageRange,
      },
    });
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.redirecting) return;
    if (res.error) bb.notify(res.error);
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
  const openId = !tableId && tables.filter((row) => !row.hold.closed && row.hold.places > 0).length === 1
    ? tables.find((row) => !row.hold.closed && row.hold.places > 0).table.id
    : "";
  const [picked, setPicked] = useState(tableId || openId);
  const [step, setStep] = useState(tableId || openId ? 1 : 0);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const row = tables.find((item) => item.table.id === picked) || tables.find((item) => item.table.id === tableId);
  const bookable = tables.filter((row) => !row.hold.closed && row.hold.places > 0);
  const none = !tableId && bookable.length === 0;
  const fee = adminFee();

  async function close() {
    if (step > 0) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function confirmPay() {
    setBusy(true);
    const res = await bb.payFee({ type: "join", input: { venueId: venue.id, tableId: picked || tableId } });
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.redirecting) return;
    if (res.error) bb.notify(res.error);
  }

  if (none) {
    return (
      <div className="fixed inset-0 z-[85] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog">
        <div className="bb-sheet w-full max-w-sm rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg">
          <h2 className="font-serif text-3xl">{t("empty.inviteTitle")}</h2>
          <p className="mt-2 text-sm text-mute">{t("empty.inviteBody")}</p>
          <button type="button" className="mt-6 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => bb.setFlow({ type: "invite", venueId: venue.id })}>
            {t("empty.inviteCta")}
          </button>
          <button type="button" className="mt-3 w-full py-2 text-sm text-mute" onClick={onClose}>{t("btn.close")}</button>
        </div>
      </div>
    );
  }

  return (
    <Frame title={`Join · ${venue.name}`} step={step + 1} total={2} onBack={step === 0 ? close : () => setStep(0)} onClose={close}>
      {step === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-mute">Pick a table.</p>
          {tables.length === 0 && <p className="text-sm text-mute">No open table at this restaurant.</p>}
          {tables.map(({ table, hold }) => (
            <button key={table.id} type="button" onClick={() => setPicked(table.id)} className={`bb-choice block w-full rounded-2xl border p-3 text-left text-sm ${picked === table.id ? "border-ember" : "border-white/10"}`}>
              <div className="flex items-center gap-2">
                <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                <div>
                  <div>{prettyDate(table.dateISO, bb.lang)} · {table.time}</div>
                  <div className="text-mute">{hold.places} open · {tablePrefs(table) || "Meet friends"}</div>
                  {hold.closed && <div className="text-ember">{hold.reason}</div>}
                </div>
              </div>
            </button>
          ))}
          <button type="button" disabled={!picked} className="mt-3 w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40" onClick={() => setStep(1)}>{t("btn.next")}</button>
        </div>
      )}
      {step === 1 && row && (
        <div className="space-y-3">
          <div className="space-y-1 text-sm text-mute">
            <p className="font-serif text-2xl text-fg">{venue.name}</p>
            <p>{row.table.address || venue.locationLabel}</p>
            <p>{prettyDate(row.table.dateISO, bb.lang)} · {row.table.time}</p>
            <p>{tablePrefs(row.table) || "Meet friends"}</p>
            <p>{row.hold.places} places left</p>
          </div>
          <PayStep fee={fee} checked={checked} setChecked={setChecked} onConfirm={confirmPay} busy={busy || row.hold.closed} />
        </div>
      )}
      {step === 1 && !row && <p className="text-sm text-mute">That table is gone. Go back and pick another.</p>}
    </Frame>
  );
}

export function PayDialog({ open, title, lines, onClose, onConfirm, busy }) {
  const [checked, setChecked] = useState(false);
  if (!open) return null;
  return (
    <Frame title={title} step={1} total={1} onBack={onClose} onClose={onClose}>
      <div className="mb-4 space-y-1 text-sm text-mute">
        {lines.filter(Boolean).map((line) => <p key={line}>{line}</p>)}
      </div>
      <PayStep fee={adminFee()} checked={checked} setChecked={setChecked} onConfirm={onConfirm} busy={busy} />
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
    <div className="fixed inset-0 z-[75] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="bb-sheet max-h-[88dvh] w-full max-w-md overflow-auto rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg shadow-2xl">
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

export function LangSwitch({ light = false }) {
  const bb = useBB();
  return (
    <div className={`flex rounded-full border p-0.5 text-[10px] ${light ? "border-black/15 bg-white" : "border-white/20 bg-black/60"}`}>
      {[["en", "EN"], ["zh", "简"], ["zh-HK", "繁"]].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => bb.setLang(id)}
          className={`rounded-full px-2.5 py-1 ${bb.lang === id ? (light ? "bg-char text-paper" : "bg-fg text-ink") : (light ? "text-char" : "text-fg")}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TrialGate() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [checked, setChecked] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4">
      <div className="absolute right-3 top-3 z-[120]">
        <LangSwitch />
      </div>
      <div className="bb-sheet w-full max-w-lg rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg shadow-2xl">
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

export function PrivateWizard({ venueId = "", onClose }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const venues = bb.content.venues.filter((v) => bb.editing || !v.hidden);
  const preset = venues.find((v) => v.id === venueId) || null;
  const [pickedId, setPickedId] = useState(venueId || "");
  const [branchId, setBranchId] = useState("");
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState(preset && (preset.branches || []).length <= 1 ? "details" : "venue");
  const [form, setForm] = useState({
    name: "",
    description: "",
    dateISO: nextDays(7)[1],
    time: "7:00 PM",
    capacity: 8,
    orientation: "",
    gender: "",
    ageRange: "",
    videoUrl: "",
    imageUrl: preset?.imageUrl || "",
  });
  const [uploads, setUploads] = useState([]);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [publishedId, setPublishedId] = useState("");
  const venue = venues.find((v) => v.id === pickedId) || null;
  const branches = venue?.branches || [];
  const branch = branches.find((b) => b.id === branchId) || (branches.length === 1 ? branches[0] : null);
  const fee = adminFee();
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const photos = [...(venue?.gallery?.length ? venue.gallery : venue?.imageUrl ? [venue.imageUrl] : []), ...uploads];
  const location = venue
    ? [venue.name, branch?.label, branch?.address || (!branch ? venue.locationLabel : "")].filter(Boolean).join(" · ")
    : "";

  function chooseVenue(next) {
    setPickedId(next.id);
    setBranchId((next.branches || []).length === 1 ? next.branches[0].id : "");
    setForm((f) => ({ ...f, imageUrl: f.imageUrl || next.imageUrl || "" }));
  }

  async function close() {
    if (phase === "share") {
      onClose();
      return;
    }
    if (phase !== "venue" || form.name || form.description) {
      const ok = await bb.confirm(t("leave.title"), t("leave.body"));
      if (!ok) return;
    }
    onClose();
  }

  async function addPhoto(file) {
    if (!file) return;
    try {
      const imageUrl = await fileToCover(file);
      setUploads((list) => [...list, imageUrl]);
      set("imageUrl", imageUrl);
    } catch {
      bb.notify("That photo didn't load.");
    }
  }

  function addVideo(file) {
    if (!file) return;
    if (file.size > 2_000_000) {
      bb.notify("Keep the video under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("videoUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function publish() {
    if (!venue) return;
    setBusy(true);
    const res = await bb.payFee({
      type: "private-create",
      input: {
        ...form,
        name: form.name.trim() || venue.name,
        venueName: venue.name,
        venueId: venue.id,
        branchId: branch?.id || "",
        location,
        forWhom: [form.orientation, form.gender, form.ageRange].filter(Boolean).join(" · ") || "Anyone",
        capacity: Math.min(20, Math.max(2, Number(form.capacity) || 2)),
        imageUrl: form.imageUrl || venue.imageUrl,
        gallery: photos,
      },
    });
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.redirecting) return;
    if (res.error) bb.notify(res.error);
  }

  async function shareLive() {
    const path = `/share/private/${publishedId}`;
    const lines = [form.name || venue?.name, location, `${form.dateISO} · ${form.time}`, form.description];
    const text = shareText({ path, joined: false, lines });
    try {
      if (navigator.share) await navigator.share({ title: form.name || "Buddy Blind", text, url: `${window.location.origin}${path}` });
      else await navigator.clipboard.writeText(text);
      bb.notify("Copied. Come join me via the link.");
    } catch {
      window.prompt("Copy this", text);
    }
  }

  const found = venues.filter((item) => queryHits(`${item.name} ${item.cuisine || ""} ${item.locationLabel || ""} ${item.area || ""}`, query)).slice(0, 8);

  if (phase === "share") {
    return (
      <Frame title="It's live." step={3} total={3} onBack={onClose} onClose={onClose}>
        <p className="font-serif text-2xl">{form.name || venue?.name}</p>
        <p className="mt-2 text-sm text-mute">{location}</p>
        <p className="mt-1 text-sm text-mute">{form.dateISO} · {form.time} · {form.capacity} seats</p>
        <div className="mt-6 flex gap-2">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={onClose}>Done</button>
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={shareLive}>Share</button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      title={phase === "venue" ? "Where?" : phase === "details" ? "The night" : "Publish"}
      step={phase === "venue" ? 1 : phase === "details" ? 2 : 3}
      total={3}
      onBack={phase === "venue" || (phase === "details" && preset && branches.length <= 1) ? close : () => setPhase(phase === "pay" ? "details" : "venue")}
      onClose={close}
    >
      {phase === "venue" && (
        <div className="space-y-3">
          {!preset && (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a place" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
              <div className="space-y-2">
                {found.map((item) => (
                  <button key={item.id} type="button" onClick={() => chooseVenue(item)} className={`bb-choice block w-full rounded-2xl border px-4 py-3 text-left text-sm ${pickedId === item.id ? "border-ember" : "border-white/15"}`}>
                    <span className="block">{item.name}</span>
                    <span className="text-mute">{item.cuisine || item.typeLabel} · {item.locationLabel}</span>
                  </button>
                ))}
                {query && found.length === 0 && <p className="text-sm text-mute">No place with that name.</p>}
              </div>
            </>
          )}
          {preset && <p className="font-serif text-3xl">{preset.name}</p>}
          {branches.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {branches.map((item) => (
                <Choice key={item.id} on={branchId === item.id} onClick={() => setBranchId(item.id)}>{item.label}</Choice>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={!venue || (branches.length > 1 && !branchId)}
            className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink disabled:opacity-40"
            onClick={() => setPhase("details")}
          >
            {t("btn.next")}
          </button>
        </div>
      )}
      {phase === "details" && venue && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-mute">Venue</p>
          <p className="font-serif text-2xl">{venue.name}</p>
          <p className="text-sm text-mute">{location}</p>
          {branches.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {branches.map((item) => (
                <Choice key={item.id} on={branchId === item.id} onClick={() => setBranchId(item.id)}>{item.label}</Choice>
              ))}
            </div>
          )}
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name the night" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What's the night about?" className="h-24 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <p className="text-xs uppercase tracking-[0.16em] text-mute">Photos</p>
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((src) => (
              <button key={src} type="button" onClick={() => set("imageUrl", src)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${form.imageUrl === src ? "border-ember" : "border-white/15"}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <label className="block text-xs text-mute">
            Upload a photo
            <input type="file" accept="image/*" className="mt-1 block text-xs" onChange={(e) => { addPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <label className="block text-xs text-mute">
            Or a short video
            <input type="file" accept="video/*" className="mt-1 block text-xs" onChange={(e) => { addVideo(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {form.videoUrl && <p className="text-xs text-ember">Video added.</p>}
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
            Seats, including you. Max 20.
            <input type="number" min={2} max={20} value={form.capacity} onChange={(e) => set("capacity", Math.min(20, Math.max(2, Number(e.target.value) || 2)))} className="mt-1 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-fg" />
          </label>
          <p className="text-xs uppercase tracking-[0.16em] text-mute">Who can come · optional</p>
          <div className="flex flex-wrap gap-2">
            {["Any", "Gay", "Lesbian", "Trans"].map((item) => (
              <Choice key={item} on={item === "Any" ? !form.orientation : form.orientation === item} onClick={() => set("orientation", item === "Any" ? "" : item)}>{item}</Choice>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["", "Women", "Men", "Mixed"].map((item) => (
              <Choice key={item || "any-g"} on={form.gender === item} onClick={() => set("gender", item)}>{item || "Any gender"}</Choice>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Choice on={!form.ageRange} onClick={() => set("ageRange", "")}>Any age</Choice>
            {AGE_RANGES.map((item) => (
              <Choice key={item} on={form.ageRange === item} onClick={() => set("ageRange", item)}>{item}</Choice>
            ))}
          </div>
          <button type="button" className="w-full rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setPhase("pay")}>{t("btn.next")}</button>
        </div>
      )}
      {phase === "pay" && (
        <div className="space-y-3 text-sm text-mute">
          <p className="font-serif text-2xl text-fg">{form.name || venue?.name}</p>
          <p>{location}</p>
          <p>{prettyDate(form.dateISO, bb.lang)} · {form.time}</p>
          <p>{Math.min(20, Math.max(2, Number(form.capacity) || 2))} seats</p>
          <p>{[form.orientation, form.gender, form.ageRange].filter(Boolean).join(" · ") || "Anyone"}</p>
          <p>{form.description}</p>
          <PayStep fee={fee} checked={checked} setChecked={setChecked} onConfirm={publish} busy={busy} />
        </div>
      )}
    </Frame>
  );
}

export function rememberReturn() {
  try {
    sessionStorage.setItem("bb_next", window.location.pathname + window.location.search);
  } catch {
    /* private mode */
  }
}

export function shareText({ path, joined, lines }) {
  const url = `${window.location.origin}${path}`;
  const lead = joined ? `I joined. Come join me via ${url}` : `Come join me via ${url}`;
  return `${lead}\n\n${lines.filter(Boolean).join("\n")}`;
}

export function ShareSheet({ open, onClose, joined, lines, path }) {
  const bb = useBB();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);
  if (!open) return null;
  const text = shareText({ path, joined, lines });
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      bb.notify("Copied. Post it as: I joined, or come join me, via the link.");
    } catch {
      window.prompt("Copy this", text);
    }
  }
  async function native() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: "Buddy Blind", text, url: `${window.location.origin}${path}` });
    } catch {
      /* cancelled */
    }
  }
  return (
    <div className="fixed inset-0 z-[85] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" onClick={onClose}>
      <div className="bb-sheet w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg" onClick={(e) => e.stopPropagation()}>
        <p className="bb-kicker text-ember">Share</p>
        <h2 className="mt-2 font-serif text-3xl">{joined ? "I joined." : "Come join me."}</h2>
        <ul className="mt-4 space-y-1 text-sm text-mute">
          {lines.filter(Boolean).map((line) => <li key={line}>{line}</li>)}
        </ul>
        <p className="mt-4 break-all text-sm leading-relaxed">{text}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={onClose}>Close</button>
          {canShare && (
            <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={native}>Share</button>
          )}
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      </div>
    </div>
  );
}

export async function shareLink(path, title) {
  const url = `${window.location.origin}${path}`;
  const text = shareText({ path, joined: false, lines: [title] });
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

const REPLY = {
  "see-you": ["see-ya", "next-time"],
  arrive: ["coming", "next-time"],
};

export function PingBox({ table, joined, onSend }) {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const mode = pingWindow(table);
  const mine = bb.session?.handle;
  const label = { "see-ya": "ping.seeYa", coming: "ping.coming", "next-time": "ping.next" };
  return (
    <div className="mt-3 rounded-xl border border-white/10 p-3 text-sm">
      {!mine && <p className="text-mute">{t("ping.needJoin")}</p>}
      {mine && !joined && <p className="text-mute">{t("ping.needJoin")}</p>}
      {mine && joined && !mode && <p className="text-mute">{t("ping.wait")}</p>}
      {mine && joined && mode && (
        <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => onSend(mode)}>
          {mode === "see-you" ? t("ping.seeYou") : t("ping.areYou")}
        </button>
      )}
      {(table.pings || []).slice().reverse().map((ping) => (
        <div key={ping.id} className="mt-3 border-t border-white/10 pt-2">
          <p>{ping.from} · {ping.kind === "see-you" ? t("ping.seeYou") : t("ping.areYou")}</p>
          {(ping.replies || []).map((reply) => (
            <p key={reply.from + reply.choice} className="text-mute">{reply.from} · {t(label[reply.choice] || "ping.next")}</p>
          ))}
          {mine && joined && ping.from !== mine && !(ping.replies || []).some((r) => r.from === mine) && (
            <div className="mt-2 flex flex-col gap-2">
              {(REPLY[ping.kind] || []).map((choice) => (
                <button key={choice} type="button" className="rounded-full border border-white/15 px-3 py-2 text-left text-xs" onClick={() => bb.replyPing({ venueId: table.venueId, eventId: table.eventId, tableId: table.id, pingId: ping.id, choice })}>
                  {t(label[choice])}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
