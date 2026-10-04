"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBB, peopleYouCanRate } from "@/components/Providers";
import { usePeople } from "@/components/People";
import { PlanWindow } from "@/components/PlanWindow";
import { AGE_RANGES, badgePaint, discountPercent } from "@/lib/bible";
import { personRecord, statsForHandle, TEST_PEOPLE } from "@/lib/people";
import { FinishedEvents, pastStats } from "@/components/PhoneApp";
import { HelpMark } from "@/components/HelpMark";

function historyOf(session, content) {
  const handle = session.handle;
  const books = session.bookings || [];
  const seen = new Set();
  let joined = 0;
  let invited = 0;
  let quick = 0;
  let privJoin = 0;
  let privHost = 0;
  books.forEach((booking) => {
    const key = `${booking.kind || ""}-${booking.id || ""}-${booking.mode || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (booking.kind === "private" && (booking.mode === "create" || booking.mode === "host")) privHost += 1;
    else if (booking.kind === "private") privJoin += 1;
    else if (booking.kind === "quick") quick += 1;
    else if (booking.mode === "invite" || booking.mode === "create") invited += 1;
    else joined += 1;
  });
  (content.events || []).forEach((event) => {
    if (books.some((booking) => booking.id === event.id)) return;
    const onIt = event.hostName === handle || (event.participants || []).some((p) => p.handle === handle);
    if (!onIt) return;
    if (event.kind === "private" && event.hostName === handle) privHost += 1;
    else if (event.kind === "private") privJoin += 1;
    else if (event.kind === "quick") quick += 1;
  });
  (content.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (books.some((booking) => booking.id === table.id)) return;
      const host = table.hostHandle === handle;
      const guest = (table.participants || []).some((p) => p.handle === handle && p.role !== "host");
      if (host) invited += 1;
      else if (guest) joined += 1;
    });
  });
  return { joined, invited, quick, privJoin, privHost };
}

function commentsAbout(handle, content) {
  const peer = (content?.peerReviews || []).filter((review) => review.to === handle);
  if (peer.length) return peer.sort((a, b) => (b.at || 0) - (a.at || 0));
  return (content?.reviews || [])
    .filter((review) => review.handle === handle)
    .map((review, index) => ({
      id: `note-${handle}-${index}`,
      from: "Table",
      to: handle,
      stars: Number(review.stars) || (index % 2 ? 4 : 5),
      body: review.body,
      at: 0,
    }));
}

function starScore(list) {
  const nums = list.map((review) => Number(review.stars)).filter((n) => n > 0);
  if (!nums.length) return 0;
  return Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length);
}

function StarMark({ score }) {
  const full = Math.max(0, Math.min(5, score));
  return (
    <p className="text-sm tracking-widest text-ember" aria-label={full ? `${full} stars` : "No stars yet"}>
      {"★★★★★".slice(0, full)}
      <span className="text-white/25">{"☆☆☆☆☆".slice(full)}</span>
    </p>
  );
}

function canSeeComments(bb) {
  const trial = bb.trial;
  const trialOn = !!(trial?.at && !trial.cancelled && Date.now() - trial.at < (trial.days || 90) * 86400000);
  return bb.plan === "lite" || bb.plan === "premium" || trialOn;
}

function ProfilePage() {
  const bb = useBB();
  const people = usePeople();
  const router = useRouter();
  const search = useSearchParams();
  const { session, social } = bb;
  const [draft, setDraft] = useState(null);
  const [edit, setEdit] = useState(false);
  const [panel, setPanel] = useState("info");
  const [buddy, setBuddy] = useState(null);
  const [page, setPage] = useState(0);
  const [guest, setGuest] = useState(null);
  const [plans, setPlans] = useState(false);
  useEffect(() => {
    setGuest(search.get("u") || null);
  }, [search]);
  useEffect(() => {
    if (!bb.ready) return;
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    if (!sessionId) return;
    let stop = false;
    (async () => {
      try {
        const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (stop || !data?.ok) return;
        bb.setPlan(data.kind, { subscriptionId: data.subscriptionId, customerId: data.customerId });
        bb.notify(data.kind === "premium" ? "You're Premium." : "You're on Lite.");
      } catch { /* stay on the profile */ }
      window.history.replaceState({}, "", "/profile");
    })();
    return () => { stop = true; };
  }, [bb.ready]);
  if (!session) {
    return (
      <main className="bb-frame grid min-h-[70dvh] place-items-center pb-28 text-center">
        <div>
          <p className="bb-kicker text-mute">Profile</p>
          <h1 className="mt-3 font-serif text-3xl">Log in to see your seat.</h1>
          <Link href="/login" className="bb-lead-gap inline-block rounded-full bg-fg px-6 py-3 text-sm font-semibold text-ink">Login</Link>
        </div>
      </main>
    );
  }
  const form = draft || {
    handle: session.handle,
    gender: session.gender || "",
    orientation: session.orientation || "",
    occupation: session.occupation || "",
    neighborhood: session.neighborhood || "",
    ageRange: session.ageRange || "",
    showIdentity: session.showIdentity !== false,
    showPlace: session.showPlace !== false,
  };
  const record = guest ? personRecord(guest, { session, users: bb.users }) : null;
  const other = !!(record && record.id !== session.email);
  const viewed = other ? record : session;
  const profileName = viewed.handle || session.handle;
  const ownBuddies = [
    ...(social.buddies || []).filter((b) => b.status === "accepted"),
    ...(session.role === "founder"
      ? TEST_PEOPLE.filter((person) => person.handle.toLowerCase() !== String(session.handle || "").toLowerCase()).map((person) => ({ id: person.id, name: person.handle, status: "accepted" }))
      : []),
  ].filter((buddy, index, list) => list.findIndex((item) => item.name === buddy.name) === index);
  const buddies = other
    ? (viewed.test ? TEST_PEOPLE.filter((person) => person.handle !== viewed.handle).map((person) => ({ id: person.id, name: person.handle, status: "accepted" })) : [])
    : ownBuddies;
  const pending = other ? [] : (social.buddies || []).filter((b) => b.status === "pending");
  const initial = String(profileName || "B").trim().slice(0, 1).toUpperCase();
  const received = commentsAbout(profileName, bb.content);
  const shown = received.slice(page * 3, page * 3 + 3);
  const canRate = peopleYouCanRate(bb.content, session.handle);
  const stats = other ? statsForHandle(bb.content, profileName) : pastStats(bb);
  const open = canSeeComments(bb);
  const locked = other && !open;
  const who = other
    ? (viewed.showIdentity !== false ? [viewed.gender, viewed.ageRange, viewed.orientation].filter(Boolean).join(" · ") : "")
    : (form.showIdentity ? [form.gender, form.ageRange, form.orientation].filter(Boolean).join(" · ") : "");
  const where = other
    ? (viewed.showPlace !== false ? [viewed.neighborhood && `Lives in ${viewed.neighborhood}`, viewed.occupation && `Works in ${viewed.occupation}`].filter(Boolean).join(" · ") : "")
    : (form.showPlace ? [form.neighborhood && `Lives in ${form.neighborhood}`, form.occupation && `Works in ${form.occupation}`].filter(Boolean).join(" · ") : "");

  function openPanel(next) {
    setPanel(next);
    setBuddy(null);
    setPage(0);
  }

  const points = Number(viewed?.points) || 0;
  const paint = badgePaint(points, bb.content.pointThresholds, "light");
  const off = discountPercent(points, bb.content.pointThresholds);

  function buddyMark(name) {
    const record = personRecord(name, { session, users: bb.users });
    const mark = badgePaint(record?.points || 0, bb.content?.pointThresholds, "dark");
    if (mark.tier === "plain") return { className: "border border-white/15 bg-[#1c1c1c]", style: undefined };
    return { className: mark.className, style: mark.style };
  }

  return (
    <main className="bb-profile-page bb-frame bg-ink">
      <div className="bb-profile-split">
        <section className="bb-profile-card flex flex-col rounded-[28px] bg-[#141414] px-6 py-8 text-[#f5f5f5] ring-1 ring-white/10 md:px-8">
          <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full font-serif text-4xl ${paint.className}`} style={paint.style}>{initial}</div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{profileName}</h1>
            <StarMark score={starScore(received)} />
          </div>
          {who && <p className="mt-2 text-center text-sm text-white/45">{who}</p>}
          {where && <p className="text-center text-sm text-white/45">{where}</p>}
          <p className="mt-1 text-center text-sm text-white/70">{points} points{off ? ` · ${off}% off` : ""}</p>
          {other && (
            <button type="button" className="mt-3 text-xs text-white/45" onClick={() => { router.push("/profile"); setGuest(null); setPage(0); }}>Back</button>
          )}
          <div className="bb-profile-actions mt-6">
            {[
              ["info", String(stats.joined + stats.invited + stats.quick + stats.privJoin + stats.privHost).padStart(2, "0"), "Info"],
              ["buddies", String(buddies.length).padStart(2, "0"), "Buddies"],
              ["review", String(received.length).padStart(2, "0"), "Review"],
            ].map(([id, num, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => openPanel(id)}
                className={`flex min-h-[96px] flex-col items-center justify-center rounded-[22px] ${panel === id ? "bg-ember text-white" : "bg-[#1c1c1c] text-white"}`}
              >
                <span className="text-3xl font-bold leading-none">{num}</span>
                <span className={`mt-1 text-sm ${panel === id ? "text-white/90" : "text-white/45"}`}>{label}</span>
              </button>
            ))}
          </div>

          {panel === "info" && (
            <div className="mt-4 rounded-3xl bg-[#1c1c1c] px-5 py-4 text-left text-sm shadow-sm">
              <p className="flex items-start justify-between gap-3 text-white/70"><span className="min-w-0">Joined</span><span className="shrink-0">{stats.joined}</span></p>
              <p className="mt-2 flex items-start justify-between gap-3 text-white/70"><span className="min-w-0">Invited</span><span className="shrink-0">{stats.invited}</span></p>
              <p className="mt-2 flex items-start justify-between gap-3 text-white/70"><span className="min-w-0">Quick meet</span><span className="shrink-0">{stats.quick}</span></p>
              <p className="mt-2 flex items-start justify-between gap-3 text-white/70"><span className="min-w-0">Private joined</span><span className="shrink-0">{stats.privJoin}</span></p>
              <p className="mt-2 flex items-start justify-between gap-3 text-white/70"><span className="min-w-0">Private hosted</span><span className="shrink-0">{stats.privHost}</span></p>
            </div>
          )}

          {panel === "buddies" && !buddy && (
            <div className="mt-3">
              {!buddies.length && !pending.length && <p className="text-sm text-white/45">No buddies yet.</p>}
              <div className="flex flex-wrap gap-2">
                {pending.map((b) => {
                  const mark = buddyMark(b.name);
                  return (
                  <button key={b.id} type="button" title={`${b.name} · waiting`} onClick={() => setBuddy(b)} className={`grid h-11 w-11 place-items-center rounded-full border border-dashed text-sm ${mark.className}`} style={mark.style}>
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                  );
                })}
                {buddies.map((b) => {
                  const mark = buddyMark(b.name);
                  return (
                  <button key={b.id} type="button" title={b.name} onClick={() => people.openProfile(b.name)} className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg ${mark.className}`} style={mark.style}>
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
          {panel === "buddies" && buddy && !other && (
            <div className="mt-3 rounded-3xl bg-[#1c1c1c] p-4 text-left shadow-sm">
              <button type="button" className="text-xs text-white/45" onClick={() => setBuddy(null)}>Back</button>
              <div className={`mt-3 grid h-14 w-14 place-items-center rounded-full font-serif text-2xl ${buddyMark(buddy.name).className}`} style={buddyMark(buddy.name).style}>{buddy.name.slice(0, 1).toUpperCase()}</div>
              <h2 className="mt-3 text-2xl font-bold">{buddy.name}</h2>
              <p className="mt-1 text-sm text-white/45">{buddy.status === "pending" ? "Waiting" : "Your buddy"}</p>
              {buddy.area && <p className="mt-2 text-sm">{buddy.area}</p>}
              {buddy.note && <p className="text-sm text-mute">{buddy.note}</p>}
              {buddy.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button type="button" className="rounded-full bg-fg px-3 py-1 text-sm text-ink" onClick={() => { bb.respondBuddy(buddy.id, true); setBuddy(null); }}>Accept</button>
                  <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-sm" onClick={() => { bb.respondBuddy(buddy.id, false); setBuddy(null); }}>No</button>
                </div>
              )}
            </div>
          )}

          {panel === "review" && (
            <div className="mt-3">
              {(() => {
                const them = other && canRate.find((person) => person.handle === profileName);
                if (other && !them) return null;
                return (
                  <div className="mb-3 flex justify-end">
                    <button type="button" onClick={() => { if (!open) { setPlans(true); return; } people?.openReview(them || null); }} className="rounded-full bg-[#1c1c1c] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      {other ? "Rate them" : "Rate someone"}
                    </button>
                  </div>
                );
              })()}
              <div className="relative min-h-[9rem]">
                <div className={`space-y-3 ${locked ? "pointer-events-none select-none blur-md" : ""}`}>
                  {!shown.length && <p className="text-sm text-white/45">No comments yet.</p>}
                  {shown.map((review) => (
                    <article key={review.id} className="rounded-3xl bg-[#1c1c1c] px-5 py-4 text-left shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{review.from}</p>
                        <p className="text-sm tracking-widest text-ember">
                          {"★★★★★".slice(0, review.stars || 0)}
                          <span className="text-white/25">{"☆☆☆☆☆".slice(review.stars || 0)}</span>
                        </p>
                      </div>
                      <p className="mt-3 text-[15px] leading-relaxed text-white/80">{review.body}</p>
                    </article>
                  ))}
                </div>
                {locked && (
                  <div className="absolute inset-0 grid place-items-center">
                    <button type="button" onClick={() => setPlans(true)} className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
                      Unlock
                    </button>
                  </div>
                )}
              </div>
              {!locked && received.length > 3 && (
                <div className="mt-4 flex justify-end gap-2">
                  {page > 0 && (
                    <button type="button" aria-label="Previous comments" onClick={() => setPage((n) => Math.max(0, n - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-[#1c1c1c] text-white shadow-sm">‹</button>
                  )}
                  {(page + 1) * 3 < received.length && (
                    <button type="button" aria-label="Next comments" onClick={() => setPage((n) => n + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-[#1c1c1c] text-white shadow-sm">›</button>
                  )}
                </div>
              )}
            </div>
          )}

          {!other && <button type="button" className="mt-4 block text-xs text-white/45" onClick={() => setEdit((v) => !v)}>{edit ? "Close" : "Edit details"}</button>}
          {edit && !other && (
            <form className="mt-3 space-y-2 text-left" onSubmit={(e) => { e.preventDefault(); bb.updateProfile(form); setDraft(null); setEdit(false); }}>
              <label className="block text-xs text-white/45">Username
                <input value={form.handle} onChange={(e) => setDraft({ ...form, handle: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white" />
              </label>
              <label className="block text-xs text-white/45">Gender
                <select value={form.gender} onChange={(e) => setDraft({ ...form, gender: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white">
                  {["Woman", "Man", "Non-binary"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-xs text-white/45">Orientation
                <select value={form.orientation} onChange={(e) => setDraft({ ...form, orientation: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white">
                  {["Straight", "Gay", "Lesbian", "Bi", "Trans"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-xs text-white/45">Age range
                <select value={form.ageRange} onChange={(e) => setDraft({ ...form, ageRange: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white">
                  {!AGE_RANGES.includes(form.ageRange) && form.ageRange && <option>{form.ageRange}</option>}
                  {AGE_RANGES.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.showIdentity} onChange={(e) => setDraft({ ...form, showIdentity: e.target.checked })} />
                Show gender, age, and orientation
              </label>
              <label className="block text-xs text-white/45">Lives in
                <input value={form.neighborhood} onChange={(e) => setDraft({ ...form, neighborhood: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white" />
              </label>
              <label className="block text-xs text-white/45">Work
                <input value={form.occupation} onChange={(e) => setDraft({ ...form, occupation: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 py-2 text-sm text-white" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.showPlace} onChange={(e) => setDraft({ ...form, showPlace: e.target.checked })} />
                Show where I live and work
              </label>
              <button type="submit" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white">Save</button>
            </form>
          )}
        </section>
        <div className="bb-profile-side">
            <FinishedEvents who={other ? profileName : ""} />
            <div className="mt-6">
              <HelpMark section="07" />
            </div>
          </div>
      </div>
      {plans && <PlanWindow onClose={() => setPlans(false)} />}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  );
}
