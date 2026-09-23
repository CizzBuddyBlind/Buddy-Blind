"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SEED, SEED_ACCOUNTS } from "@/lib/defaults";

const Ctx = createContext(null);
export function useBB() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useBB outside provider");
  return value;
}

const PUB = "bb_pub_v1";
const DRAFT = "bb_draft_v1";
const SES = "bb_ses_v1";
const USERS = "bb_users_v1";
const REVOKED = "bb_revoked_v1";
const INVITES = "bb_invites_v1";
const POINTS = "bb_points_v1";
const BOOKS = "bb_books_v1";
const VERSIONS = "bb_versions_v1";
const ACTIVITY = "bb_activity_v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function blankProfile(partial) {
  return {
    email: "",
    username: "",
    password: "",
    role: "user",
    handle: "Buddy",
    points: 0,
    neighborhood: "CENTRAL",
    ageRange: "30-40",
    occupation: "Guest",
    verified: false,
    ...partial,
  };
}

export function BuddyProvider({ children }) {
  const [published, setPublished] = useState(SEED);
  const [draft, setDraft] = useState(null);
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [revoked, setRevoked] = useState([]);
  const [invites, setInvites] = useState([]);
  const [versions, setVersions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [panel, setPanel] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, setModal] = useState(null);
  const [ready, setReady] = useState(false);

  const publishedRef = useRef(published);
  const draftRef = useRef(draft);
  const hist = useRef([clone(SEED)]);
  const histI = useRef(0);
  const toastTimer = useRef(null);

  useEffect(() => {
    publishedRef.current = published;
  }, [published]);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const pub = read(PUB, SEED);
    const dr = read(DRAFT, null);
    const ses = read(SES, null);
    setPublished(pub);
    setDraft(dr);
    setSession(ses);
    setUsers(read(USERS, []));
    setRevoked(read(REVOKED, []));
    setInvites(read(INVITES, []));
    setVersions(read(VERSIONS, []));
    setActivity(read(ACTIVITY, []));
    const start = dr || clone(pub);
    hist.current = [clone(start)];
    histI.current = 0;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const onLeave = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const log = useCallback((msg) => {
    const items = [{ t: new Date().toISOString(), msg }, ...read(ACTIVITY, [])].slice(0, 40);
    write(ACTIVITY, items);
    setActivity(items);
  }, []);

  const syncHistFlags = () => {
    setCanUndo(histI.current > 0);
    setCanRedo(histI.current < hist.current.length - 1);
  };

  const commit = useCallback((next) => {
    draftRef.current = next;
    setDraft(next);
    setDirty(true);
    const cut = hist.current.slice(0, histI.current + 1);
    cut.push(clone(next));
    hist.current = cut.slice(-40);
    histI.current = hist.current.length - 1;
    syncHistFlags();
  }, []);

  const update = useCallback(
    (mutator) => {
      const base = clone(draftRef.current || publishedRef.current);
      mutator(base);
      commit(base);
    },
    [commit],
  );

  const undo = useCallback(() => {
    if (histI.current <= 0) return;
    histI.current -= 1;
    setDraft(clone(hist.current[histI.current]));
    setDirty(true);
    syncHistFlags();
  }, []);

  const redo = useCallback(() => {
    if (histI.current >= hist.current.length - 1) return;
    histI.current += 1;
    setDraft(clone(hist.current[histI.current]));
    setDirty(true);
    syncHistFlags();
  }, []);

  const staff = !!(session && (session.role === "admin" || session.role === "founder"));
  const editing = !!(staff && !preview && ready);
  const content = editing ? draft || published : published;

  const saveDraft = useCallback(() => {
    const next = clone(draftRef.current || publishedRef.current);
    write(DRAFT, next);
    setDraft(next);
    setDirty(false);
    log("Saved draft");
    notify("Draft saved. Not live until you publish.");
  }, [log, notify]);

  const publish = useCallback(() => {
    const next = clone(draftRef.current || publishedRef.current);
    setPublished(next);
    setDraft(next);
    write(PUB, next);
    write(DRAFT, next);
    const history = [{ at: new Date().toISOString(), content: next }, ...read(VERSIONS, [])].slice(0, 8);
    write(VERSIONS, history);
    setVersions(history);
    setDirty(false);
    log("Published");
    notify("Published on this browser.");
  }, [log, notify]);

  const restoreVersion = useCallback(
    (index) => {
      const version = versions[index];
      if (!version) return;
      commit(clone(version.content));
      notify("Version loaded into the draft.");
    },
    [versions, commit, notify],
  );

  const confirm = useCallback((title, body) => {
    return new Promise((resolve) => setModal({ title, body, resolve }));
  }, []);

  const closeModal = (yes) => {
    if (!modal) return;
    modal.resolve(yes);
    setModal(null);
  };

  const persistSession = (ses) => {
    setSession(ses);
    if (ses) write(SES, ses);
    else localStorage.removeItem(SES);
  };

  const login = useCallback(
    (id, password) => {
      const key = String(id || "").trim().toLowerCase();
      const all = [...SEED_ACCOUNTS, ...read(USERS, [])];
      const blocked = read(REVOKED, []);
      const found = all.find((a) => a.email.toLowerCase() === key || a.username.toLowerCase() === key);
      if (!found || found.password !== password) return "Wrong email, username, or password.";
      if (found.role !== "founder" && blocked.includes(found.email.toLowerCase())) return "This admin seat was removed.";
      const pointsMap = read(POINTS, {});
      const books = read(BOOKS, {});
      const ses = {
        email: found.email,
        username: found.username,
        role: found.role,
        handle: found.handle,
        points: pointsMap[found.email] ?? found.points,
        neighborhood: found.neighborhood,
        ageRange: found.ageRange,
        occupation: found.occupation,
        verified: !!found.verified,
        bookings: books[found.email] || [],
      };
      persistSession(ses);
      if (ses.role === "admin" || ses.role === "founder") {
        setPreview(false);
        if (!draftRef.current) setDraft(clone(publishedRef.current));
      }
      log(`Login · ${ses.role} · ${ses.email}`);
      return null;
    },
    [log],
  );

  const logout = useCallback(() => {
    persistSession(null);
    setPreview(false);
    setPanel(null);
    setSelectedId(null);
    notify("Logged out");
  }, [notify]);

  const register = useCallback((input) => {
    const email = String(input.email || "").trim().toLowerCase();
    const username = String(input.username || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (!email.includes("@") || username.length < 2 || password.length < 6) {
      return "Use a real email, a username, and a password of at least 6 characters.";
    }
    const all = [...SEED_ACCOUNTS, ...read(USERS, [])];
    if (all.some((a) => a.email === email || a.username === username)) return "That email or username is already taken.";
    const nextUser = blankProfile({
      email,
      username,
      password,
      handle: input.handle?.trim() || username,
      role: "user",
    });
    const next = [...read(USERS, []), nextUser];
    write(USERS, next);
    setUsers(next);
    return login(email, password);
  }, [login]);

  const createInvite = useCallback(
    (email) => {
      const clean = String(email || "").trim().toLowerCase();
      if (!clean.includes("@")) return { error: "Enter an email." };
      if (session?.role !== "founder") return { error: "Only the founder can assign admins." };
      const payload = { email: clean, role: "admin", exp: Date.now() + 7 * 86400000 };
      const code = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      const next = [{ email: clean, code, role: "admin", at: new Date().toISOString() }, ...read(INVITES, [])];
      write(INVITES, next);
      setInvites(next);
      const blocked = read(REVOKED, []).filter((e) => e !== clean);
      write(REVOKED, blocked);
      setRevoked(blocked);
      log(`Invited admin · ${clean}`);
      return { code };
    },
    [session, log],
  );

  const activate = useCallback((code, username, password) => {
    const raw = String(code || "").trim();
    let invite = read(INVITES, []).find((i) => i.code === raw);
    if (!invite?.email) {
      try {
        const pad = raw.replace(/-/g, "+").replace(/_/g, "/");
        const extra = (4 - (pad.length % 4)) % 4;
        invite = JSON.parse(atob(pad + "=".repeat(extra)));
      } catch {
        invite = null;
      }
    }
    if (!invite?.email) return "That activation link is not valid.";
    if (invite.exp && invite.exp < Date.now()) return "That activation link expired.";
    const name = String(username || "").trim().toLowerCase();
    const pass = String(password || "");
    if (name.length < 2 || pass.length < 6) return "Choose a username and a password of at least 6 characters.";
    const nextUser = blankProfile({
      email: invite.email,
      username: name,
      password: pass,
      handle: name,
      role: "admin",
      occupation: "Admin",
      verified: true,
    });
    const next = [...read(USERS, []).filter((u) => u.email !== invite.email), nextUser];
    write(USERS, next);
    setUsers(next);
    const left = read(INVITES, []).filter((i) => i.code !== raw);
    write(INVITES, left);
    setInvites(left);
    log(`Admin activated · ${invite.email}`);
    return null;
  }, [log]);

  const revokeAdmin = useCallback(
    async (email) => {
      if (session?.role !== "founder") return;
      const clean = email.toLowerCase();
      if (clean === "founder@buddyblind.com") return;
      const ok = await confirm("Remove admin?", `${clean} will lose edit access.`);
      if (!ok) return;
      const nextRevoked = Array.from(new Set([...read(REVOKED, []), clean]));
      write(REVOKED, nextRevoked);
      setRevoked(nextRevoked);
      const nextUsers = read(USERS, []).map((u) => (u.email === clean ? { ...u, role: "user" } : u));
      write(USERS, nextUsers);
      setUsers(nextUsers);
      log(`Removed admin · ${clean}`);
      notify("Admin removed.");
    },
    [session, confirm, log, notify],
  );

  const act = useCallback(
    (kind, id, mode) => {
      if (!session) return { needLogin: true };
      const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
      const list = kind === "venue" ? base.venues : base.events;
      const item = list.find((x) => x.id === id);
      if (!item) return { error: "That seat is gone." };
      if (item.locked && editing) return { error: "This block is locked." };
      if ((item.spots || 0) <= 0) return { error: "No spots left." };
      item.spots -= 1;
      if (editing) commit(base);
      else {
        setPublished(base);
        write(PUB, base);
      }
      const gain = mode === "invite" ? 2 : mode === "create" ? 5 : 1;
      const points = (session.points || 0) + gain;
      const booking = { id, name: item.name, kind, mode, at: Date.now() };
      const pointsMap = read(POINTS, {});
      pointsMap[session.email] = points;
      write(POINTS, pointsMap);
      const books = read(BOOKS, {});
      books[session.email] = [...(books[session.email] || []), booking].slice(-20);
      write(BOOKS, books);
      persistSession({ ...session, points, bookings: books[session.email] });
      return { ok: true, name: item.name };
    },
    [session, editing, commit],
  );

  const removeBlock = useCallback(
    async (kind, id) => {
      const baseLook = draftRef.current || publishedRef.current;
      const list = kind === "venue" ? baseLook.venues : baseLook.events;
      const item = list.find((x) => x.id === id);
      if (!item) return;
      if (item.locked) {
        notify("Unlock it before deleting.");
        return;
      }
      const ok = await confirm("Remove from the page?", `${item.name} leaves this page. It is not deleted from the original seed until you publish a reset.`);
      if (!ok) return;
      update((draftContent) => {
        const key = kind === "venue" ? "venues" : "events";
        draftContent[key] = draftContent[key].filter((x) => x.id !== id);
      });
      setSelectedId(null);
      log(`Removed ${item.name}`);
    },
    [confirm, notify, update, log],
  );

  const duplicateBlock = useCallback(
    (kind, id) => {
      update((draftContent) => {
        const key = kind === "venue" ? "venues" : "events";
        const index = draftContent[key].findIndex((x) => x.id === id);
        if (index < 0) return;
        const copy = {
          ...draftContent[key][index],
          id: `${id}-${Math.random().toString(36).slice(2, 6)}`,
          name: `${draftContent[key][index].name} copy`,
          locked: false,
          hidden: false,
        };
        draftContent[key].splice(index + 1, 0, copy);
      });
    },
    [update],
  );

  const insertEvent = useCallback(
    (item, pointsGain = 5) => {
      if (!session) return { needLogin: true };
      if (editing) {
        update((draftContent) => {
          draftContent.events.unshift(item);
        });
      } else {
        const base = clone(publishedRef.current);
        base.events.unshift(item);
        publishedRef.current = base;
        setPublished(base);
        write(PUB, base);
      }
      const points = (session.points || 0) + pointsGain;
      const pointsMap = read(POINTS, {});
      pointsMap[session.email] = points;
      write(POINTS, pointsMap);
      const books = read(BOOKS, {});
      const booking = { id: item.id, name: item.name, kind: item.kind, mode: "create", at: Date.now() };
      books[session.email] = [...(books[session.email] || []), booking].slice(-20);
      write(BOOKS, books);
      persistSession({ ...session, points, bookings: books[session.email] });
      log(`Created ${item.name}`);
      return { ok: true };
    },
    [session, editing, update, log],
  );

  const addBlock = useCallback(
    (kind) => {
      const id = `${kind}-${Date.now().toString(36)}`;
      update((draftContent) => {
        if (kind === "venue") {
          draftContent.venues.unshift({
            id,
            name: "New venue",
            typeLabel: "SUPPER · NEW",
            locationLabel: "Central · Hong Kong",
            priceLabel: "HK$ —",
            timeLabel: "TONIGHT 7PM",
            spots: 4,
            area: "central",
            tonight: true,
            locked: false,
            hidden: false,
            imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
            imageAlt: "New venue",
            about: "Tell people enough to want the table. Not who they'll meet.",
          });
        } else {
          draftContent.events.unshift({
            id,
            kind,
            name: kind === "quick" ? "New quick seat" : "New private night",
            typeLabel: kind === "quick" ? "NOW" : "HOST LED",
            timeLabel: "NOW · CENTRAL",
            detail: "2 seats",
            hostLabel: "Blind with you",
            upcomingLabel: "1 upcoming",
            spots: 2,
            hidden: false,
            imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
          });
        }
      });
      setPanel(null);
      log(`Added ${kind}`);
    },
    [update, log],
  );

  const toggleLock = useCallback(
    (kind, id) => {
      update((draftContent) => {
        const key = kind === "venue" ? "venues" : "events";
        const item = draftContent[key].find((x) => x.id === id);
        if (item) item.locked = !item.locked;
      });
    },
    [update],
  );

  const toggleHide = useCallback(
    (kind, id) => {
      update((draftContent) => {
        const key = kind === "venue" ? "venues" : "events";
        const item = draftContent[key].find((x) => x.id === id);
        if (item) item.hidden = !item.hidden;
      });
    },
    [update],
  );

  const resetDraft = useCallback(async () => {
    const ok = await confirm("Reset to the original site?", "Draft and the published copy on this browser go back to the shipped Buddy Blind pages.");
    if (!ok) return;
    localStorage.removeItem(DRAFT);
    localStorage.removeItem(PUB);
    const fresh = clone(SEED);
    setPublished(fresh);
    setDraft(fresh);
    hist.current = [clone(fresh)];
    histI.current = 0;
    syncHistFlags();
    setDirty(false);
    log("Reset to original");
    notify("Restored the original pages.");
  }, [confirm, log, notify]);

  const value = useMemo(
    () => ({
      ready,
      content,
      session,
      staff,
      editing,
      preview,
      setPreview,
      device,
      setDevice,
      panel,
      setPanel,
      dirty,
      toast,
      notify,
      selectedId,
      setSelectedId,
      canUndo,
      canRedo,
      undo,
      redo,
      update,
      saveDraft,
      publish,
      login,
      logout,
      register,
      createInvite,
      activate,
      revokeAdmin,
      invites,
      revoked,
      users,
      activity,
      versions,
      restoreVersion,
      act,
      insertEvent,
      removeBlock,
      duplicateBlock,
      addBlock,
      toggleLock,
      toggleHide,
      resetDraft,
      confirm,
    }),
    [
      ready, content, session, staff, editing, preview, device, panel, dirty, toast, notify,
      selectedId, canUndo, canRedo, undo, redo, update, saveDraft, publish, login, logout,
      register, createInvite, activate, revokeAdmin, invites, revoked, users, activity,
      versions, restoreVersion, act, insertEvent, removeBlock, duplicateBlock, addBlock, toggleLock,
      toggleHide, resetDraft, confirm,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 text-fg">
            <h2 className="font-serif text-2xl">{modal.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">{modal.body}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={() => closeModal(false)}>
                Cancel
              </button>
              <button type="button" className="flex-1 rounded-full bg-ember py-3 text-sm font-semibold text-white" onClick={() => closeModal(true)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
