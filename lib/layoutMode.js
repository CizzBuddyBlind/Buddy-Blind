export const APP_BREAKPOINT = 1080;

const TABS = new Set(["home", "venues", "quick", "how", "private", "profile"]);

export function prefersAppLayout(width) {
  return Number(width) < APP_BREAKPOINT;
}

export function pathToApp(path, search = "") {
  const params = typeof search === "string"
    ? new URLSearchParams(String(search).replace(/^\?/, ""))
    : search;
  const clean = path || "/";
  if (clean === "/m" || clean.startsWith("/m/")) {
    const tab = params?.get?.("tab") || "home";
    return { tab: TABS.has(tab) ? tab : "home", venueId: "", eventId: "", guest: "" };
  }
  if (clean === "/") return { tab: "home", venueId: "", eventId: "", guest: "" };
  if (clean.startsWith("/venues/")) return { tab: "venues", venueId: decodeURIComponent(clean.split("/")[2] || ""), eventId: "", guest: "" };
  if (clean === "/venues") return { tab: "venues", venueId: "", eventId: "", guest: "" };
  if (clean === "/quick") return { tab: "quick", venueId: "", eventId: "", guest: "" };
  if (clean === "/me-time") return { tab: "how", venueId: "", eventId: "", guest: "" };
  if (clean.startsWith("/private/")) return { tab: "private", venueId: "", eventId: decodeURIComponent(clean.split("/")[2] || ""), guest: "" };
  if (clean === "/private") return { tab: "private", venueId: "", eventId: "", guest: "" };
  if (clean === "/profile") return { tab: "profile", venueId: "", eventId: "", guest: params?.get?.("u") || "" };
  return null;
}

export function appToPath({ tab = "home", venueId = "", eventId = "", guest = "" } = {}) {
  if (venueId) return `/venues/${venueId}`;
  if (eventId) return `/private/${eventId}`;
  if (tab === "venues") return "/venues";
  if (tab === "quick") return "/quick";
  if (tab === "how") return "/me-time";
  if (tab === "private") return "/private";
  if (tab === "profile") return guest ? `/profile?u=${encodeURIComponent(guest)}` : "/profile";
  return "/";
}

export function surfaceFor(width, path) {
  if (!prefersAppLayout(width) && (path === "/m" || String(path || "").startsWith("/m/"))) return "website";
  if (prefersAppLayout(width) && pathToApp(path)) return "app";
  return "website";
}

export function nativeAppFrom({ ua = "", standalone = false, displayMode = "" } = {}) {
  if (/BuddyBlindApp/i.test(ua)) return true;
  if (standalone) return true;
  return displayMode === "standalone";
}

export function mobileWebFrom({ ua = "", standalone = false, displayMode = "", touchMac = false } = {}) {
  if (nativeAppFrom({ ua, standalone, displayMode })) return false;
  if (/iPhone|iPod|iPad|Android/i.test(ua)) return true;
  return !!touchMac;
}

export function helloStep({ saved = "", loggedIn = false, mobileWeb = false } = {}) {
  if (!mobileWeb || saved === "done") return "";
  if (saved === "login") return loggedIn ? "" : "login";
  return "app";
}

export function helloAfterDismiss(step, loggedIn) {
  if (step === "app" && !loggedIn) return "login";
  return "done";
}

export function isNativeApp() {
  if (typeof navigator === "undefined") return false;
  let displayMode = "";
  try {
    displayMode = window.matchMedia("(display-mode: standalone)").matches ? "standalone" : "";
  } catch { /* ignore */ }
  return nativeAppFrom({
    ua: navigator.userAgent || "",
    standalone: navigator.standalone === true,
    displayMode,
  });
}

export function isMobileWeb() {
  if (typeof navigator === "undefined") return false;
  let displayMode = "";
  try {
    displayMode = window.matchMedia("(display-mode: standalone)").matches ? "standalone" : "";
  } catch { /* ignore */ }
  return mobileWebFrom({
    ua: navigator.userAgent || "",
    standalone: navigator.standalone === true,
    displayMode,
    touchMac: navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1,
  });
}

