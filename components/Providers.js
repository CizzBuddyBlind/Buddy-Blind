"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SEED, SEED_ACCOUNTS } from "@/lib/defaults";
import { loadSharedContent, saveSharedContent, supabaseReady } from "@/lib/supabase";
import { bookingHold, logEntry, normalizeContent, pingWindow, tierFromPoints, TRIAL_DAYS } from "@/lib/bible";
import { channelNote, notifyRestaurant } from "@/lib/notify";

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
const TRIAL = "bb_trial_v1";
const PLAN = "bb_plan_v1";
const SOCIAL = "bb_social_v1";
const PROFILES = "bb_profile_v1";
const LANG = "bb_lang_v1";

function emptySocial() {
  return { buddies: [], reviews: [], notes: [], notesOn: true };
}

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
    gender: "",
    phone: "",
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
  const [remote, setRemote] = useState(supabaseReady ? "checking" : "off");
  const [lang, setLangState] = useState("en");
  const [trial, setTrial] = useState(null);
  const [plan, setPlanState] = useState("free");
  const [planMeta, setPlanMeta] = useState({ subscriptionId: "", customerId: "" });
  const [social, setSocial] = useState(emptySocial);
  const [flow, setFlow] = useState(null);

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
    let cancel = false;
    (async () => {
      const local = read(PUB, SEED);
      const dr = read(DRAFT, null);
      const ses = read(SES, null);
      setSession(ses);
      setUsers(read(USERS, []));
      setRevoked(read(REVOKED, []));
      setInvites(read(INVITES, []));
      setVersions(read(VERSIONS, []));
      setActivity(read(ACTIVITY, []));
      setLangState(read(LANG, "en") || "en");
      setTrial(read(TRIAL, null));
      const savedPlan = read(PLAN, null);
      setPlanState(savedPlan?.id === "lite" || savedPlan?.id === "premium" ? savedPlan.id : "free");
      setPlanMeta({
        subscriptionId: savedPlan?.subscriptionId || "",
        customerId: savedPlan?.customerId || "",
      });
      setSocial({ ...emptySocial(), ...read(SOCIAL, {}) });

      let pub = local?.venues && local?.copy ? local : clone(SEED);
      const res = await loadSharedContent();
      if (cancel) return;
      if (!res.ok) {
        setRemote(res.reason === "missing-env" ? "off" : "error");
      } else if (res.content) {
        pub = res.content;
        setRemote("live");
      } else {
        try {
          await saveSharedContent(pub);
          setRemote("live");
        } catch {
          setRemote("error");
        }
      }

      publishedRef.current = pub;
      setPublished(normalizeContent(pub));
      write(PUB, normalizeContent(pub));
      const normalizedDraft = dr ? normalizeContent(dr) : null;
      setDraft(normalizedDraft);
      const start = normalizedDraft || clone(pub);
      hist.current = [clone(start)];
      histI.current = 0;
      setReady(true);
    })();
    return () => {
      cancel = true;
    };
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
    const normalized = normalizeContent(next);
    draftRef.current = normalized;
    setDraft(normalized);
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

  const pushLive = useCallback(async (next) => {
    publishedRef.current = next;
    setPublished(next);
    write(PUB, next);
    if (!supabaseReady) return { ok: false };
    try {
      await saveSharedContent(next);
      setRemote("live");
      return { ok: true };
    } catch (err) {
      setRemote("error");
      return { ok: false, error: err instanceof Error ? err.message : "Supabase save failed" };
    }
  }, []);

  const publish = useCallback(async () => {
    const next = clone(draftRef.current || publishedRef.current);
    setDraft(next);
    write(DRAFT, next);
    const history = [{ at: new Date().toISOString(), content: next }, ...read(VERSIONS, [])].slice(0, 8);
    write(VERSIONS, history);
    setVersions(history);
    setDirty(false);
    const saved = await pushLive(next);
    log("Published");
    notify(saved.ok ? "Published. Everyone sees this now." : saved.error || "Saved on this browser only.");
  }, [log, notify, pushLive]);

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
      const extra = read(PROFILES, {})[found.email] || {};
      const ses = {
        email: found.email,
        username: found.username,
        role: found.role,
        handle: extra.handle || found.handle,
        points: pointsMap[found.email] ?? found.points,
        neighborhood: extra.neighborhood || found.neighborhood,
        ageRange: extra.ageRange || found.ageRange,
        occupation: extra.occupation || found.occupation,
        gender: extra.gender || found.gender || "",
        phone: extra.phone || found.phone || "",
        verified: extra.verified ?? !!found.verified,
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
    const phone = String(input.phone || "").trim();
    if (phone.replace(/\D/g, "").length < 8) return "Enter a phone number with at least 8 digits.";
    const all = [...SEED_ACCOUNTS, ...read(USERS, [])];
    if (all.some((a) => a.email === email || a.username === username)) return "That email or username is already taken.";
    const nextUser = blankProfile({
      email,
      username,
      password,
      handle: input.handle?.trim() || username,
      role: "user",
      phone,
      gender: input.gender || "",
      verified: !!input.verified,
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
    async (kind, id, mode) => {
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
        const saved = await pushLive(base);
        if (!saved.ok && saved.error) notify(saved.error);
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
    [session, editing, commit, pushLive, notify],
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
    async (item, pointsGain = 5) => {
      if (!session) return { needLogin: true };
      if (editing) {
        update((draftContent) => {
          draftContent.events.unshift(item);
        });
      } else {
        const base = clone(publishedRef.current);
        base.events.unshift(item);
        const saved = await pushLive(base);
        if (!saved.ok && saved.error) notify(saved.error);
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
    [session, editing, update, log, pushLive, notify],
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

  const saveSocial = (next) => {
    write(SOCIAL, next);
    setSocial(next);
  };

  const setLang = useCallback((next) => {
    const valueLang = next === "zh" || next === "zh-HK" ? next : "en";
    setLangState(valueLang);
    write(LANG, valueLang);
    if (typeof document !== "undefined") document.documentElement.lang = valueLang === "zh-HK" ? "zh-Hant" : valueLang;
  }, []);

  const trialOk = !!(trial?.at && !trial.cancelled && Date.now() - trial.at < (trial.days || TRIAL_DAYS) * 86400000);
  const premium = plan === "premium" || trialOk || staff;

  const setPlan = useCallback((id, extra = {}) => {
    const next = id === "lite" || id === "premium" ? id : "free";
    const prev = read(PLAN, {}) || {};
    const meta = {
      id: next,
      at: Date.now(),
      subscriptionId: next === "free" ? "" : extra.subscriptionId ?? prev.subscriptionId ?? "",
      customerId: next === "free" ? "" : extra.customerId ?? prev.customerId ?? "",
    };
    write(PLAN, meta);
    setPlanState(next);
    setPlanMeta({ subscriptionId: meta.subscriptionId, customerId: meta.customerId });
    if (next === "premium") {
      const opened = { at: Date.now(), days: TRIAL_DAYS, cancelled: false, source: "stripe" };
      write(TRIAL, opened);
      setTrial(opened);
    } else {
      setTrial((current) => {
        if (!current?.at || current.cancelled) return current;
        const closed = { ...current, cancelled: true };
        write(TRIAL, closed);
        return closed;
      });
    }
  }, []);

  const acceptTrial = useCallback(() => {
    const next = { at: Date.now(), days: TRIAL_DAYS, cancelled: false };
    write(TRIAL, next);
    setTrial(next);
    notify("Premium trial started. HK$50/month after 90 days unless you cancel.");
  }, [notify]);

  const cancelTrial = useCallback(async () => {
    const ok = await confirm("Cancel the Premium trial?", "You will not be charged. Private event hosting closes until you start again.");
    if (!ok) return;
    const next = { ...(trial || {}), at: trial?.at || Date.now(), days: TRIAL_DAYS, cancelled: true };
    write(TRIAL, next);
    setTrial(next);
    notify("Trial cancelled. No charge.");
  }, [confirm, notify, trial]);

  const updateProfile = useCallback((partial) => {
    if (!session) return;
    const allowed = ["handle", "gender", "occupation", "neighborhood", "ageRange", "phone", "verified"];
    const extra = { ...(read(PROFILES, {})[session.email] || {}) };
    allowed.forEach((key) => {
      if (partial[key] !== undefined) extra[key] = partial[key];
    });
    const all = { ...read(PROFILES, {}), [session.email]: extra };
    write(PROFILES, all);
    const nextUsers = read(USERS, []).map((u) => (u.email === session.email ? { ...u, ...extra } : u));
    write(USERS, nextUsers);
    setUsers(nextUsers);
    persistSession({ ...session, ...extra });
    notify("Profile saved on this browser.");
  }, [notify, session]);

  const toggleNotes = useCallback((on) => {
    const next = { ...social, notesOn: on };
    saveSocial(next);
    notify(on ? "Event reminders on." : "Event reminders off.");
  }, [notify, social]);

  const pushNote = useCallback((title, body) => {
    const current = { ...emptySocial(), ...read(SOCIAL, {}) };
    if (current.notesOn === false) return;
    const next = {
      ...current,
      notes: [{ id: `n-${Date.now()}`, title, body, at: new Date().toISOString(), read: false }, ...(current.notes || [])].slice(0, 30),
    };
    saveSocial(next);
  }, []);

  const markNotesRead = useCallback(() => {
    const next = { ...social, notes: (social.notes || []).map((n) => ({ ...n, read: true })) };
    saveSocial(next);
  }, [social]);

  const requestBuddy = useCallback((name) => {
    if (!session) return { needLogin: true };
    const buddy = { id: `b-${Date.now()}`, name, status: "pending", at: Date.now() };
    const next = { ...social, buddies: [buddy, ...(social.buddies || [])] };
    saveSocial(next);
    pushNote("Buddy request", `${name} — Hey! You are my vibe, let's be buddies!`);
    return { ok: true };
  }, [pushNote, session, social]);

  const respondBuddy = useCallback((id, accept) => {
    const next = {
      ...social,
      buddies: (social.buddies || []).map((b) => (b.id === id ? { ...b, status: accept ? "accepted" : "declined" } : b)),
    };
    saveSocial(next);
  }, [social]);

  const inviteBuddies = useCallback((eventName) => {
    const accepted = (social.buddies || []).filter((b) => b.status === "accepted");
    if (!accepted.length) return { error: "No buddies yet." };
    pushNote("Buddy invite", `You asked ${accepted.map((b) => b.name).join(", ")} to join ${eventName}.`);
    notify("Invite sent inside Notifications.");
    return { ok: true };
  }, [notify, pushNote, social]);

  const addReview = useCallback((stars, body) => {
    const text = String(body || "").trim();
    if (!text) return;
    const next = {
      ...social,
      reviews: [{ id: `r-${Date.now()}`, stars: Number(stars) || 5, body: text, from: session?.handle || "Guest", at: Date.now() }, ...(social.reviews || [])].slice(0, 20),
    };
    saveSocial(next);
    notify("Review saved.");
  }, [notify, session, social]);

  const applyLive = useCallback(async (base) => {
    if (editing) {
      commit(base);
      return { ok: true, draft: true };
    }
    return pushLive(base);
  }, [commit, editing, pushLive]);

  const grantPoints = (mode) => {
    const gain = mode === "invite" ? 2 : mode === "create" ? 5 : 1;
    const points = (session.points || 0) + gain;
    const pointsMap = read(POINTS, {});
    pointsMap[session.email] = points;
    write(POINTS, pointsMap);
    return points;
  };

  const rememberBooking = (booking, points) => {
    const books = read(BOOKS, {});
    books[session.email] = [...(books[session.email] || []), booking].slice(-20);
    write(BOOKS, books);
    persistSession({ ...session, points, bookings: books[session.email] });
  };

  const openTable = useCallback(async (input) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const venue = base.venues.find((v) => v.id === input.venueId);
    if (!venue) return { error: "That restaurant is not on the page." };
    if (venue.hidden) return { error: "This restaurant is not taking tables." };
    const branch = (venue.branches || []).find((b) => b.id === input.branchId) || venue.branches?.[0];
    const capacity = Math.min(6, Math.max(2, Number(input.participants) || 2));
    const table = {
      id: `tbl-${Date.now().toString(36)}`,
      auto: false,
      dateISO: input.dateISO,
      time: input.time,
      tableType: input.tableType,
      capacity,
      joined: 1,
      hostHandle: session.handle,
      hostTier: tierFromPoints(session.points || 0, base.pointThresholds),
      gender: input.gender || "",
      orientation: input.orientation || "",
      ageRange: input.ageRange || "",
      branchId: branch?.id || "main",
      area: branch?.area || venue.area,
      address: branch?.address || venue.address,
      inviteText: `${session.handle} invites you to join a dinner and meet new friends.`,
      participants: [{ handle: session.handle, role: "host" }],
      pings: [],
    };
    venue.tables = [...(venue.tables || []), table];
    const hold = bookingHold(table);
    const entry = logEntry({ venue, table, hold, action: "opened", host: session.handle });
    const result = await notifyRestaurant({
      venueName: venue.name,
      email: venue.email,
      phone: venue.phone,
      method: venue.contactMethod || "email",
      action: "opened",
      dateISO: table.dateISO,
      time: table.time,
      host: session.handle,
      participants: hold.joined,
      held: hold.held,
      status: hold.status,
      reason: hold.reason,
      userEmail: session.email,
    });
    entry.channelNote = channelNote(result);
    entry.status = result.email === "sent" || result.sms === "sent" || result.whatsapp === "sent" ? "sent" : "pending";
    base.bookingLog = [entry, ...(base.bookingLog || [])].slice(0, 40);
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    const points = grantPoints("invite");
    rememberBooking({
      id: table.id, venueId: venue.id, name: venue.name, kind: "table", mode: "invite", at: Date.now(),
      dateISO: table.dateISO, time: table.time, location: table.address,
    }, points);
    pushNote("Table opened", `${venue.name} · ${table.time} · ${table.dateISO}. Restaurant queued via ${venue.contactMethod || "email"}.`);
    log(`Opened ${venue.name}`);
    return { ok: true, tableId: table.id, venueId: venue.id };
  }, [applyLive, editing, log, pushNote, session]);

  const joinTable = useCallback(async ({ venueId, tableId }) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const venue = base.venues.find((v) => v.id === venueId);
    const table = venue?.tables?.find((t) => t.id === tableId);
    if (!venue || !table) return { error: "That table is gone." };
    const before = bookingHold(table);
    if (before.closed || before.places <= 0 || before.status === "walk-in") return { error: before.reason };
    table.joined += 1;
    if ((venue.spots || 0) > 0) venue.spots -= 1;
    if (!Array.isArray(table.participants)) table.participants = [];
    if (!table.participants.some((p) => p.handle === session.handle)) {
      table.participants.push({ handle: session.handle, role: "guest" });
    }
    const hold = bookingHold(table);
    const entry = logEntry({ venue, table, hold, action: "joined", host: table.hostHandle });
    const result = await notifyRestaurant({
      venueName: venue.name,
      email: venue.email,
      phone: venue.phone,
      method: venue.contactMethod || "email",
      action: "joined",
      dateISO: table.dateISO,
      time: table.time,
      host: table.hostHandle,
      participants: hold.joined,
      held: hold.held,
      status: hold.status,
      reason: hold.reason,
      userEmail: session.email,
    });
    entry.channelNote = channelNote(result);
    entry.status = result.email === "sent" || result.sms === "sent" || result.whatsapp === "sent" ? "sent" : "pending";
    base.bookingLog = [entry, ...(base.bookingLog || [])].slice(0, 40);
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    const points = grantPoints("join");
    rememberBooking({
      id: table.id, venueId: venue.id, name: venue.name, kind: "table", mode: "join", at: Date.now(),
      dateISO: table.dateISO, time: table.time, location: table.address || venue.locationLabel,
    }, points);
    pushNote("You're booked", `${venue.name} · ${table.time} · ${hold.joined} people · ${hold.status}.`);
    if (hold.status === "walk-in") pushNote("Walk-in", `${venue.name} is no longer holding a table. You can still go without a reservation.`);
    return { ok: true };
  }, [applyLive, editing, pushNote, session]);

  const createPrivate = useCallback(async (input) => {
    if (!session) return { needLogin: true };
    if (!premium) return { error: "Premium trial required to host a private event." };
    const capacity = Math.min(20, Math.max(2, Number(input.capacity) || 8));
    const item = {
      id: `priv-${Date.now().toString(36)}`,
      kind: "private",
      name: (input.name || input.venueName || "Private table").trim(),
      typeLabel: input.forWhom || input.orientation || "Private",
      hostLabel: `Blind with ${session.handle}`,
      hostName: session.handle,
      upcomingLabel: `${capacity - 1} places`,
      spots: capacity - 1,
      joined: 1,
      capacity,
      hidden: false,
      featured: false,
      dateISO: input.dateISO,
      timeLabel: input.time,
      location: input.location,
      venueId: input.venueId || "",
      branchId: input.branchId || "",
      description: input.description,
      forWhom: input.forWhom,
      orientation: input.orientation || "",
      gender: input.gender || "",
      ageRange: input.ageRange || "",
      videoUrl: input.videoUrl || "",
      showHostPhoto: !!input.showHostPhoto,
      imageUrl: input.imageUrl || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      gallery: input.gallery || [],
      participants: [{ handle: session.handle, role: "host" }],
      pings: [],
    };
    const saved = await insertEvent(item, 5);
    if (!saved?.ok) return saved;
    pushNote("Private event", `${item.name} is live for Premium members. ${capacity - 1} places.`);
    return { ok: true, id: item.id };
  }, [insertEvent, premium, pushNote, session]);

  const joinPrivate = useCallback(async (id) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const item = base.events.find((e) => e.id === id && e.kind === "private");
    if (!item) return { error: "That event is gone." };
    if ((item.spots || 0) <= 0) return { error: "FULL" };
    item.spots -= 1;
    item.joined = (item.joined || 1) + 1;
    if (!Array.isArray(item.participants)) item.participants = [];
    if (!item.participants.some((p) => p.handle === session.handle)) {
      item.participants.push({ handle: session.handle, role: "guest" });
    }
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    const points = grantPoints("join");
    rememberBooking({
      id: item.id, name: item.name, kind: "private", mode: "join", at: Date.now(),
      dateISO: item.dateISO, time: item.timeLabel, location: item.location,
    }, points);
    pushNote("Private event", `${item.name} · ${item.timeLabel} · ${item.location}`);
    return { ok: true };
  }, [applyLive, editing, pushNote, session]);

  const sendPing = useCallback(async ({ venueId, tableId, eventId }) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const target = eventId
      ? base.events.find((e) => e.id === eventId)
      : base.venues.find((v) => v.id === venueId)?.tables?.find((t) => t.id === tableId);
    if (!target) return { error: "That event is gone." };
    const joined = (target.participants || []).some((p) => p.handle === session.handle)
      || target.hostHandle === session.handle
      || target.hostName === session.handle;
    if (!joined) return { error: "Join this table first." };
    const mode = pingWindow(target);
    if (!mode) return { error: "That button opens only in the 2 hours before, or the 30 minutes after the start." };
    target.pings = [...(target.pings || []), {
      id: `ping-${Date.now().toString(36)}`,
      from: session.handle,
      kind: mode,
      at: Date.now(),
      replies: [],
    }];
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    pushNote(mode === "see-you" ? "See you there" : "Are you coming?", "The other people on this table will see it in Buddy Blind.");
    return { ok: true };
  }, [applyLive, editing, pushNote, session]);

  const replyPing = useCallback(async ({ venueId, tableId, eventId, pingId, choice }) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const target = eventId
      ? base.events.find((e) => e.id === eventId)
      : base.venues.find((v) => v.id === venueId)?.tables?.find((t) => t.id === tableId);
    const ping = target?.pings?.find((p) => p.id === pingId);
    if (!ping) return { error: "That note is gone." };
    if (!(ping.replies || []).some((r) => r.from === session.handle)) {
      ping.replies = [...(ping.replies || []), { from: session.handle, choice, at: Date.now() }];
    }
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    const socialNext = { ...emptySocial(), ...read(SOCIAL, {}) };
    socialNext.notes = (socialNext.notes || []).map((n) => (n.ping?.pingId === pingId ? { ...n, replied: true } : n));
    saveSocial(socialNext);
    return { ok: true };
  }, [applyLive, editing, session]);

  useEffect(() => {
    if (!ready || !session) return;
    const mine = session.handle;
    const additions = [];
    const seen = new Set((social.notes || []).map((n) => n.id));
    const collect = (ping, meta, title) => {
      const id = `ping-note-${ping.id}`;
      if (ping.from === mine || seen.has(id)) return;
      if ((ping.replies || []).some((r) => r.from === mine)) return;
      seen.add(id);
      additions.push({
        id,
        title,
        body: ping.kind === "see-you" ? `${ping.from} says see you there.` : `${ping.from} asks if you are coming.`,
        at: ping.at || Date.now(),
        read: false,
        ping: { ...meta, pingId: ping.id, kind: ping.kind },
      });
    };
    (content.venues || []).forEach((venue) => {
      (venue.tables || []).forEach((table) => {
        const joined = (table.participants || []).some((p) => p.handle === mine) || table.hostHandle === mine;
        if (!joined) return;
        (table.pings || []).forEach((ping) => collect(ping, { venueId: venue.id, tableId: table.id }, `${venue.name} · ${table.time}`));
      });
    });
    (content.events || []).forEach((event) => {
      if (event.kind !== "private") return;
      const joined = (event.participants || []).some((p) => p.handle === mine) || event.hostName === mine;
      if (!joined) return;
      (event.pings || []).forEach((ping) => collect(ping, { eventId: event.id }, event.name));
    });
    if (!additions.length) return;
    saveSocial({ ...emptySocial(), ...read(SOCIAL, {}), notes: [...additions, ...(read(SOCIAL, {}).notes || [])].slice(0, 40) });
  }, [content, ready, session, social.notes]);

  useEffect(() => {
    if (!ready || !session || social.notesOn === false) return;
    const today = new Date();
    const key = `bb_remind_${today.getFullYear()}${today.getMonth()}${today.getDate()}_${session.email}`;
    if (typeof window === "undefined" || localStorage.getItem(key)) return;
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const hits = (session.bookings || []).filter((b) => b.dateISO === todayISO);
    if (!hits.length) return;
    localStorage.setItem(key, "1");
    hits.forEach((hit) => {
      pushNote("2-hour reminder", `Your Buddy Blind plan is today. ${hit.name} · ${hit.time || ""} · ${hit.location || ""}. This is the in-app reminder. SMS is not connected.`);
    });
  }, [pushNote, ready, session, social.notesOn]);


  const payFee = useCallback(async (intent) => {
    if (!session) return { needLogin: true };
    try {
      sessionStorage.setItem("bb_fee_pending", JSON.stringify({ intent }));
    } catch {
      return { error: "Couldn't hold this booking. Try a smaller photo." };
    }
    const here = `${window.location.pathname}${window.location.search}`;
    let data = {};
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "fee", email: session.email || "", returnPath: here }),
      });
      data = await res.json();
    } catch {
      data = {};
    }
    if (!data.ok || !data.url) {
      sessionStorage.removeItem("bb_fee_pending");
      return { error: data.reason || "Card checkout is not ready yet." };
    }
    window.location.assign(data.url);
    return { redirecting: true };
  }, [session]);

  const feeFlight = useRef(false);
  useEffect(() => {
    if (!ready || !session || feeFlight.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const strip = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      url.searchParams.delete("session_id");
      url.searchParams.delete("pay");
      const next = `${url.pathname}${url.search}`;
      window.history.replaceState({}, "", next);
    };
    if (params.get("pay") === "cancel") {
      sessionStorage.removeItem("bb_fee_pending");
      notify("Payment cancelled. Nothing was charged.");
      strip();
      return;
    }
    if (params.get("paid") !== "1") return;
    const sid = params.get("session_id") || "";
    if (!sid) return;
    if (sessionStorage.getItem("bb_fee_done") === sid) {
      strip();
      return;
    }
    const raw = sessionStorage.getItem("bb_fee_pending");
    if (!raw) return;
    feeFlight.current = true;
    (async () => {
      try {
        const check = await fetch(`/api/checkout?session_id=${encodeURIComponent(sid)}`);
        const data = await check.json();
        if (!data.ok || data.kind !== "fee") {
          notify(data.reason || "Payment was not confirmed.");
          feeFlight.current = false;
          return;
        }
        const { intent } = JSON.parse(raw);
        let res = { error: "That booking expired." };
        if (intent?.type === "open") res = await openTable(intent.input);
        else if (intent?.type === "join") res = await joinTable(intent.input);
        else if (intent?.type === "private-create") res = await createPrivate(intent.input);
        else if (intent?.type === "join-private") res = await joinPrivate(intent.input?.id);
        else if (intent?.type === "quick-join") res = await act("event", intent.input?.id, "join");
        if (res?.needLogin) {
          feeFlight.current = false;
          return;
        }
        if (res?.error) {
          notify(res.error);
          feeFlight.current = false;
          return;
        }
        sessionStorage.setItem("bb_fee_done", sid);
        sessionStorage.removeItem("bb_fee_pending");
        if (intent?.type === "private-create" && res?.id) {
          window.location.href = `/private/${res.id}`;
          return;
        }
        notify(intent?.type === "open" ? "Table opened." : "You're in.");
        strip();
      } catch {
        notify("Payment could not be finished. If you were charged, try again from the same browser.");
        feeFlight.current = false;
      }
    })();
  }, [act, createPrivate, joinPrivate, joinTable, notify, openTable, ready, session]);

  const value = useMemo(
    () => ({
      ready,
      remote,
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
      lang,
      setLang,
      trial,
      plan,
      planMeta,
      premium,
      setPlan,
      acceptTrial,
      cancelTrial,
      updateProfile,
      social,
      toggleNotes,
      markNotesRead,
      requestBuddy,
      respondBuddy,
      inviteBuddies,
      addReview,
      flow,
      setFlow,
      openTable,
      joinTable,
      createPrivate,
      joinPrivate,
      sendPing,
      replyPing,
      payFee,
    }),
    [
      ready, remote, content, session, staff, editing, preview, device, panel, dirty, toast, notify,
      selectedId, canUndo, canRedo, undo, redo, update, saveDraft, publish, login, logout,
      register, createInvite, activate, revokeAdmin, invites, revoked, users, activity,
      versions, restoreVersion, act, insertEvent, removeBlock, duplicateBlock, addBlock, toggleLock,
      toggleHide, resetDraft, confirm, lang, setLang, trial, plan, planMeta, premium, setPlan, acceptTrial, cancelTrial,
      updateProfile, social, toggleNotes, markNotesRead, requestBuddy, respondBuddy, inviteBuddies,
      addReview, flow, openTable, joinTable, createPrivate, joinPrivate, sendPing, replyPing, payFee,
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
