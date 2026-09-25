"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBB } from "./Providers";
import { translate } from "@/lib/i18n";
import { JoinWizard, OpenTableWizard, PrivateWizard, TodayPopup, TrialGate } from "./Flows";
import { RestaurantAdmin } from "./RestaurantAdmin";
import { iso, badgePaint } from "@/lib/bible";

const TOP = [
  { href: "/venues", label: "Venues" },
  { href: "/quick", label: "Quick" },
  { href: "/private", label: "Private" },
  { href: "/how", label: "How" },
  { href: "/subscribe", label: "Plan" },
  { href: "/profile", label: "Profile" },
];

function accountStyle(session, thresholds) {
  if (!session) return { className: "bg-white text-black", style: { backgroundColor: "#ffffff", color: "#111111" } };
  const paint = badgePaint(session.points, thresholds, "dark");
  return { className: paint.className, style: paint.style };
}

function initials(session) {
  const name = String(session?.handle || session?.username || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return "";
}

function VenuesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    </svg>
  );
}
function QuickIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 3.2A8.2 8.2 0 1 0 20.8 14 6.6 6.6 0 0 1 15 3.2z" />
    </svg>
  );
}
function PrivateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="7" y="5" width="3" height="14" rx="0.7" />
      <rect x="14" y="5" width="3" height="14" rx="0.7" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="7.2" />
      <path d="M9 10h6M9 12h6M9 14h6" strokeLinecap="round" />
    </svg>
  );
}

const BOTTOM = [
  { href: "/venues", key: "nav.venues", Icon: VenuesIcon },
  { href: "/quick", key: "nav.quick", Icon: QuickIcon },
  { href: "/how", key: "nav.how", center: true },
  { href: "/private", key: "nav.private", Icon: PrivateIcon },
  { href: "/profile", key: "nav.profile", Icon: ProfileIcon },
];

export function Shell({ children }) {
  const path = usePathname() || "/";
  const light = path === "/quick" || path.startsWith("/private");
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [menu, setMenu] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [link, setLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showToday, setShowToday] = useState(false);
  const trialLive = !!(bb.trial?.at && !bb.trial.cancelled && Date.now() - bb.trial.at < 90 * 86400000);
  const frame =
    bb.editing && bb.device === "mobile"
      ? "mx-auto min-h-dvh max-w-[390px] bg-inherit shadow-2xl ring-1 ring-white/10"
      : bb.editing && bb.device === "tablet"
        ? "mx-auto min-h-dvh max-w-[768px] bg-inherit shadow-2xl ring-1 ring-white/10"
        : "min-h-dvh";

  const mark = initials(bb.session);
  const selected =
    bb.content.venues.find((v) => v.id === bb.selectedId) ||
    bb.content.events.find((v) => v.id === bb.selectedId);
  const selectedKind = bb.content.venues.some((v) => v.id === bb.selectedId) ? "venue" : "event";
  const flowVenue = bb.content.venues.find((v) => v.id === bb.flow?.venueId);

  useEffect(() => {
    if (!bb.ready || path !== "/" || !trialLive || bb.editing || bb.flow) return;
    const key = `bb_today_${iso(0)}`;
    if (!localStorage.getItem(key)) setShowToday(true);
  }, [bb.ready, bb.editing, bb.flow, path, trialLive]);

  function dismissToday() {
    localStorage.setItem(`bb_today_${iso(0)}`, "1");
    setShowToday(false);
  }

  return (
    <div className={light ? "min-h-dvh bg-paper text-char" : "min-h-dvh bg-ink text-fg"}>
      {bb.staff && bb.preview && (
        <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 bg-ember px-4 py-2 text-xs font-semibold text-white">
          <span>Preview — this is what visitors see. Draft is not live.</span>
          <button type="button" className="rounded-full bg-white px-3 py-1 text-ink" onClick={() => bb.setPreview(false)}>
            Exit preview
          </button>
        </div>
      )}
      {bb.editing && (
        <div className="sticky top-0 z-[60] hidden border-b border-white/10 bg-[#0c0c0c] text-fg md:block">
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
            <span className="shrink-0 font-serif text-sm">Edit</span>
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-mute">{bb.session.role}</span>
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-ember">
              {bb.remote === "live" ? "Supabase" : bb.remote === "error" ? "Supabase error" : "Supabase off"}
            </span>
            <button type="button" className="chip" disabled={!bb.canUndo} onClick={bb.undo}>Undo</button>
            <button type="button" className="chip" disabled={!bb.canRedo} onClick={bb.redo}>Redo</button>
            {["desktop", "tablet", "mobile"].map((d) => (
              <button key={d} type="button" className={bb.device === d ? "chip chip-on" : "chip"} onClick={() => bb.setDevice(d)}>
                {d}
              </button>
            ))}
            <button type="button" className="chip" onClick={() => bb.setPreview(true)}>Preview</button>
            <button type="button" className="chip" onClick={bb.saveDraft}>Save draft</button>
            <button type="button" className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white" onClick={bb.publish}>
              Publish
            </button>
            {bb.dirty && <span className="text-[10px] uppercase tracking-widest text-ember">Unsaved</span>}
          </div>
        </div>
      )}
      <div className={bb.editing && bb.device !== "desktop" ? "bg-[#050505] py-6" : ""}>
        <div className={frame}>
          <header className={`sticky z-40 border-b border-white/10 bg-ink text-fg ${bb.editing ? "top-[46px]" : "top-0"}`}>
            <div className="bb-frame relative flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="bb-word grid h-9 w-9 place-items-center rounded-full bg-white text-[0.72rem] font-semibold tracking-wide text-ink">BB</span>
                <span className="bb-word text-[0.95rem] tracking-[0.16em]">BUDDY BLIND</span>
              </Link>
              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
                {TOP.map((item) => {
                  const active = path === item.href || (item.href !== "/" && path.startsWith(`${item.href}/`));
                  return (
                    <Link key={item.href} href={item.href} className={`text-[0.72rem] font-medium uppercase tracking-[0.16em] ${active ? "text-white" : "text-white/45"}`}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="relative flex items-center gap-3">
                {(menu || notesOpen) && (
                  <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 cursor-default" onClick={() => { setMenu(false); setNotesOpen(false); }} />
                )}
                <button
                  type="button"
                  aria-label="Language"
                  onClick={() => {
                    const order = ["en", "zh-HK", "zh"];
                    const index = order.indexOf(bb.lang);
                    bb.setLang(order[(index + 1) % order.length] || "en");
                  }}
                  className="relative z-40 grid h-9 min-w-9 place-items-center rounded-full border border-white/20 px-2 text-xs font-semibold text-white"
                >
                  {bb.lang === "zh-HK" ? "繁" : bb.lang === "zh" ? "简" : "EN"}
                </button>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => {
                    setNotesOpen((v) => !v);
                    setMenu(false);
                    bb.markNotesRead?.();
                  }}
                  className="relative z-40 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white text-sm font-medium text-black"
                >
                  {(bb.social?.notes || []).filter((note) => !note.read).length}
                </button>
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => { setMenu((v) => !v); setNotesOpen(false); }}
                  className={`relative z-40 grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${accountStyle(bb.session, bb.content?.pointThresholds).className}`}
                  style={accountStyle(bb.session, bb.content?.pointThresholds).style}
                >
                  {mark || (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                {notesOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-black/10 bg-[#141414] text-fg shadow-2xl">
                    <p className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.14em] text-mute">Notifications</p>
                    <div className="max-h-80 overflow-y-auto">
                      {(bb.social?.notes || []).length === 0 && <p className="px-4 py-6 text-sm text-mute">Nothing yet.</p>}
                      {(bb.social?.notes || []).slice(0, 12).map((note) => (
                        <div key={note.id} className="border-b border-white/5 px-4 py-3">
                          <p className="text-sm">{note.title}</p>
                          <p className="mt-1 text-xs text-mute">{note.body}</p>
                          {note.invite && (
                            <button
                              type="button"
                              className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black"
                              onClick={async () => {
                                const invite = note.invite;
                                const res = invite.eventId
                                  ? await bb.joinPrivate(invite.eventId)
                                  : await bb.joinTable({ venueId: invite.venueId, tableId: invite.tableId });
                                bb.notify(res?.error || "You're in.");
                                setNotesOpen(false);
                              }}
                            >
                              JOIN
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {menu && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-black/10 bg-white text-char shadow-2xl">
                    {bb.session && (
                      <div className="border-b border-black/10 px-4 py-3">
                        <div className="text-sm">{bb.session.handle || bb.session.username}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ember">{mark}</div>
                      </div>
                    )}
                    {bb.session ? (
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm"
                        onClick={() => {
                          setMenu(false);
                          bb.logout();
                        }}
                      >
                        {t("nav.logout")}
                      </button>
                    ) : (
                      <Link href="/login" className="block px-4 py-2.5 text-sm" onClick={() => setMenu(false)}>{t("nav.login")}</Link>
                    )}
                    <Link href="/subscribe" className="block px-4 py-2.5 text-sm" onClick={() => setMenu(false)}>Upgrade plan</Link>
                    {bb.session?.role === "admin" && <Link href="/admin" className="block px-4 py-2.5 text-sm" onClick={() => setMenu(false)}>Restaurants</Link>}
                    <Link href="/about" className="block px-4 py-2.5 text-sm" onClick={() => setMenu(false)}>About us</Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className={bb.editing ? "md:pl-16" : ""}>{children}</div>
          <footer className={`mb-20 border-t px-5 py-8 md:mb-0 ${light ? "border-black/10 text-black/50" : "border-white/10 text-white/45"} ${bb.editing ? "md:pl-16" : ""}`}>
            <div className="bb-frame flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs">© {new Date().getFullYear()} Buddy Blind · Hong Kong</p>
              <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <Link href="/terms">Terms & Conditions</Link>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/cookies">Cookies</Link>
                <Link href="/accessibility">Accessibility</Link>
                <Link href="/guidelines">Community Guidelines</Link>
              </nav>
            </div>
          </footer>

          <nav className={`fixed inset-x-0 bottom-0 z-40 md:hidden ${light ? "bg-paper text-char" : "bg-[#0c0c0c] text-white"}`}>
            <div className="grid grid-cols-5 items-end px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
              {BOTTOM.map((item) => {
                const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
                if (item.center) {
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center justify-center pb-1">
                      <span className={`grid h-14 w-14 -translate-y-3 place-items-center rounded-full font-serif text-2xl shadow-lg ${active ? "bg-ember text-white" : light ? "bg-black text-white" : "bg-white text-black"}`}>?</span>
                    </Link>
                  );
                }
                const Glyph = item.Icon;
                return (
                  <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 pb-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] ${active ? "text-ember" : light ? "text-black/45" : "text-white/55"}`}>
                    <Glyph />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {bb.editing && (
        <aside className="fixed bottom-24 left-3 z-50 hidden flex-col gap-2 md:bottom-auto md:top-28 md:flex">
          {[
            ["add", "+"],
            ["pages", "Pg"],
            ["layers", "Ly"],
            ["media", "Ph"],
            ["history", "Hi"],
            ["restaurants", "Rs"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => bb.setPanel(bb.panel === id ? null : id)} className={`grid h-11 w-11 place-items-center rounded-full text-[11px] font-bold ${bb.panel === id ? "bg-ember text-white" : "bg-[#161616] text-fg ring-1 ring-white/15"}`}>
              {label}
            </button>
          ))}
          {bb.session?.role === "founder" && (
            <button type="button" onClick={() => bb.setPanel(bb.panel === "admins" ? null : "admins")} className={`grid h-11 w-11 place-items-center rounded-full text-[10px] font-bold ${bb.panel === "admins" ? "bg-ember text-white" : "bg-[#161616] text-fg ring-1 ring-white/15"}`}>
              Ad
            </button>
          )}
        </aside>
      )}

      {bb.editing && bb.panel && (
        <div className="fixed bottom-24 left-16 z-50 hidden max-h-[70vh] w-[min(100vw-5rem,320px)] overflow-auto rounded-2xl border border-white/10 bg-[#101010] p-4 text-sm text-fg shadow-2xl md:top-28 md:bottom-auto md:block">
          {bb.panel === "add" && (
            <div className="space-y-2">
              <p className="bb-kicker text-mute">Add</p>
              <button type="button" className="block w-full rounded-full border border-white/15 py-2" onClick={() => bb.addBlock("venue")}>Venue card</button>
              <button type="button" className="block w-full rounded-full border border-white/15 py-2" onClick={() => bb.addBlock("quick")}>Quick seat</button>
              <button type="button" className="block w-full rounded-full border border-white/15 py-2" onClick={() => bb.addBlock("private")}>Private night</button>
            </div>
          )}
          {bb.panel === "pages" && (
            <div className="space-y-2">
              <p className="bb-kicker text-mute">Pages</p>
              {TOP.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-2 hover:bg-white/5" onClick={() => bb.setPanel(null)}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          {bb.panel === "layers" && (
            <div className="space-y-3">
              <p className="bb-kicker text-mute">Layers</p>
              {[...bb.content.venues.map((v) => ({ ...v, kind: "venue" })), ...bb.content.events.map((v) => ({ ...v, kind: "event" }))].map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 border-b border-white/10 py-2">
                  <button type="button" className="truncate text-left" onClick={() => bb.setSelectedId(item.id)}>{item.name}</button>
                  <div className="flex shrink-0 gap-1 text-[10px]">
                    <button type="button" onClick={() => bb.toggleHide(item.kind, item.id)}>{item.hidden ? "Show" : "Hide"}</button>
                    <button type="button" onClick={() => bb.toggleLock(item.kind, item.id)}>{item.locked ? "Unlock" : "Lock"}</button>
                    <button type="button" onClick={() => bb.duplicateBlock(item.kind, item.id)}>Dup</button>
                    <button type="button" onClick={() => bb.removeBlock(item.kind, item.id)}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {bb.panel === "media" && (
            <div className="space-y-3">
              <p className="bb-kicker text-mute">Photos</p>
              <p className="text-xs text-mute">Drop a photo on any picture while editing. It fills the frame without stretching.</p>
              {bb.content.venues.map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  <img src={v.imageUrl} alt="" className="h-12 w-16 rounded object-cover" />
                  <span className="truncate text-xs">{v.name}</span>
                </div>
              ))}
            </div>
          )}
          {bb.panel === "history" && (
            <div className="space-y-2">
              <p className="bb-kicker text-mute">Versions</p>
              <button type="button" className="block w-full rounded-full border border-white/15 py-2 text-xs" onClick={bb.resetDraft}>Reset original</button>
              {bb.versions.length === 0 && <p className="text-xs text-mute">Publish once to keep a version.</p>}
              {bb.versions.map((v, i) => (
                <button key={v.at} type="button" className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-white/5" onClick={() => bb.restoreVersion(i)}>
                  {new Date(v.at).toLocaleString()} 
                </button>
              ))}
              <p className="bb-kicker mt-4 text-mute">Activity</p>
              {bb.activity.slice(0, 8).map((a) => (
                <p key={a.t + a.msg} className="text-[11px] text-mute">{a.msg}</p>
              ))}
            </div>
          )}
          {bb.panel === "restaurants" && bb.staff && <RestaurantAdmin />}
          {bb.panel === "admins" && bb.session?.role === "founder" && (
            <div className="space-y-3">
              <p className="bb-kicker text-mute">Admin management</p>
              <p className="text-xs text-mute">Founder assigns. Admin edits. Members browse. Same Login button.</p>
              <div className="text-xs">founder@buddyblind.com · founder</div>
              <div className={`text-xs ${bb.revoked.includes("admin@buddyblind.com") ? "line-through text-mute" : ""}`}>
                admin@buddyblind.com · admin
                {!bb.revoked.includes("admin@buddyblind.com") && (
                  <button type="button" className="ml-2 text-ember" onClick={() => bb.revokeAdmin("admin@buddyblind.com")}>Remove</button>
                )}
              </div>
              {bb.users.filter((u) => u.role === "admin").map((u) => (
                <div key={u.email} className="text-xs">
                  {u.email} · admin
                  <button type="button" className="ml-2 text-ember" onClick={() => bb.revokeAdmin(u.email)}>Remove</button>
                </div>
              ))}
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="admin email" className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-xs" />
              <button
                type="button"
                className="w-full rounded-full bg-fg py-2 text-xs font-semibold text-ink"
                onClick={() => {
                  const res = bb.createInvite(inviteEmail);
                  if (res.error) {
                    bb.notify(res.error);
                    return;
                  }
                  const url = `${window.location.origin}/login?activate=${res.code}`;
                  setLink(url);
                  setInviteEmail("");
                }}
              >
                Create activation link
              </button>
              {link && (
                <button
                  type="button"
                  className="w-full break-all rounded-lg bg-white/5 p-2 text-left text-[11px]"
                  onClick={() => {
                    navigator.clipboard?.writeText(link);
                    bb.notify("Activation link copied.");
                  }}
                >
                  {link}
                </button>
              )}
              {bb.invites.map((inv) => (
                <p key={inv.code} className="text-[11px] text-mute">{inv.email} · code {inv.code}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {bb.editing && selected && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink shadow-2xl">
          <span className="max-w-[140px] truncate">{selected.name}</span>
          <button type="button" onClick={() => bb.duplicateBlock(selectedKind, selected.id)}>Duplicate</button>
          <button type="button" onClick={() => bb.toggleLock(selectedKind, selected.id)}>{selected.locked ? "Unlock" : "Lock"}</button>
          <button type="button" onClick={() => bb.removeBlock(selectedKind, selected.id)}>Delete</button>
          <button type="button" onClick={() => bb.setSelectedId(null)}>Close</button>
        </div>
      )}

      {bb.toast && (
        <div className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-xl">
          {bb.toast}
        </div>
      )}
      {bb.ready && !trialLive && path !== "/register" && path !== "/login" && path !== "/subscribe" && <TrialGate />}
      {showToday && !bb.flow && (
        <TodayPopup
          onDismiss={dismissToday}
          onJoin={(venueId, tableId) => {
            dismissToday();
            bb.setFlow({ type: "join", venueId, tableId });
          }}
          onBrowse={() => {
            dismissToday();
            window.location.href = "/?when=today";
          }}
        />
      )}
      {bb.flow?.type === "invite" && flowVenue && <OpenTableWizard venue={flowVenue} onClose={() => bb.setFlow(null)} />}
      {bb.flow?.type === "quick-invite" && flowVenue && <OpenTableWizard venue={flowVenue} todayOnly onClose={() => bb.setFlow(null)} />}
      {bb.flow?.type === "join" && flowVenue && (
        <JoinWizard venue={flowVenue} tableId={bb.flow.tableId} onClose={() => bb.setFlow(null)} />
      )}
      {bb.flow?.type === "private-create" && (
        <PrivateWizard venueId={bb.flow.venueId || ""} onClose={() => bb.setFlow(null)} />
      )}
    </div>
  );
}
