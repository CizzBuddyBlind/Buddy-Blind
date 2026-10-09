"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { HostBadge, PayStep, useFeeCheckout } from "./Flows";
import { HelpMark } from "./HelpMark";
import { TimeChoices } from "./TimeChoices";
import { WizardDialog, WizardSummary } from "./Wizard";
import { useBB } from "./Providers";
import { AGE_RANGES, bookingHold, iso, queryHits, tableStart } from "@/lib/bible";
import { viewerSeat } from "@/lib/joinOffer";
import { quickJoinState, resolveQuick } from "@/lib/quickFeed";
import { HOST_LINES, JOINER_LINES, signalRows, suggestedTableSize } from "@/lib/quickSocial";
import { SocialBar } from "./SocialMarks";
import { say } from "@/lib/say";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const URL = /(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|hk|io|me|co)\b/i;
const HANDLE = /(^|\s)@[A-Za-z0-9._]{2,}/;
const SOCIAL = /\b(?:whatsapp|wechat|weixin|telegram|instagram|snapchat|signal|t\.me|line\s*id)\b/i;

function contactBlocked(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  if (EMAIL.test(raw) || URL.test(raw) || HANDLE.test(raw) || SOCIAL.test(raw)) return true;
  const withoutTime = raw.replace(/\b\d{1,2}:\d{2}\b/g, " ");
  return /(?:\d[\s().+-]*){8,}/.test(withoutTime);
}

function normalizePlace(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchPartner(name, venues) {
  const wanted = normalizePlace(name);
  if (wanted.length < 3) return null;
  return (venues || []).find((venue) => venue && !venue.hidden && normalizePlace(venue.name) === wanted) || null;
}

export function QuickStart({ locate, tone = "desk" }) {
  const bb = useBB();
  const [step, setStep] = useState("idle");
  const [post, setPost] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState(false);
  const [restaurant, setRestaurant] = useState("");
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("1:00 PM");
  const [capacity, setCapacity] = useState(2);
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [partnerHit, setPartnerHit] = useState(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  function start() {
    setError("");
    setStep("post");
  }

  function continuePost() {
    const text = post.trim();
    if (!text) {
      setError("Write a short post first.");
      return;
    }
    if (contactBlocked(text)) {
      setError("Keep contact details off the post. You'll meet in person.");
      return;
    }
    setError("");
    setPost(text);
    setStep("choose");
  }

  function usePartner(venueId) {
    bb.setFlow({ type: "quick-invite", venueId, post: post.trim() });
    setStep("idle");
  }

  const publishPay = useFeeCheckout(async () => {
    const res = await bb.insertEvent({
      id: `own-${Date.now().toString(36)}`,
      kind: "quick",
      source: "own",
      name: restaurant.trim(),
      post: post.trim(),
      typeLabel: "NOW",
      timeLabel: `TODAY · ${time}`,
      time,
      dateISO: iso(0),
      address: address.trim(),
      detail: post.trim(),
      spots: Math.max(0, capacity - 1),
      capacity,
      tableType: "meet-friends",
      gender,
      orientation,
      ageRange,
      hidden: false,
      hostUserId: bb.session?.userId || "",
      hostHandle: bb.session?.handle || "",
      hostName: bb.session?.handle || "",
      participants: [{ userId: bb.session?.userId || "", handle: bb.session?.handle || "", role: "host" }],
    }, 2);
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) {
      setError(res.error);
      return;
    }
    setStep("idle");
    setError("");
    bb.notify("Posted. You arrange the restaurant yourself.");
  });

  function close() {
    setError("");
    setAsk(false);
    setStep("idle");
  }

  function shareLocation() {
    setAsk(false);
    if (!navigator.geolocation) {
      setNote(say(bb.lang, "Location isn't available here. Type an area."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = typeof locate === "function" ? locate(pos.coords.latitude, pos.coords.longitude) : "Central";
        setPlace(found || "Central");
        setNote("");
      },
      () => setNote(say(bb.lang, "Couldn't get your location. Type an area.")),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function reviewOwn() {
    const hit = matchPartner(restaurant, bb.content.venues || []);
    if (hit) {
      setPartnerHit(hit);
      setStep("partner-match");
      return;
    }
    if (!restaurant.trim()) {
      setError("Add the restaurant.");
      return;
    }
    setError("");
    setStep("own-prefs");
  }

  function back() {
    const prev = {
      choose: "post",
      area: "choose",
      own: "choose",
      "own-prefs": "own",
      "own-summary": "own-prefs",
      "own-pay": "own-summary",
      "partner-match": "own",
    }[step];
    if (!prev) close();
    else setStep(prev);
  }

  const placeQuery = place.trim().toLowerCase();
  const matches = placeQuery
    ? (bb.content.venues || []).filter((venue) => !venue.hidden && queryHits(`${venue.name} ${venue.area || ""} ${venue.locationLabel || ""} ${venue.address || ""} ${(venue.branches || []).map((branch) => `${branch.label} ${branch.address} ${branch.area}`).join(" ")}`, placeQuery))
    : [];
  const light = tone === "app";
  const freeBtn = light
    ? "rounded-full border border-black/20 px-5 py-2 text-sm"
    : "rounded-full border border-char px-5 py-2 text-sm";

  return (
    <div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" className={freeBtn} onClick={start}>{say(bb.lang, "I'm free now")}</button>
        <HelpMark section="03" />
      </div>
      {step !== "idle" && typeof document !== "undefined" && createPortal(
        <WizardDialog onBack={back} onClose={close} backdropClose>
          {step === "post" && (
            <div>
              <p className="text-sm">What are you up for?</p>
              <textarea value={post} maxLength={140} onChange={(e) => { setPost(e.target.value); setError(""); }} placeholder="I work in Central, looking for a lunch buddy." className="mt-3 w-full rounded-2xl border border-white/15 bg-white px-3 py-2 text-sm text-char caret-char outline-none placeholder:text-black/40 focus:border-ember selection:bg-ember selection:text-ink" rows={3} />
              {error && <p className="mt-2 text-sm text-ember">{error}</p>}
              <button type="button" className="mt-3 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={continuePost}>Continue</button>
            </div>
          )}
          {step === "choose" && (
            <div>
              <p className="text-sm">Where do you want to meet?</p>
              <button type="button" className="mt-3 block w-full rounded-2xl border border-white/15 p-3 text-left" onClick={() => setStep("area")}>
                <span className="block text-sm font-semibold">Partner restaurant</span>
                <span className="block text-xs text-white/55">Choose a Buddy Blind restaurant. Buddy Blind handles the restaurant booking.</span>
              </button>
              <button type="button" className="mt-2 block w-full rounded-2xl border border-white/15 p-3 text-left" onClick={() => setStep("own")}>
                <span className="block text-sm font-semibold">Your own choice</span>
                <span className="block text-xs text-white/55">Choose another restaurant yourself. You arrange the restaurant yourself.</span>
              </button>
              <button type="button" className="mt-3 text-xs text-white/45" onClick={() => setStep("post")}>Back</button>
            </div>
          )}
          {step === "area" && (
            <div>
              <p className="text-sm">{say(bb.lang, "Where are you?")}</p>
              <input value={place} onChange={(e) => { setPlace(e.target.value); setNote(""); }} placeholder="Central, CWB, TST…" className="mt-3 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40 focus:border-ember selection:bg-ember selection:text-ink" />
              <button type="button" className="mt-3 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => setAsk(true)}>{say(bb.lang, "Nearby")}</button>
              {ask && (
                <div className="mt-3 rounded-xl bg-white/5 p-3">
                  <p className="text-sm">{say(bb.lang, "Share your location? We only use it to show places near you.")}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={shareLocation}>{say(bb.lang, "Share")}</button>
                    <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-xs" onClick={() => setAsk(false)}>{say(bb.lang, "Not now")}</button>
                  </div>
                </div>
              )}
              {note && <p className="mt-3 text-sm text-white/55">{note}</p>}
              {placeQuery && (
                <div className="mt-4 space-y-2">
                  {!matches.length && <p className="text-sm text-white/55">{say(bb.lang, "Nothing there. Try another area.")}</p>}
                  {matches.map((venue) => (
                    <button key={venue.id} type="button" className="flex w-full items-center gap-3 rounded-xl border border-white/15 p-2 text-left" onClick={() => usePartner(venue.id)}>
                      <img src={venue.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span>
                        <span data-keep className="block text-sm font-medium">{venue.name}</span>
                        <span className="block text-xs text-white/55">{venue.locationLabel}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="mt-3 text-xs text-white/45" onClick={() => setStep("choose")}>Back</button>
            </div>
          )}
          {step === "own" && (
            <div className="space-y-3">
              <p className="text-sm">“{post.trim()}”</p>
              <label className="block text-sm">
                Restaurant
                <input value={restaurant} onChange={(e) => { setRestaurant(e.target.value); setError(""); }} placeholder="Enter a restaurant of your choice" className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40 focus:border-ember selection:bg-ember selection:text-ink" />
              </label>
              <p className="text-sm font-medium">You arrange the booking yourself.</p>
              <label className="block text-sm">
                Address (optional)
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter the restaurant address" className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40 focus:border-ember selection:bg-ember selection:text-ink" />
              </label>
              <div>
                <p className="text-sm">Time</p>
                <div className="mt-2">
                  <TimeChoices value={time} onChange={setTime} renderChoice={(label, on, pick) => (
                    <button key={label} type="button" className={`rounded-full px-3 py-1.5 text-xs ${on ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={pick}>{label}</button>
                  )} />
                </div>
              </div>
              <div>
                <p className="text-sm">Maximum group size</p>
                <div className="mt-2 flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button key={n} type="button" className={`rounded-full px-4 py-1.5 text-xs ${capacity === n ? "bg-fg text-ink" : "border border-white/20"}`} onClick={() => setCapacity(n)}>{n}</button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-ember">{error}</p>}
              <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={reviewOwn}>Continue</button>
              <button type="button" className="ml-3 text-xs text-white/45" onClick={() => setStep("choose")}>Back</button>
            </div>
          )}
          {step === "own-prefs" && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-white/45">Gender · optional</p>
              <div className="flex flex-wrap gap-2">
                {["", "Women", "Men"].map((item) => (
                  <button key={item || "any"} type="button" className={`rounded-full px-3 py-1.5 text-xs ${gender === item ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={() => setGender(item)}>{item || "No preference"}</button>
                ))}
              </div>
              <p className="text-xs uppercase tracking-widest text-white/45">Orientation · optional</p>
              <div className="flex flex-wrap gap-2">
                {["", "Gay", "Lesbian", "LGBTQ+", "Straight"].map((item) => (
                  <button key={item || "any2"} type="button" className={`rounded-full px-3 py-1.5 text-xs ${orientation === item ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={() => setOrientation(item)}>{item || "No preference"}</button>
                ))}
              </div>
              <p className="text-xs uppercase tracking-widest text-white/45">Age range · optional</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`rounded-full px-3 py-1.5 text-xs ${ageRange === "" ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={() => setAgeRange("")}>Any</button>
                {AGE_RANGES.map((item) => (
                  <button key={item} type="button" className={`rounded-full px-3 py-1.5 text-xs ${ageRange === item ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={() => setAgeRange(item)}>{item}</button>
                ))}
              </div>
              <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => setStep("own-summary")}>Continue</button>
              <button type="button" className="ml-3 text-xs text-white/45" onClick={() => setStep("own")}>Back</button>
            </div>
          )}
          {step === "own-summary" && (
            <WizardSummary actions={(
              <>
                <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => setStep("own-pay")}>Continue</button>
                <button type="button" className="ml-3 text-xs text-white/45" onClick={() => setStep("own-prefs")}>Back</button>
              </>
            )}>
              <p className="text-fg">“{post.trim()}”</p>
              <p>{restaurant.trim()} · {time} · up to {capacity}</p>
              {address.trim() && <p>{address.trim()}</p>}
              <p>Meet Friends</p>
              <p>{[gender, orientation, ageRange].filter(Boolean).join(" · ") || "No extra preferences"}</p>
              <p className="font-medium text-fg">You arrange the booking yourself.</p>
            </WizardSummary>
          )}
          {step === "partner-match" && partnerHit && (
            <div>
              <p className="text-sm font-semibold">This is a Buddy Blind partner restaurant.</p>
              <p className="mt-2 text-sm text-white/60">{partnerHit.name}. Buddy Blind handles the restaurant booking.</p>
              <button type="button" className="mt-3 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => usePartner(partnerHit.id)}>Continue with {partnerHit.name}</button>
              <button type="button" className="mt-3 block text-xs text-white/45" onClick={() => setStep("own")}>Back</button>
            </div>
          )}
          {step === "own-pay" && (
            <div>
              <p className="text-sm font-semibold">{restaurant}</p>
              <p className="text-sm">Today · {time} · up to {capacity}</p>
              {address && <p className="text-sm text-white/60">{address}</p>}
              <p className="mt-2 text-sm">“{post.trim()}”</p>
              <p className="mt-2 text-sm font-medium">You arrange the booking yourself.</p>
              <div className="mt-4 rounded-2xl bg-[#101010] p-4 text-fg">
                <PayStep checked={checked} setChecked={setChecked} onConfirm={publishPay.start} busy={publishPay.busy} error={error || publishPay.error} />
              </div>
              <button type="button" className="mt-3 text-xs text-white/45" onClick={() => setStep("own")}>Back</button>
            </div>
          )}
        </WizardDialog>,
        document.body,
      )}
    </div>
  );
}

function preferenceLine(row) {
  const type = row.tableType === "blind-date" ? "Blind Date" : row.tableType === "meet-friends" ? "Meet Friends" : "";
  return [type, row.gender, row.orientation, row.ageRange ? `Age ${row.ageRange}` : ""].filter(Boolean).join(" · ");
}

function venueFor(row, venues) {
  if (row?.source === "own") return null;
  const key = String(row?.name || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
  if (!key) return null;
  return (venues || []).find((item) => {
    const name = String(item?.name || "").toLowerCase();
    return name === key || name.startsWith(key) || key.startsWith(name);
  }) || null;
}

function stopControl(event) {
  event.stopPropagation();
}

export function QuickCard({ row, onJoin, onOpen }) {
  const bb = useBB();
  const live = resolveQuick(row, bb.content);
  const seat = quickJoinState(live, bb.session);
  const { people, openSeats, closed } = seat;
  const when = live.time ? [live.name, live.time].filter(Boolean).join(" · ") : [live.name, live.timeLabel].filter(Boolean).join(" · ");
  const prefs = preferenceLine(live);
  const area = live.area || "";
  const bookedText = signalRows(live, people).find((item) => item.system)?.text || "";
  return (
    <article
      className="cursor-pointer rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-black"
      onClick={(event) => {
        if (event.target.closest("button, a, input, textarea")) return;
        onOpen?.();
      }}
    >
      <div className="flex items-start gap-2">
        {people[0] && (
          <span className="mt-0.5 shrink-0" onClick={stopControl} onMouseDown={stopControl}>
            <HostBadge handle={people[0].handle} userId={people[0].userId || ""} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {live.post && <p className="text-base leading-snug text-black [overflow-wrap:anywhere]">{live.post}</p>}
          {when && <p className={`text-sm leading-snug text-black [overflow-wrap:anywhere] ${live.post ? "mt-1" : ""}`}>{when}</p>}
          {(prefs || area) && <p className="mt-0.5 text-xs leading-snug text-black/55 [overflow-wrap:anywhere]">{[prefs, area].filter(Boolean).join(" · ")}</p>}
          {bookedText && <p className="mt-2 text-sm text-black">{bookedText}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {people.length > 0 && (
              <span className="flex items-center gap-1">
                {people.map((person, index) => (
                  <span key={`${person.userId || person.handle}-${index}`} onClick={stopControl} onMouseDown={stopControl}>
                    <HostBadge handle={person.handle} userId={person.userId || ""} />
                  </span>
                ))}
              </span>
            )}
            {!closed && openSeats > 0 && (
              <span className="text-xs text-black/55">{openSeats === 1 ? "1 available seat" : `${openSeats} available seats`}</span>
            )}
            {closed && <span className="text-[10px] font-semibold tracking-[0.14em] text-black/45">CLOSED</span>}
            <SocialBar target={live} people={people} tone="light" />
            {seat.canJoin && (
              <button type="button" className="ml-auto rounded-full border border-black px-3 py-1 text-[11px] font-semibold text-black" onClick={(event) => { stopControl(event); onJoin?.(); }}>JOIN</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function QuickDetail({ row, onClose, onJoin }) {
  const bb = useBB();
  const live = resolveQuick(row, bb.content);
  const seat = quickJoinState(live, bb.session);
  const { people, openSeats, closed, joined } = seat;
  const host = joined && live.hostUserId && live.hostUserId === bb.session?.userId;
  const venue = venueFor(live, bb.content?.venues);
  const photo = live.source === "own" ? "" : (venue?.imageUrl || "");
  const prefs = preferenceLine(live);
  const partnerLine = partnerBookedLine(live, venue, bb.session);
  const ownLine = live.source === "own" && live.booked && live.bookingName ? `Table booked under ${live.bookingName} at ${live.time || "the arranged time"} at ${live.name}.` : "";
  const hoursLeft = live.time ? (tableStart({ dateISO: live.dateISO || iso(0), time: live.time }).getTime() - Date.now()) / 3600000 : 99;
  const canDecide = live.source === "own" && host && people.length >= 2 && hoursLeft <= 2 && !live.booked && !live.walkIn && !live.booking?.booked;
  const role = viewerSeat(live, bb.session);
  const [meetingNote, setMeetingNote] = useState("");
  const [error, setError] = useState("");
  const [showBook, setShowBook] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [bookAddress, setBookAddress] = useState("");
  const [bookTime, setBookTime] = useState(live.time || "");
  const [tableSize, setTableSize] = useState("");
  const [reserveName, setReserveName] = useState("");
  if (!row || typeof document === "undefined") return null;
  const activeCode = role === "host"
    ? live.hostSignal?.code
    : (live.signals || []).find((item) => item.userId && item.userId === bb.session?.userId)?.code;
  async function saveWalk() {
    if (contactBlocked(meetingNote)) {
      setError("Keep contact details off the meeting note. You'll meet in person.");
      return;
    }
    const res = await bb.decideOwnQuick?.(row.id, { choice: "walk", meetingNote });
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) setError(res.error);
    else setError("");
  }
  function openBook() {
    const saved = live.booking?.booked ? live.booking : null;
    setVenueName(saved?.venueName || live.name || "");
    setBookAddress(saved ? (saved.address || "") : (live.address || ""));
    setBookTime(saved?.time || live.time || "");
    setTableSize(String(saved?.tableSize || suggestedTableSize(live)));
    setReserveName(saved?.bookingName || "");
    setError("");
    setShowBook(true);
  }
  async function confirmBook() {
    const res = await bb.confirmOwnQuickBooking?.(live.id, {
      venueName,
      address: bookAddress,
      time: bookTime,
      tableSize: Number(tableSize),
      bookingName: reserveName,
    });
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) setError(res.error);
    else {
      setError("");
      setShowBook(false);
    }
  }
  async function pickLine(code) {
    const res = await bb.setQuickSignal?.(live, code);
    if (res?.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res?.error) setError(res.error);
    else setError("");
  }
  return createPortal(
    <WizardDialog onClose={onClose} backdropClose>
        {photo && <img src={photo} alt="" className="h-36 w-full rounded-2xl object-cover" />}
        {live.post && <p className="mt-4 text-sm leading-snug [overflow-wrap:anywhere]">{live.post}</p>}
        <p className="mt-2 text-sm [overflow-wrap:anywhere]">{[live.name, live.time || live.timeLabel].filter(Boolean).join(" · ")}</p>
        {live.source === "own" && live.address && <p className="mt-1 text-sm text-white/60 [overflow-wrap:anywhere]">{live.address}</p>}
        {live.source !== "own" && venue?.locationLabel && <p className="mt-1 text-sm text-white/60">{venue.locationLabel}</p>}
        {prefs && <p className="mt-1 text-sm text-white/70">{prefs}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {people.map((person, index) => (
            <HostBadge key={`${person.userId || person.handle}-${index}`} handle={person.handle} userId={person.userId || ""} />
          ))}
          {seat.cap > 0 && Array.from({ length: openSeats }, (_, index) => (
            <span key={`empty-${index}`} className="h-5 w-5 rounded-full border border-white/25" aria-hidden="true" />
          ))}
        </div>
        {!closed && openSeats > 0 && <p className="mt-2 text-xs text-white/55">{openSeats === 1 ? "1 available seat" : `${openSeats} available seats`}</p>}
        {closed && <p className="mt-2 text-[10px] font-semibold tracking-[0.14em] text-white/55">CLOSED</p>}
        <div className="mt-3"><LikeMark row={live} tone="detail" /></div>
        <QuickSignals row={live} people={people} tone="detail" />
        {live.source === "own" && !live.booking?.booked && <p className="mt-3 text-sm text-white/70">You arrange the restaurant yourself. Buddy Blind does not book this table.</p>}
        {joined && ownLine && !live.booking?.booked && (
          <div className="mt-4 text-sm">
            <p className="font-semibold">TABLE BOOKED</p>
            <p>{ownLine}</p>
          </div>
        )}
        {joined && !ownLine && partnerLine && (
          <div className="mt-4 text-sm">
            <p className="font-semibold">TABLE BOOKED</p>
            <p>{partnerLine}</p>
          </div>
        )}
        {joined && live.source === "own" && live.meetingNote && <p className="mt-3 text-sm text-white/70">{live.meetingNote}</p>}
        {showBook ? (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <p className="text-sm font-semibold">Table booked</p>
            <label className="block text-sm">
              Restaurant
              <input value={venueName} onChange={(event) => setVenueName(event.target.value)} className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40" />
            </label>
            <label className="block text-sm">
              Address
              <input value={bookAddress} onChange={(event) => setBookAddress(event.target.value)} placeholder="Optional" className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40" />
            </label>
            <div>
              <p className="text-sm">Time</p>
              <div className="mt-2">
                <TimeChoices value={bookTime} onChange={setBookTime} renderChoice={(label, on, pick) => (
                  <button key={label} type="button" className={`rounded-full px-3 py-1.5 text-xs ${on ? "bg-fg text-ink" : "border border-white/20 text-fg"}`} onClick={pick}>{label}</button>
                )} />
              </div>
            </div>
            <label className="block text-sm">
              Table size
              <input value={tableSize} inputMode="numeric" onChange={(event) => setTableSize(event.target.value.replace(/[^\d]/g, ""))} className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40" />
            </label>
            <label className="block text-sm">
              What name should everyone ask for when they arrive?
              <input value={reserveName} onChange={(event) => setReserveName(event.target.value)} className="mt-2 w-full rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm text-char caret-char outline-none placeholder:text-black/40" />
            </label>
            {error && <p className="text-sm text-ember">{error}</p>}
            <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={confirmBook}>Confirm table booked</button>
            <button type="button" className="ml-3 text-xs text-white/45" onClick={() => { setError(""); setShowBook(false); }}>Back</button>
          </div>
        ) : (
          <>
            {role === "member" && <LinePicker lines={JOINER_LINES} active={activeCode} onPick={pickLine} />}
            {role === "host" && <LinePicker lines={HOST_LINES} active={activeCode} onPick={pickLine} />}
            {role === "host" && live.source === "own" && (
              <button type="button" className="mt-4 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={openBook}>Table booked</button>
            )}
            {error && !canDecide && <p className="mt-3 text-sm text-ember">{error}</p>}
            {canDecide && (
              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <p className="text-sm">Two hours out. Walking in?</p>
                <label className="block text-sm">
                  Meeting details
                  <textarea value={meetingNote} onChange={(event) => setMeetingNote(event.target.value)} rows={2} className="mt-2 w-full rounded-2xl border border-white/15 bg-white px-3 py-2 text-sm text-char caret-char outline-none placeholder:text-black/40" placeholder="Where to meet, if you are walking in" />
                </label>
                <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-xs text-fg" onClick={saveWalk}>Walk in</button>
                {error && <p className="text-sm text-ember">{error}</p>}
              </div>
            )}
          </>
        )}
        {seat.canJoin && (
          <button type="button" className="mt-4 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={onJoin}>JOIN</button>
        )}
    </WizardDialog>,
    document.body,
  );
}

function socialQuick(row) {
  return row?.source === "partner" || row?.source === "own";
}

function LikeMark({ row, tone = "card" }) {
  const bb = useBB();
  if (!socialQuick(row)) return null;
  const likes = Array.isArray(row.likes) ? row.likes : [];
  const mine = !!(bb.session?.userId && likes.includes(bb.session.userId));
  const dark = tone === "detail";
  return (
    <button
      type="button"
      aria-pressed={mine}
      aria-label={mine ? "Unlike" : "Like"}
      className={`text-sm ${mine ? (dark ? "text-fg" : "text-black") : (dark ? "text-white/70" : "text-black/55")}`}
      onClick={async (event) => {
        stopControl(event);
        const res = await bb.likeQuick?.(row);
        if (res?.needLogin) {
          window.location.href = "/login";
          return;
        }
        if (res?.error) bb.notify?.(res.error);
      }}
    >
      {mine ? "♥" : "♡"} {likes.length}
    </button>
  );
}

function QuickSignals({ row, people, tone = "card" }) {
  if (!socialQuick(row)) return null;
  const lines = signalRows(row, people);
  if (!lines.length) return null;
  const dark = tone === "detail";
  return (
    <div className={dark ? "mt-4 space-y-2" : "mt-2 space-y-1.5"}>
      {lines.map((item) => item.system ? (
        <p key={item.key} className={`text-sm ${dark ? "text-fg" : "text-black"}`}>{item.text}</p>
      ) : (
        <div key={item.key} className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0" onClick={stopControl} onMouseDown={stopControl}>
            <HostBadge handle={item.person.handle} userId={item.person.userId || ""} />
          </span>
          <p className={`text-sm leading-snug [overflow-wrap:anywhere] ${dark ? "text-white/80" : "text-black/75"}`}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function LinePicker({ lines, active, onPick }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {lines.map((line) => (
        <button
          key={line.code}
          type="button"
          className={`rounded-2xl px-3 py-2 text-left text-sm ${active === line.code ? "bg-fg text-ink" : "border border-white/20 text-fg"}`}
          onClick={() => onPick(line.code)}
        >
          {line.text}
        </button>
      ))}
    </div>
  );
}

function partnerBookedLine(row, venue, session) {
  if (!venue || row?.source === "own" || !session?.userId) return "";
  const mine = (table) => table.hostUserId === session.userId || (table.participants || []).some((person) => person.userId === session.userId);
  const table = (venue.tables || []).find((item) => item && !item.auto && mine(item) && bookingHold(item).status === "reserved");
  if (!table?.hostHandle) return "";
  return `Table booked under ${table.hostHandle} at ${table.time} at ${venue.name}.`;
}
