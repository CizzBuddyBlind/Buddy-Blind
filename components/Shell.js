"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBB } from "./Providers";
import { translate } from "@/lib/i18n";
import { JoinWizard, LangSwitch, OpenTableWizard, PrivateWizard, TodayPopup, TrialGate } from "./Flows";
import { RestaurantAdmin } from "./RestaurantAdmin";
import { iso } from "@/lib/bible";

const NAV = [
  { href: "/", key: "nav.venues" },
  { href: "/quick", key: "nav.quick" },
  { href: "/private", key: "nav.private" },
  { href: "/how", key: "nav.how" },
  { href: "/subscribe", key: "nav.premium" },
];

function Icon({ d }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BOTTOM = [
  { href: "/", key: "nav.venues", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { href: "/quick", key: "nav.quick", icon: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  { href: "/how", key: "nav.how", center: true },
  { href: "/private", key: "nav.private", icon: "M12 3l2.2 6.4H21l-5.4 3.9 2.1 6.4L12 16.8 6.3 19.7l2.1-6.4L3 9.4h6.8z" },
  { href: "/profile", key: "nav.profile", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" },
];

export function Shell({ children }) {
  const path = usePathname() || "/";
  const light = path === "/quick" || path.startsWith("/private");
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const [menu, setMenu] = useState(false);
  const [link, setLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showToday, setShowToday] = useState(false);
  const trialLive = !!(bb.trial?.at && !bb.trial.cancelled && Date.now() - bb.trial.at < 90 * 86400000);
  const initial = (bb.session?.handle || "B").slice(0, 1).toUpperCase();
  const frame =
    bb.editing && bb.device === "mobile"
      ? "mx-auto min-h-dvh max-w-[390px] bg-inherit shadow-2xl ring-1 ring-white/10"
      : bb.editing && bb.device === "tablet"
        ? "mx-auto min-h-dvh max-w-[768px] bg-inherit shadow-2xl ring-1 ring-white/10"
        : "min-h-dvh";

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
        <div className="sticky top-0 z-[60] border-b border-white/10 bg-[#0c0c0c] text-fg">
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
          <header className={`sticky z-40 border-b backdrop-blur-xl ${bb.editing ? "top-[46px]" : "top-0"} ${light ? "border-black/10 bg-paper/95" : "border-white/10 bg-ink/90"}`}>
            <div className="bb-frame flex h-14 items-center justify-between gap-4">
              <Link href="/" className="font-serif text-[1.05rem] tracking-wide">BUDDY BLIND</Link>
              <nav className="hidden items-center gap-6 md:flex">
                {NAV.map((item) => {
                  const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={`text-[0.78rem] font-medium uppercase tracking-[0.08em] ${active ? "" : "text-mute"}`}>
                      {t(item.key)}
                    </Link>
                  );
                })}
              </nav>
              <div className="relative flex items-center gap-2">
                <LangSwitch light={light} />
                {!bb.session ? (
                  <Link href="/login" className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${light ? "bg-char text-paper" : "bg-fg text-ink"}`}>
                    {t("nav.login")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label="Account"
                    onClick={() => setMenu((v) => !v)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-ember text-sm font-semibold text-white"
                  >
                    {initial}
                  </button>
                )}
                {menu && bb.session && (
                  <div className={`absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border shadow-2xl ${light ? "border-black/10 bg-white text-char" : "border-white/10 bg-card text-fg"}`}>
                    <div className="border-b border-white/10 px-4 py-3">
                      <div className="text-sm">{bb.session.handle}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ember">{bb.session.role}</div>
                    </div>
                    <Link href="/profile" className="block px-4 py-2.5 text-sm hover:bg-white/5" onClick={() => setMenu(false)}>{t("nav.profile")}</Link>
                    <Link href="/subscribe" className="block px-4 py-2.5 text-sm hover:bg-white/5" onClick={() => setMenu(false)}>{t("nav.subscribe")}</Link>
                    <Link href="/how#about" className="block px-4 py-2.5 text-sm hover:bg-white/5" onClick={() => setMenu(false)}>{t("nav.about")}</Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5"
                      onClick={() => {
                        setMenu(false);
                        bb.logout();
                      }}
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className={bb.editing ? "md:pl-16" : ""}>{children}</div>

          <nav className={`fixed inset-x-0 bottom-0 z-40 border-t md:hidden ${light ? "border-black/10 bg-paper/95" : "border-white/10 bg-ink/95"}`}>
            <div className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
              {BOTTOM.map((item) => {
                const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
                if (item.center) {
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center justify-center py-2">
                      <span className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg ${active ? "bg-ember text-white" : light ? "bg-char text-paper" : "bg-fg text-ink"}`}>?</span>
                    </Link>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.62rem] font-medium tracking-[0.08em] ${active ? "" : "text-mute"}`}>
                    <Icon d={item.icon} />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {bb.editing && (
        <aside className="fixed bottom-24 left-3 z-50 flex flex-col gap-2 md:bottom-auto md:top-28">
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
        <div className="fixed bottom-24 left-16 z-50 max-h-[70vh] w-[min(100vw-5rem,320px)] overflow-auto rounded-2xl border border-white/10 bg-[#101010] p-4 text-sm text-fg shadow-2xl md:top-28 md:bottom-auto">
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
              {[...NAV, { href: "/profile", key: "nav.profile" }, { href: "/login", key: "nav.login" }].map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-2 hover:bg-white/5" onClick={() => bb.setPanel(null)}>
                  {t(item.key)}
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
      {bb.ready && !trialLive && <TrialGate />}
      {showToday && !bb.flow && (
        <TodayPopup
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
      {bb.flow?.type === "join" && flowVenue && (
        <JoinWizard venue={flowVenue} tableId={bb.flow.tableId} onClose={() => bb.setFlow(null)} />
      )}
      {bb.flow?.type === "private-create" && (
        <PrivateWizard venueId={bb.flow.venueId || ""} onClose={() => bb.setFlow(null)} />
      )}
    </div>
  );
}
