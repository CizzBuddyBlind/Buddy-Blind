"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { HostBadge, PayStep, useFeeCheckout } from "./Flows";
import { HelpMark } from "./HelpMark";
import { useBB } from "./Providers";
import { TIMES, queryHits } from "@/lib/bible";
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
      address: address.trim(),
      detail: post.trim(),
      spots: Math.max(1, capacity - 1),
      capacity,
      hidden: false,
      hostUserId: bb.session?.userId || "",
      hostHandle: bb.session?.handle || "",
      hostName: bb.session?.handle || "",
      participants: [{ userId: bb.session?.userId || "", handle: bb.session?.handle || "", role: "host" }],
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=60",
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
    setStep("own-pay");
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
        <div className="fixed inset-0 z-[85] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" onClick={close}>
          <div className="bb-sheet max-h-[92dvh] w-full max-w-lg overflow-auto rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={() => (step === "post" ? close() : setStep(step === "choose" ? "post" : step === "area" || step === "own" ? "choose" : "own"))}>Back</button>
              <button type="button" className="text-xs uppercase tracking-[0.14em] text-mute" onClick={close}>Close</button>
            </div>
            <div className="mt-4">
          {step === "post" && (
            <div>
              <p className="text-sm">What are you up for?</p>
              <textarea value={post} maxLength={140} onChange={(e) => { setPost(e.target.value); setError(""); }} placeholder="I work in Central, looking for a lunch buddy." className="mt-3 w-full rounded-2xl border border-white/15 px-3 py-2 text-sm outline-none" rows={3} />
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
              <input value={place} onChange={(e) => { setPlace(e.target.value); setNote(""); }} placeholder="Central, CWB, TST…" className="mt-3 w-full rounded-full border border-white/15 px-4 py-2.5 text-sm outline-none" />
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
                <input value={restaurant} onChange={(e) => { setRestaurant(e.target.value); setError(""); }} placeholder="Enter a restaurant of your choice" className="mt-2 w-full rounded-full border border-white/15 px-4 py-2.5 text-sm outline-none" />
              </label>
              <p className="text-sm font-medium">You arrange the booking yourself.</p>
              <label className="block text-sm">
                Address (optional)
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter the restaurant address" className="mt-2 w-full rounded-full border border-white/15 px-4 py-2.5 text-sm outline-none" />
              </label>
              <div>
                <p className="text-sm">Time</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIMES.map((item) => (
                    <button key={item} type="button" className={`rounded-full px-3 py-1.5 text-xs ${time === item ? "bg-fg text-ink" : "border border-white/20"}`} onClick={() => setTime(item)}>{item}</button>
                  ))}
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
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function QuickCard({ row, onJoin }) {
  const bb = useBB();
  const people = Array.isArray(row.participants) && row.participants.length
    ? row.participants
    : [{ userId: row.hostUserId || "", handle: row.hostHandle || row.hostName || "?", role: "host" }];
  const cap = Math.max(people.length, Number(row.capacity) || people.length + Number(row.spots || 0));
  const openSeats = Math.max(0, cap - people.length);
  const closed = openSeats === 0;
  const joined = !!bb.session && people.some((person) => person.userId && person.userId === bb.session.userId);
  const time = row.time || "";
  const place = row.area || "";
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 text-black">
      <div className="flex items-center gap-2">
        <HostBadge handle={people[0].handle} userId={people[0].userId || ""} size="feature" />
        <span className="text-sm font-semibold">{people[0].handle}</span>
        {closed && <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">CLOSED</span>}
      </div>
      {row.post && <p className="mt-3 text-sm leading-relaxed">{row.post}</p>}
      <p className="mt-2 text-sm">{row.name}{time ? ` · ${time}` : ""}</p>
      {place && <p className="text-xs text-black/50">{place}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {people.map((person, index) => (
          <HostBadge key={`${person.userId || person.handle}-${index}`} handle={person.handle} userId={person.userId || ""} size="feature" />
        ))}
        {Array.from({ length: openSeats }, (_, index) => (
          <span key={`empty-${index}`} className="h-9 w-9 rounded-full border border-black/15" aria-hidden="true" />
        ))}
      </div>
      {!closed && <p className="mt-2 text-xs text-black/50">{openSeats === 1 ? "1 available seat" : `${openSeats} available seats`}</p>}
      {!closed && !joined && (
        <button type="button" className="mt-3 rounded-full border border-black px-4 py-1.5 text-xs font-semibold" onClick={onJoin}>Join</button>
      )}
    </article>
  );
}
