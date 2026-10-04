"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SEED, SEED_ACCOUNTS } from "@/lib/defaults";
import { loadSharedContent, saveSharedContent, supabaseReady } from "@/lib/supabase";
import { bookingHold, iso, logEntry, normalizeContent, privateEditOpen, tableStart, tierFromPoints, TRIAL_DAYS } from "@/lib/bible";
import { notifyRestaurant } from "@/lib/notify";
import { putMedia } from "@/lib/media";
import { pageFromPath, setWording, setWordingPage } from "@/lib/say";
import { castForFounder, fixtureAccountId, personRecord, phoneDigits, planPhoneChange, sameIdentity, stampContent } from "@/lib/people";
import { marketFromCode, marketFromTimezone } from "@/lib/market";
import { effectiveAccess, isInternalRole } from "@/lib/entitlement";

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
const WORDING = "bb_wording_v1";
const ENT = "bb_entitlement_v1";

function emptySocial() {
  return { buddies: [], reviews: [], notes: [], notesOn: true };
}

function rememberWording(content) {
  if (!content?.wording) return;
  write(WORDING, { at: Number(content.savedAt) || Date.now(), wording: content.wording });
}

function applyRemembered(content) {
  const box = read(WORDING, null);
  if (!content || !box?.wording) return content;
  if ((Number(box.at) || 0) >= (Number(content.savedAt) || 0)) {
    content.wording = box.wording;
    if (box.at) content.savedAt = box.at;
  }
  return content;
}

function stripHeavy(node, seen = new Set()) {
  if (!node || typeof node !== "object" || seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const value = node[i];
      if (typeof value === "string") {
        if (value.startsWith("data:") && value.length > 20000) node[i] = "";
      } else stripHeavy(value, seen);
    }
    return;
  }
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (typeof value === "string") {
      if (value.startsWith("data:") && value.length > 20000) node[key] = "";
    } else stripHeavy(value, seen);
  }
}

export function peopleYouCanRate(content, accountId, ctx = {}) {
  const meId = String(accountId || "");
  if (!content || !meId) return [];
  const idOf = (ref) => {
    if (ref && typeof ref === "object") return String(ref.userId || "");
    const text = String(ref || "");
    return personRecord(text, ctx)?.userId || "";
  };
  const now = Date.now();
  const found = new Map();
  const take = (label, eventId, dateISO, time, refs) => {
    const ids = [...new Set((refs || []).map(idOf).filter(Boolean))];
    if (!ids.includes(meId)) return;
    const start = tableStart({ dateISO, time: time || "7:00 PM" }).getTime();
    if (!dateISO || Number.isNaN(start) || now < start) return;
    ids.forEach((id) => {
      if (id === meId || found.has(id)) return;
      const record = personRecord(id, ctx);
      const reviewed = (content.peerReviews || []).some((review) => (review.fromUserId === meId) && (review.toUserId === id));
      found.set(id, { handle: record?.handle || "", userId: id, eventId, label, reviewed });
    });
  };
  (content.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      take(venue.name, table.id, table.dateISO, table.time, [
        table.hostUserId,
        ...(table.participants || []).map((p) => p.userId),
      ]);
    });
  });
  (content.events || []).forEach((event) => {
    take(event.name, event.id, event.dateISO, event.timeLabel, [
      event.hostUserId,
      ...(event.participants || []).map((p) => p.userId),
    ]);
  });
  const list = [...found.values()];
  if (!list.some((person) => person.userId === "acct_alex") && meId !== "acct_alex") {
    const alex = personRecord("acct_alex", ctx);
    const reviewed = (content.peerReviews || []).some((review) => review.fromUserId === meId && review.toUserId === "acct_alex");
    list.unshift({ handle: alex?.handle || "Alex", userId: "acct_alex", eventId: "review-sample", label: "Last supper", reviewed });
  }
  return list;
}

function clone(value) {
  stripHeavy(value);
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* the browser storage is full */
  }
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
    orientation: "",
    showIdentity: true,
    showPlace: true,
    phone: "",
    verified: false,
    ...partial,
  };
}

export function BuddyProvider({ children }) {
  const path = usePathname() || "/";
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
  const [market, setMarket] = useState(() => marketFromCode("HK"));
  const [trial, setTrial] = useState(null);
  const [plan, setPlanState] = useState("free");
  const [planMeta, setPlanMeta] = useState({ subscriptionId: "", customerId: "" });
  const [entitlement, setEntitlement] = useState(null);
  const [billingSynced, setBillingSynced] = useState(false);
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
    if (session?.marketLocked && (session.market === "HK" || session.market === "NZ" || session.market === "AU")) {
      setMarket(marketFromCode(session.market));
      return undefined;
    }
    let zone = null;
    try {
      zone = marketFromTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      zone = null;
    }
    if (zone) setMarket(zone);
    let cancel = false;
    fetch("/api/market", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancel || !data?.id) return;
        if (data.id === "NZ" || data.id === "AU" || !zone) setMarket(marketFromCode(data.id));
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [session?.market, session?.marketLocked]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const local = read(PUB, SEED);
      const dr = read(DRAFT, null);
      const ses = read(SES, null);
      if (ses?.email) {
        const seed = SEED_ACCOUNTS.find((account) => account.email === ses.email);
        const profiles = read(PROFILES, {});
        ses.userId = ses.userId || seed?.userId || `acct_${ses.email.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
        const extra = profiles[ses.userId] || profiles[ses.email] || {};
        if (extra.handle) ses.handle = extra.handle;
        const pointsMap = read(POINTS, {});
        const mapped = Number(pointsMap[ses.userId] ?? pointsMap[ses.email]);
        const seeded = seed?.points || 0;
        ses.points = Math.max(Number(ses.points) || 0, Number.isFinite(mapped) ? mapped : 0, Number(seeded) || 0);
      }
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
      setEntitlement(read(ENT, null));
      const stored = { ...emptySocial(), ...read(SOCIAL, {}) };
      if (!stored.buddies?.length) {
        stored.buddies = [
          { id: "b-mina", userId: "demo-mina", name: "Mina", status: "accepted", area: "Central", note: "Knows wine" },
          { id: "b-kenji", userId: "demo-kenji", name: "Kenji", status: "accepted", area: "CWB", note: "On time" },
          { id: "b-alex", userId: "acct_alex", name: "Alex", status: "accepted", area: "TST", note: "Easy to talk to" },
          { id: "b-sora", userId: "demo-sora", name: "Sora", status: "accepted", area: "Sheung Wan", note: "Good listener" },
        ];
        write(SOCIAL, stored);
      }
      stored.buddies = (stored.buddies || []).map((buddy) => buddy.userId ? buddy : { ...buddy, userId: fixtureAccountId(buddy.name) || "" });
      setSocial(stored);

      let pub = local?.venues && local?.copy ? local : clone(SEED);
      const res = await loadSharedContent();
      if (cancel) return;
      if (!res.ok) {
        setRemote(res.reason === "missing-env" ? "off" : "error");
      } else if (res.content) {
        pub = Number(local?.savedAt) > Number(res.content.savedAt || 0) ? local : res.content;
        setRemote("live");
      } else {
        try {
        const saved = await saveSharedContent(pub);
        if (saved?.ok) setRemote("live");
        else setRemote("error");
        } catch {
          setRemote("error");
        }
      }

      stripHeavy(pub);
      applyRemembered(pub);
      const clean = stampContent(normalizeContent(pub), { session: ses, users: read(USERS, []) });
      publishedRef.current = clean;
      setPublished(clean);
      write(PUB, clean);
      rememberWording(clean);
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
      return draftRef.current;
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

  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const staff = !!(session && (session.role === "admin" || session.role === "founder"));
  const editing = false;
  const content = editing ? draft || published : published;
  setWording(content?.wording);
  setWordingPage(pageFromPath(path));

  const saveDraft = useCallback(() => {
    const next = clone(draftRef.current || publishedRef.current);
    write(DRAFT, next);
    setDraft(next);
    setDirty(false);
    log("Saved draft");
    notify("Draft saved. Not live until you publish.");
  }, [log, notify]);

  const pushLive = useCallback(async (next) => {
    const slim = clone(next);
    for (const event of slim.events || []) {
      if (typeof event.videoUrl === "string" && event.videoUrl.startsWith("data:") && event.videoUrl.length > 120000) {
        await putMedia(`${event.id}:video`, event.videoUrl);
        event.videoUrl = `idb:${event.id}:video`;
      }
      if (Array.isArray(event.gallery)) {
        event.gallery = await Promise.all(event.gallery.map(async (src, index) => {
          if (typeof src === "string" && src.startsWith("data:")) {
            const key = `${event.id}:p${index}`;
            await putMedia(key, src);
            if (event.imageUrl === src) event.imageUrl = `idb:${key}`;
            return `idb:${key}`;
          }
          return src;
        }));
      }
      if (typeof event.imageUrl === "string" && event.imageUrl.startsWith("data:")) {
        await putMedia(`${event.id}:cover`, event.imageUrl);
        event.imageUrl = `idb:${event.id}:cover`;
      }
    }
    publishedRef.current = slim;
    setPublished(slim);
    setWording(slim.wording);
    rememberWording(slim);
    try { write(PUB, slim); } catch { /* the live copy still updates in this tab */ }
    if (supabaseReady) {
      const saved = await saveSharedContent(slim);
      setRemote(saved?.ok ? "live" : "error");
      if (!saved?.ok) return { ok: false, error: saved?.reason || "Could not update the live site." };
    }
    return { ok: true };
  }, []);

  const publish = useCallback(async (explicit) => {
    const next = clone(explicit || draftRef.current || publishedRef.current);
    next.savedAt = Date.now();
    rememberWording(next);
    setDraft(next);
    try { write(DRAFT, next); } catch { /* ignore quota */ }
    try {
      const history = [{ at: new Date().toISOString(), content: next }, ...read(VERSIONS, [])].slice(0, 8);
      write(VERSIONS, history);
      setVersions(history);
    } catch { /* ignore quota */ }
    setDirty(false);
    const saved = await pushLive(next);
    log("Published");
    notify(saved.ok ? "Updated. It is live now." : saved.error || "Saved on this browser only.");
    return saved;
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
      const digits = phoneDigits(id);
      const profiles = read(PROFILES, {});
      const found = all.find((account) => {
        const extraPhone = profiles[account.userId] || profiles[account.email] || {};
        const phone = phoneDigits(extraPhone.phone || account.phone);
        return account.email.toLowerCase() === key || account.username.toLowerCase() === key || (digits.length >= 8 && phone === digits);
      });
      if (!found || found.password !== password) return "Wrong email, phone, or password.";
      if (found.role !== "founder" && blocked.includes(found.email.toLowerCase())) return "This admin seat was removed.";
      const pointsMap = read(POINTS, {});
      const books = read(BOOKS, {});
      const extra = read(PROFILES, {})[found.userId] || read(PROFILES, {})[found.email] || {};
      const userId = found.userId || extra.userId || `acct_${found.email.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      const ses = {
        userId,
        email: found.email,
        username: found.username,
        role: found.role,
        handle: extra.handle || found.handle,
        points: Math.max(Number(found.points) || 0, Number(pointsMap[userId]) || 0, Number(pointsMap[found.email]) || 0),
        neighborhood: extra.neighborhood || found.neighborhood,
        ageRange: extra.ageRange || found.ageRange,
        occupation: extra.occupation || found.occupation,
        gender: extra.gender || found.gender || "",
        phone: extra.phone || found.phone || "",
        verified: extra.verified ?? !!found.verified,
        bookings: books[found.email] || [],
        market: extra.market || found.market || "",
        marketLocked: !!(extra.marketLocked || found.marketLocked),
      };
      persistSession(ses);
      if (ses.role === "admin" || ses.role === "founder") {
        setPreview(false);
        if (!draftRef.current) setDraft(clone(publishedRef.current));
      }
      log(`Login · ${ses.role} · ${ses.email}`);
      return null;
    },
    [log, market.id],
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
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) return "Enter a phone number with at least 8 digits.";
    if (!input.verified) return "Verify the phone number before creating the account.";
    if (!input.gender || !input.ageRange || !input.orientation) return "Add your gender, age range, and orientation.";
    const all = [...SEED_ACCOUNTS, ...read(USERS, [])];
    if (all.some((a) => a.email === email || a.username === username)) return "That email or username is already taken.";
    if (all.some((a) => String(a.phone || "").replace(/\D/g, "") === digits)) return "That phone number already has an account.";
    const nextUser = blankProfile({
      userId: `acct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      email,
      username,
      password,
      handle: input.handle?.trim() || username,
      role: "user",
      phone,
      gender: input.gender,
      ageRange: input.ageRange,
      orientation: input.orientation,
      showIdentity: true,
      showPlace: true,
      verified: !!input.verified,
      market: input.market || market.id,
      marketLocked: true,
    });
    const next = [...read(USERS, []), nextUser];
    write(USERS, next);
    setUsers(next);
    return login(email, password);
  }, [login, market.id]);

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
      const pointsMap = read(POINTS, {});
      const points = Math.max(Number(session.points) || 0, Number(pointsMap[session.userId]) || 0, Number(pointsMap[session.email]) || 0) + gain;
      const booking = { id, name: item.name, kind, mode, at: Date.now() };
      if (session.userId) pointsMap[session.userId] = points;
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
      const pointsMap = read(POINTS, {});
      const points = Math.max(Number(session.points) || 0, Number(pointsMap[session.userId]) || 0, Number(pointsMap[session.email]) || 0) + pointsGain;
      pointsMap[session.userId || session.email] = points;
      if (session.email) pointsMap[session.email] = points;
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
  const accessNow = billingSynced && entitlement ? effectiveAccess(entitlement, session?.role) : null;
  const premium = isInternalRole(session?.role) || (accessNow ? accessNow.plan === "premium" : plan === "premium" || trialOk);

  const applyAccess = useCallback((access, record) => {
    if (record) {
      write(ENT, record);
      setEntitlement(record);
    }
    setBillingSynced(true);
    if (isInternalRole(session?.role)) return;
    if (!access) return;
    const next = access.plan === "lite" || access.plan === "premium" ? access.plan : "free";
    const meta = {
      id: next,
      at: Date.now(),
      subscriptionId: access.subscriptionId || record?.subscriptionId || "",
      customerId: access.customerId || record?.customerId || "",
    };
    write(PLAN, meta);
    setPlanState(next);
    setPlanMeta({ subscriptionId: meta.subscriptionId, customerId: meta.customerId });
  }, [session?.role]);

  const refreshBilling = useCallback(async () => {
    const email = session?.email || "";
    if (!email) return null;
    try {
      const res = await fetch(`/api/billing?email=${encodeURIComponent(email)}&role=${encodeURIComponent(session?.role || "")}`);
      const data = await res.json();
      if (!data?.ok || !data.entitlement) {
        setBillingSynced(true);
        return data;
      }
      applyAccess(data.access, data.entitlement);
      return data;
    } catch {
      return null;
    }
  }, [applyAccess, session?.email, session?.role]);

  useEffect(() => {
    if (!session?.email) return undefined;
    refreshBilling();
    return undefined;
  }, [session?.email, refreshBilling]);

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
    notify(`Premium trial started. ${market.premium}/month after 90 days unless you cancel.`);
  }, [notify, market.premium]);

  const cancelTrial = useCallback(async () => {
    const ok = await confirm("Cancel the Premium trial?", "You keep Premium until the trial ends. You will not be charged.");
    if (!ok) return;
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cancel",
        email: session?.email || "",
        role: session?.role || "",
        subscriptionId: planMeta.subscriptionId || "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data?.ok) {
      notify(data?.reason || "Could not stop the renewal.");
      return;
    }
    applyAccess(data.access, data.entitlement);
    const when = data.entitlement?.periodEnd ? new Date(data.entitlement.periodEnd).toLocaleDateString() : "the trial ends";
    notify(`Premium stays until ${when}. No charge.`);
  }, [applyAccess, confirm, notify, planMeta.subscriptionId, session?.email, session?.role]);

  const updateProfile = useCallback((partial) => {
    if (!session) return;
    const allowed = ["handle", "gender", "orientation", "occupation", "neighborhood", "ageRange", "showIdentity", "showPlace"];
    const extra = { ...(read(PROFILES, {})[session.userId] || {}) };
    allowed.forEach((key) => {
      if (partial[key] !== undefined) extra[key] = partial[key];
    });
    extra.userId = session.userId;
    const all = { ...read(PROFILES, {}), [session.userId || session.email]: extra, [session.email]: extra };
    write(PROFILES, all);
    const nextUsers = read(USERS, []).map((u) => (u.email === session.email ? { ...u, ...extra, userId: u.userId || session.userId } : u));
    write(USERS, nextUsers);
    setUsers(nextUsers);
    persistSession({ ...session, ...extra, userId: session.userId, email: session.email });
    notify("Profile saved on this browser.");
  }, [notify, session]);

  const changePhone = useCallback((nextPhone) => {
    if (!session?.userId) return { error: "Log in first." };
    const profiles = read(PROFILES, {});
    const accounts = [...SEED_ACCOUNTS, ...read(USERS, [])];
    const planned = planPhoneChange({ accounts, profiles, session, nextPhone });
    if (!planned.ok) return planned;
    const before = session.userId;
    write(PROFILES, planned.profiles);
    const nextUsers = read(USERS, []).map((user) => (
      user.userId === before || user.email === session.email
        ? { ...user, phone: planned.session.phone, verified: true, userId: user.userId || before }
        : user
    ));
    write(USERS, nextUsers);
    setUsers(nextUsers);
    persistSession(planned.session);
    notify("Phone number updated.");
    return { ok: true, userId: planned.session.userId };
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

  const requestBuddy = useCallback((accountId) => {
    if (!session) return { needLogin: true };
    const record = personRecord(accountId, { session, users });
    if (!record?.userId || record.userId === session.userId) return { error: "Pick a person." };
    const buddy = { id: `b-${Date.now()}`, name: record.handle, userId: record.userId, status: "pending", at: Date.now() };
    const next = { ...social, buddies: [buddy, ...(social.buddies || [])] };
    saveSocial(next);
    pushNote("Buddy request", `${record.handle} — Hey! You are my vibe, let's be buddies!`);
    return { ok: true };
  }, [pushNote, session, social]);

  const respondBuddy = useCallback((id, accept) => {
    const next = {
      ...social,
      buddies: (social.buddies || []).map((b) => (b.id === id ? { ...b, status: accept ? "accepted" : "declined" } : b)),
    };
    saveSocial(next);
  }, [social]);

  const askBuddies = useCallback((names, invite) => {
    if (!session) return { error: "Log in first." };
    const list = [...new Set((names || []).map((name) => String(name).trim()).filter(Boolean))];
    if (!list.length) return { error: "Pick a buddy." };
    const from = session.handle || "A buddy";
    const current = { ...emptySocial(), ...read(SOCIAL, {}) };
    const notes = list.map((name, i) => ({
      id: `n-${Date.now()}-${i}`,
      title: "Join?",
      body: `${from} asked you to join ${invite?.name || "a table"}`,
      at: new Date().toISOString(),
      read: false,
      invite: { ...(invite || {}), buddy: name },
    }));
    saveSocial({ ...current, notes: [...notes, ...(current.notes || [])].slice(0, 40) });
    notify(list.length === 1 ? `Asked ${list[0]}.` : `Asked ${list.length}.`);
    return { ok: true };
  }, [notify, session]);

  const inviteBuddies = useCallback((eventName) => {
    const accepted = (social.buddies || []).filter((b) => b.status === "accepted");
    if (!accepted.length) return { error: "No buddies yet." };
    pushNote("Buddy invite", `You asked ${accepted.map((b) => b.name).join(", ")} to join ${eventName}.`);
    notify("Invite sent inside Notifications.");
    return { ok: true };
  }, [notify, pushNote, social]);

  const addReview = useCallback((stars, body, to, eventId, tags) => {
    const picked = (Array.isArray(tags) ? tags : []).map((tag) => String(tag).trim()).filter(Boolean);
    const text = [picked.join(" · "), String(body || "").trim()].filter(Boolean).join("\n");
    const target = String(to || "").trim();
    const score = Math.min(5, Math.max(1, Number(stars) || 0));
    if (!session) return { error: "Log in first." };
    const staffReview = session.role === "founder" || session.role === "admin";
    if (!(plan === "lite" || plan === "premium" || trialOk || staffReview)) return { error: "Comments and stars are on Lite and Premium." };
    if (!score || !target) return { error: "Pick someone and a star." };
    if (target === session.userId) return { error: "You can't rate yourself." };
    const allowed = peopleYouCanRate(publishedRef.current, session.userId, { session, users });
    const match = allowed.find((person) => person.userId === target);
    if (!match) return { error: "You can only rate someone who sat with you." };
    const review = {
      id: `r-${Date.now()}`,
      stars: score,
      body: text,
      tags: picked,
      from: session.handle,
      fromUserId: session.userId || "",
      to: match.handle || "",
      toUserId: match.userId,
      eventId: eventId || match.eventId || "",
      at: Date.now(),
    };
    const src = publishedRef.current;
    const next = { ...src, peerReviews: [review, ...(src.peerReviews || [])].slice(0, 80) };
    publishedRef.current = next;
    setPublished(next);
    setTimeout(() => {
      try {
        stripHeavy(next);
        write(PUB, next);
        if (supabaseReady) saveSharedContent(next).catch(() => setRemote("error"));
      } catch { /* the comment stays on screen */ }
    }, 0);
    notify("Saved.");
    return { ok: true };
  }, [notify, plan, session, trialOk, users]);

  const applyLive = useCallback(async (base) => {
    if (editing) {
      commit(base);
      return { ok: true, draft: true };
    }
    return pushLive(base);
  }, [commit, editing, pushLive]);

  const grantPoints = (mode) => {
    const gain = mode === "invite" ? 2 : mode === "create" ? 5 : 1;
    const pointsMap = read(POINTS, {});
    const book = pointsMap && typeof pointsMap === "object" ? pointsMap : {};
    const current = Math.max(Number(session?.points) || 0, Number(book[session?.email]) || 0);
    const points = current + gain;
    if (session?.userId) book[session.userId] = points;
    if (session?.email) book[session.email] = points;
    write(POINTS, book);
    return points;
  };

  const rememberBooking = (booking, points) => {
    if (!session?.email) return;
    const books = read(BOOKS, {});
    const bag = books && typeof books === "object" ? books : {};
    bag[session.email] = [...(bag[session.email] || []), booking].slice(-20);
    write(BOOKS, bag);
    persistSession({ ...session, points, bookings: bag[session.email] });
  };

  const openTable = useCallback(async (input) => {
    try {
    if (!session) return { needLogin: true };
    const src = publishedRef.current;
    const found = src?.venues?.find((v) => v.id === input.venueId);
    if (!found) return { error: "That restaurant is not on the page." };
    if (found.hidden) return { error: "This restaurant is not taking tables." };
    const branch = (found.branches || []).find((b) => b.id === input.branchId) || found.branches?.[0];
    const capacity = Math.min(6, Math.max(2, Number(input.participants) || 2));
    const table = {
      id: `tbl-${Date.now().toString(36)}`,
      auto: false,
      dateISO: input.dateISO,
      time: input.time,
      tableType: input.tableType,
      capacity,
      joined: 1,
      hostUserId: session.userId || "",
      hostHandle: session.handle,
      hostTier: tierFromPoints(session.points || 0, src.pointThresholds),
      gender: input.gender || "",
      orientation: input.orientation || "",
      ageRange: input.ageRange || "",
      branchId: branch?.id || "main",
      area: branch?.area || found.area,
      address: branch?.address || found.address,
      inviteText: `${session.handle} invites you to join a dinner and meet new friends.`,
      participants: [{ userId: session.userId || "", handle: session.handle, role: "host" }],
      pings: [],
    };
    const existing = Array.isArray(found.tables) ? found.tables.filter(Boolean) : [];
    const venue = { ...found, tables: [...existing, table] };
    const hold = bookingHold(table);
    const next = {
      ...src,
      venues: (src.venues || []).filter(Boolean).map((v) => (v.id === venue.id ? venue : v)),
      bookingLog: [logEntry({ venue, table, hold, action: "opened", host: session.handle }), ...(src.bookingLog || [])].slice(0, 40),
    };
    publishedRef.current = next;
    setPublished(next);
    setTimeout(() => {
      try {
        stripHeavy(next);
        write(PUB, next);
        if (supabaseReady) saveSharedContent(next).catch(() => setRemote("error"));
      } catch { /* keep the table on screen even if the save is slow */ }
    }, 0);
    notifyRestaurant({
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
    }).catch(() => {});
    const points = grantPoints("invite");
    rememberBooking({
      id: table.id, venueId: venue.id, name: venue.name, kind: "table", mode: "invite", at: Date.now(),
      dateISO: table.dateISO, time: table.time, location: table.address,
    }, points);
    pushNote("Table opened", `${venue.name} · ${table.time} · ${table.dateISO}.`);
    return { ok: true, tableId: table.id, venueId: venue.id };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not open the table." };
    }
  }, [pushNote, session]);

  const joinTable = useCallback(async ({ venueId, tableId }) => {
    try {
    if (!session) return { needLogin: true };
    const src = publishedRef.current;
    const found = src?.venues?.find((v) => v.id === venueId);
    if (!found) return { error: "That restaurant is not on the page." };
    const tables = Array.isArray(found.tables) ? found.tables.filter(Boolean) : [];
    const current = tables.find((t) => t.id === tableId);
    if (!current) return { error: "That table is gone." };
    const before = bookingHold(current);
    if (before.closed || before.places <= 0 || before.status === "walk-in") return { error: before.reason || "That table is full." };
    const people = [...(current.participants || [])];
    if (!people.some((p) => sameIdentity(p.userId || p.handle, session, { session, users }))) people.push({ userId: session.userId || "", handle: session.handle, role: "guest" });
    const table = {
      ...current,
      joined: (current.joined || 1) + 1,
      participants: people,
    };
    const venue = {
      ...found,
      spots: Math.max(0, (found.spots || 0) - 1),
      tables: tables.map((t) => (t.id === table.id ? table : t)),
    };
    const hold = bookingHold(table);
    const next = {
      ...src,
      venues: (src.venues || []).filter(Boolean).map((v) => (v.id === venue.id ? venue : v)),
      bookingLog: [logEntry({ venue, table, hold, action: "joined", host: table.hostHandle }), ...(src.bookingLog || [])].slice(0, 40),
    };
    publishedRef.current = next;
    setPublished(next);
    setTimeout(() => {
      try {
        stripHeavy(next);
        write(PUB, next);
        if (supabaseReady) saveSharedContent(next).catch(() => setRemote("error"));
      } catch { /* the seat is already kept on screen */ }
    }, 0);
    notifyRestaurant({
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
    }).catch(() => {});
    const points = grantPoints("join");
    rememberBooking({
      id: table.id, venueId: venue.id, name: venue.name, kind: "table", mode: "join", at: Date.now(),
      dateISO: table.dateISO, time: table.time, location: table.address || venue.locationLabel,
    }, points);
    pushNote("You're booked", `${venue.name} · ${table.time} · ${hold.joined} people.`);
    return { ok: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not join the table." };
    }
  }, [pushNote, session]);

  const createPrivate = useCallback(async (input) => {
    if (!session) return { needLogin: true };
    const capacity = Math.min(20, Math.max(2, Number(input.capacity) || 8));
    const id = `priv-${Date.now().toString(36)}`;
    let imageUrl = input.imageUrl || "";
    let gallery = Array.isArray(input.gallery) ? [...input.gallery] : [];
    let videoUrl = input.videoUrl || "";
    try {
      if (videoUrl.startsWith("data:")) {
        await putMedia(`${id}:video`, videoUrl);
        videoUrl = `idb:${id}:video`;
      }
      gallery = await Promise.all(gallery.map(async (src, index) => {
        if (typeof src === "string" && src.startsWith("data:")) {
          const key = `${id}:p${index}`;
          await putMedia(key, src);
          if (src === imageUrl) imageUrl = `idb:${key}`;
          return `idb:${key}`;
        }
        return src;
      }));
      if (imageUrl.startsWith("data:")) {
        await putMedia(`${id}:cover`, imageUrl);
        imageUrl = `idb:${id}:cover`;
      }
    } catch {
      return { error: "That photo or video didn't save. Try a smaller one." };
    }
    const item = {
      id,
      kind: "private",
      name: (input.name || input.venueName || "Private table").trim(),
      typeLabel: input.forWhom || input.orientation || "Private",
      hostLabel: `Blind with ${session.handle}`,
      hostUserId: session.userId || "",
      hostName: session.handle,
      hostTier: tierFromPoints(session.points || 0, publishedRef.current?.pointThresholds),
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
      aboutHost: (input.aboutHost || "").trim(),
      hostProfile: {
        handle: session.handle,
        ageRange: session.ageRange || "",
        gender: session.gender || "",
        orientation: session.orientation || "",
        neighborhood: session.neighborhood || "",
        occupation: session.occupation || "",
        buddies: ((read(SOCIAL, {}).buddies) || []).filter((b) => b.status === "accepted").length,
      },
      forWhom: input.forWhom,
      orientation: input.orientation || "",
      gender: input.gender || "",
      ageRange: input.ageRange || "",
      videoUrl,
      showHostPhoto: !!input.showHostPhoto,
      imageUrl,
      gallery,
      participants: [{ userId: session.userId || "", handle: session.handle, role: "host" }],
      pings: [],
    };
    const saved = await insertEvent(item, 5);
    if (!saved?.ok) return saved;
    pushNote("Private event", `${item.name} is live for Premium members. ${capacity - 1} places.`);
    return { ok: true, id: item.id };
  }, [insertEvent, pushNote, session]);

  const updatePrivate = useCallback(async (input) => {
    if (!session) return { needLogin: true };
    const src = publishedRef.current;
    const current = (src?.events || []).find((event) => event.id === input.id && event.kind === "private");
    if (!current) return { error: "That night is gone." };
    const host = current.hostUserId || current.hostName || current.hostProfile?.handle;
    if (!sameIdentity(host, session, { session, users })) return { error: "Only the host can edit this." };
    if (!privateEditOpen(current.dateISO)) return { error: "Too close to the night. Nothing can change now." };
    let gallery = (Array.isArray(input.gallery) ? input.gallery : current.gallery || []).filter(Boolean).slice(0, 6);
    let videoUrl = input.videoUrl == null ? current.videoUrl || "" : input.videoUrl;
    let imageUrl = gallery[0] || current.imageUrl || "";
    try {
      if (typeof videoUrl === "string" && videoUrl.startsWith("data:")) {
        await putMedia(`${current.id}:video`, videoUrl);
        videoUrl = `idb:${current.id}:video`;
      }
      gallery = await Promise.all(gallery.map(async (srcUrl, index) => {
        if (typeof srcUrl === "string" && srcUrl.startsWith("data:")) {
          const key = `${current.id}:e${index}`;
          await putMedia(key, srcUrl);
          return `idb:${key}`;
        }
        return srcUrl;
      }));
      imageUrl = gallery[0] || "";
    } catch {
      return { error: "That photo or video didn't save. Try a smaller one." };
    }
    const nextEvent = {
      ...current,
      description: String(input.description ?? current.description ?? "").trim(),
      aboutHost: String(input.aboutHost ?? current.aboutHost ?? "").trim(),
      gallery,
      imageUrl,
      videoUrl: videoUrl || "",
    };
    const next = { ...src, events: src.events.map((event) => (event.id === nextEvent.id ? nextEvent : event)) };
    publishedRef.current = next;
    setPublished(next);
    setTimeout(() => {
      try {
        stripHeavy(next);
        write(PUB, next);
        if (supabaseReady) saveSharedContent(next).catch(() => setRemote("error"));
      } catch { /* the edit stays on screen */ }
    }, 0);
    return { ok: true };
  }, [session]);

  const joinPrivate = useCallback(async (id) => {
    if (!session) return { needLogin: true };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const item = base.events.find((e) => e.id === id && e.kind === "private");
    if (!item) return { error: "That event is gone." };
    if ((item.spots || 0) <= 0) return { error: "FULL" };
    item.spots -= 1;
    item.joined = (item.joined || 1) + 1;
    if (!Array.isArray(item.participants)) item.participants = [];
    if (!item.participants.some((p) => sameIdentity(p.userId || p.handle, session, { session, users }))) {
      item.participants.push({ userId: session.userId || "", handle: session.handle, role: "guest" });
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

  const sendPing = useCallback(async ({ venueId, tableId, eventId, choice }) => {
    if (!session) return { needLogin: true };
    const lines = {
      coming: "I'm coming",
      cant: "Can't make today",
      here: "I'm here",
      miss: "Can't make it tonight",
    };
    const line = lines[choice];
    if (!line) return { error: "Pick a line first." };
    const base = clone(editing ? draftRef.current || publishedRef.current : publishedRef.current);
    const target = eventId
      ? base.events.find((e) => e.id === eventId)
      : base.venues.find((v) => v.id === venueId)?.tables?.find((t) => t.id === tableId);
    if (!target) return { error: "That event is gone." };
    const joined = (target.participants || []).some((p) => sameIdentity(p.userId || p.handle, session, { session, users }))
      || sameIdentity(target.hostUserId || target.hostHandle || target.hostName, session, { session, users });
    if (!joined) return { error: "Join this table first." };
    const others = (target.participants || []).filter((p) => (p.userId || p.handle) && !sameIdentity(p.userId || p.handle, session, { session, users }));
    if (!others.length) return { error: "No one else has joined yet." };
    const day = target.dateISO || "";
    if (day && day < iso(0)) return { error: "That event is already over." };
    if (day !== iso(0)) return { error: "Notify opens on the day." };
    const start = tableStart({ dateISO: day, time: target.time || target.timeLabel }).getTime();
    const live = Date.now() >= start;
    if (live && choice !== "here" && choice !== "miss") return { error: "That line was for before it started." };
    if (!live && choice !== "coming" && choice !== "cant") return { error: "That line opens once it starts." };
    target.pings = [...(target.pings || []), {
      id: `ping-${Date.now().toString(36)}`,
      fromUserId: session.userId || "",
      from: session.handle,
      kind: choice,
      at: Date.now(),
      replies: [],
    }];
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    pushNote("Sent", line);
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
    const allowed = {
      coming: ["see-ya", "next-time"],
      cant: ["see-ya", "next-time"],
      here: ["on-way", "miss-reply"],
      miss: ["on-way", "miss-reply"],
      "see-you": ["see-ya", "next-time"],
      arrive: ["see-ya", "next-time"],
    };
    if (!(allowed[ping.kind] || allowed.coming).includes(choice)) return { error: "Pick a line first." };
    if (sameIdentity(ping.fromUserId || ping.from, session, { session, users })) return { error: "This one is already yours." };
    if ((ping.replies || []).some((r) => sameIdentity(r.fromUserId || r.from, session, { session, users }))) return { error: "Already sent." };
    ping.replies = [...(ping.replies || []), { fromUserId: session.userId || "", from: session.handle, choice, at: Date.now() }];
    const saved = await applyLive(base);
    if (!saved.ok && saved.error) return { error: saved.error };
    const socialNext = { ...emptySocial(), ...read(SOCIAL, {}) };
    socialNext.notes = (socialNext.notes || []).map((n) => (n.ping?.pingId === pingId ? { ...n, replied: true } : n));
    saveSocial(socialNext);
    return { ok: true };
  }, [applyLive, editing, session]);

  useEffect(() => {
    if (!ready || !session) return;
    const me = session;
    const isMe = (ref) => sameIdentity(ref, me, { session: me, users });
    const additions = [];
    const seen = new Set((social.notes || []).map((n) => n.id));
    const line = {
      coming: "I'm coming",
      cant: "Can't make today",
      here: "I'm here",
      miss: "Can't make it tonight",
      "see-you": "See you there",
      arrive: "Are you coming?",
    };
    const replyLine = {
      "see-ya": "See ya",
      "next-time": "All good, next time",
      "on-way": "On my way",
      "miss-reply": "Next time",
      ok: "Ok, no worries",
    };
    const collect = (ping, meta, title) => {
      if (!isMe(ping.fromUserId || ping.from)) {
        const id = `ping-note-${ping.id}`;
        if (!seen.has(id) && !(ping.replies || []).some((r) => isMe(r.fromUserId || r.from))) {
          seen.add(id);
          additions.push({
            id,
            title,
            body: `${personRecord(ping.fromUserId || ping.from, { session, users })?.handle || ping.from} · ${line[ping.kind] || "I'm coming"}`,
            at: ping.at || Date.now(),
            read: false,
            ping: { ...meta, pingId: ping.id, kind: ping.kind },
          });
        }
        return;
      }
      (ping.replies || []).forEach((reply) => {
        const id = `ping-reply-${ping.id}-${reply.from}`;
        if (seen.has(id)) return;
        seen.add(id);
        additions.push({
          id,
          title,
          body: `${personRecord(reply.fromUserId || reply.from, { session, users })?.handle || reply.from} · ${replyLine[reply.choice] || "See ya"}`,
          at: reply.at || Date.now(),
          read: false,
          ping: { ...meta, pingId: ping.id, replyOnly: true },
        });
      });
    };
    (content.venues || []).forEach((venue) => {
      (venue.tables || []).forEach((table) => {
        const joined = (table.participants || []).some((p) => isMe(p.userId || p.handle)) || isMe(table.hostUserId || table.hostHandle);
        if (!joined) return;
        (table.pings || []).forEach((ping) => collect(ping, { venueId: venue.id, tableId: table.id }, `${venue.name} · ${table.time}`));
      });
    });
    (content.events || []).forEach((event) => {
      if (event.kind !== "private") return;
      const joined = (event.participants || []).some((p) => isMe(p.userId || p.handle)) || isMe(event.hostUserId || event.hostName);
      if (!joined) return;
      (event.pings || []).forEach((ping) => collect(ping, { eventId: event.id }, event.name));
    });
    if (!additions.length) return;
    saveSocial({ ...emptySocial(), ...read(SOCIAL, {}), notes: [...additions, ...(read(SOCIAL, {}).notes || [])].slice(0, 40) });
  }, [content, ready, session, social.notes, users]);

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

  const value = useMemo(
    () => ({
      ready,
      remote,
      content: castForFounder(content, session),
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
      market,
      trial,
      plan,
      planMeta,
      premium,
      entitlement,
      refreshBilling,
      setPlan,
      acceptTrial,
      cancelTrial,
      updateProfile,
      changePhone,
      social,
      toggleNotes,
      markNotesRead,
      requestBuddy,
      respondBuddy,
      inviteBuddies, askBuddies,
      addReview,
      flow,
      setFlow,
      openTable,
      joinTable,
      createPrivate,
      updatePrivate,
      joinPrivate,
      sendPing,
      replyPing,
    }),
    [
      ready, remote, content, session, staff, editing, preview, device, panel, dirty, toast, notify,
      selectedId, canUndo, canRedo, undo, redo, update, saveDraft, publish, login, logout,
      register, createInvite, activate, revokeAdmin, invites, revoked, users, activity,
      versions, restoreVersion, act, insertEvent, removeBlock, duplicateBlock, addBlock, toggleLock,
      toggleHide, resetDraft, confirm, lang, setLang, market, trial, plan, planMeta, premium, entitlement, refreshBilling, setPlan, acceptTrial, cancelTrial,
      updateProfile, changePhone, social, toggleNotes, markNotesRead, requestBuddy, respondBuddy, inviteBuddies,
      addReview, flow, openTable, joinTable, createPrivate, updatePrivate, joinPrivate, sendPing, replyPing,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" onClick={() => closeModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 text-fg" onClick={(e) => e.stopPropagation()}>
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
