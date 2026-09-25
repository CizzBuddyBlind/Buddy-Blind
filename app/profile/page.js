"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB, peopleYouCanRate } from "@/components/Providers";
import { AGE_RANGES, badgePaint, discountPercent } from "@/lib/bible";
import { JoinedEvents } from "@/components/PhoneApp";

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

export default function ProfilePage() {
  const bb = useBB();
  const { session, social } = bb;
  const [draft, setDraft] = useState(null);
  const [edit, setEdit] = useState(false);
  const [panel, setPanel] = useState("info");
  const [buddy, setBuddy] = useState(null);
  const [page, setPage] = useState(0);
  const [rateOpen, setRateOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState("");
  if (!session) {
    return (
      <main className="bb-frame grid min-h-[70dvh] place-items-center pb-28 text-center">
        <div>
          <p className="bb-kicker text-mute">Profile</p>
          <h1 className="mt-3 font-serif text-3xl">Log in to see your seat.</h1>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-fg px-6 py-3 text-sm font-semibold text-ink">Login</Link>
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
  const buddies = (social.buddies || []).filter((b) => b.status === "accepted");
  const pending = (social.buddies || []).filter((b) => b.status === "pending");
  const initial = String(session.handle || "B").trim().slice(0, 1).toUpperCase();
  const received = (bb.content.peerReviews || [])
    .filter((review) => review.to === session.handle)
    .sort((a, b) => (b.at || 0) - (a.at || 0));
  const shown = received.slice(page * 3, page * 3 + 3);
  const canRate = peopleYouCanRate(bb.content, session.handle);
  const stats = historyOf(session, bb.content);
  const who = [form.gender, form.ageRange, form.orientation].filter(Boolean).join(" · ");
  const where = [form.neighborhood && `Lives in ${form.neighborhood}`, form.occupation && `Works in ${form.occupation}`].filter(Boolean).join(" · ");

  function openPanel(next) {
    setPanel(next);
    setBuddy(null);
    setPage(0);
  }

  const points = Number(session.points) || 0;
  const paint = badgePaint(points, bb.content.pointThresholds, "light");
  const off = discountPercent(points, bb.content.pointThresholds);

  return (
    <main className="bb-frame min-h-[100dvh] bg-ink pb-28 md:pb-8">
      <div className="grid items-start gap-8 md:block">
        <section className="flex flex-col overflow-y-auto rounded-[28px] bg-[#141414] px-6 py-8 text-[#f5f5f5] ring-1 ring-white/10 md:fixed md:left-[15.28vw] md:top-[18.44vh] md:h-[71.75vh] md:w-[30.76vw] md:px-8">
          <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full font-serif text-4xl ${paint.className}`} style={paint.style}>{initial}</div>
          <h1 className="mt-4 text-center text-3xl font-bold tracking-tight">{session.handle}</h1>
          {form.showIdentity && who && <p className="mt-2 text-center text-sm text-white/45">{who}</p>}
          {form.showPlace && where && <p className="text-center text-sm text-white/45">{where}</p>}
          <p className="mt-1 text-center text-sm text-white/70">{points} points{off ? ` · ${off}% off` : ""}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
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
              <p className="flex justify-between text-white/70"><span>Joined</span><span>{stats.joined}</span></p>
              <p className="mt-2 flex justify-between text-white/70"><span>Invited</span><span>{stats.invited}</span></p>
              <p className="mt-2 flex justify-between text-white/70"><span>Quick meet</span><span>{stats.quick}</span></p>
              <p className="mt-2 flex justify-between text-white/70"><span>Private joined</span><span>{stats.privJoin}</span></p>
              <p className="mt-2 flex justify-between text-white/70"><span>Private hosted</span><span>{stats.privHost}</span></p>
            </div>
          )}

          {panel === "buddies" && !buddy && (
            <div className="mt-3">
              {!buddies.length && !pending.length && <p className="text-sm text-white/45">No buddies yet.</p>}
              <div className="flex flex-wrap gap-2">
                {pending.map((b) => (
                  <button key={b.id} type="button" title={`${b.name} · waiting`} onClick={() => setBuddy(b)} className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-white/25 text-sm text-white/45">
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                ))}
                {buddies.map((b) => (
                  <button key={b.id} type="button" title={b.name} onClick={() => setBuddy(b)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#1c1c1c] font-serif text-lg">
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          {panel === "buddies" && buddy && (
            <div className="mt-3 rounded-3xl bg-[#1c1c1c] p-4 text-left shadow-sm">
              <button type="button" className="text-xs text-white/45" onClick={() => setBuddy(null)}>Back</button>
              <div className="mt-3 grid h-14 w-14 place-items-center rounded-full bg-[#1c1c1c] font-serif text-2xl">{buddy.name.slice(0, 1).toUpperCase()}</div>
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
              <div className="mb-3 flex justify-end">
                <button type="button" onClick={() => { setRateOpen((open) => !open); setTarget(null); setNote(""); }} className="rounded-full bg-[#1c1c1c] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  Rate someone
                </button>
              </div>
              {rateOpen && (
                <div className="mb-3 rounded-3xl bg-[#1c1c1c] p-4 text-left shadow-sm">
                  {!target && (
                    <>
                      {!canRate.length && <p className="text-sm text-white/45">No one to rate yet. It opens an hour after you sit down together.</p>}
                      <div className="flex flex-wrap gap-2">
                        {canRate.map((person) => (
                          <button key={person.handle} type="button" onClick={() => setTarget(person)} className="rounded-full bg-[#1c1c1c] px-4 py-2 text-sm">
                            {person.handle} · {person.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {target && (
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const res = bb.addReview(stars, note, target.handle, target.eventId);
                        if (res?.error) {
                          bb.notify(res.error);
                          return;
                        }
                        setNote("");
                        setTarget(null);
                        setRateOpen(false);
                      }}
                    >
                      <p className="text-sm">{target.handle}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setStars(n)} className={`text-lg ${n <= stars ? "text-ember" : "text-white/25"}`}>★</button>
                        ))}
                      </div>
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short line" className="w-full rounded-xl border border-white/15 bg-black text-white" />
                      <div className="flex gap-2">
                        <button type="button" className="rounded-full bg-[#1c1c1c] px-4 py-2 text-sm" onClick={() => setTarget(null)}>Back</button>
                        <button type="submit" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white">Save</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              <div className="space-y-3">
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
              {received.length > 3 && (
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

          <button type="button" className="mt-4 block text-xs text-white/45" onClick={() => setEdit((v) => !v)}>{edit ? "Close" : "Edit details"}</button>
          {edit && (
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
        <section className="min-w-0 md:fixed md:left-[54.23vw] md:top-[18.44vh] md:h-[71.75vh] md:w-[30.76vw] md:overflow-hidden">
          <JoinedEvents />
        </section>
      </div>
    </main>
  );
}
