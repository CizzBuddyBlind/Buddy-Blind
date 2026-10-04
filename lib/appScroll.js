// Mobile website and the app scroll inside .bb-store-scroll, not the window.
// Main-page navigation must call navigateAppPage. Same-route updates must not.

export function shouldResetAppScroll(fromRoute, toRoute) {
  const from = String(fromRoute || "");
  const to = String(toRoute || "");
  if (!from || !to || from === to) return false;
  return true;
}

export function resetAppPageScroll(scroller) {
  if (scroller) scroller.scrollTop = 0;
}

export function navigateAppPage(scroller, fromRoute, toRoute) {
  if (!shouldResetAppScroll(fromRoute, toRoute)) return false;
  resetAppPageScroll(scroller);
  return true;
}
