import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { navigateAppPage } from "./appScroll.js";

const MAIN = ["/", "/venues", "/quick", "/private", "/me-time", "/profile"];

function walk(order) {
  const scroller = { scrollTop: 0 };
  let route = order[0];
  for (let i = 1; i < order.length; i += 1) {
    scroller.scrollTop = 800 + i;
    const reset = navigateAppPage(scroller, route, order[i]);
    assert.equal(reset, true, `${route} → ${order[i]} should open at the top`);
    assert.equal(scroller.scrollTop, 0);
    route = order[i];
  }
}

test("mobile website and app open each main page at the top", () => {
  walk(MAIN);
  walk([...MAIN].reverse());
});

test("same page does not jump to the top", () => {
  const scroller = { scrollTop: 640 };
  assert.equal(navigateAppPage(scroller, "/venues", "/venues"), false);
  assert.equal(scroller.scrollTop, 640);
  assert.equal(navigateAppPage(scroller, "", "/venues"), false);
  assert.equal(scroller.scrollTop, 640);
});

test("both app surfaces reset through the shared navigation helper", () => {
  const app = fs.readFileSync(new URL("../components/StoreApp.js", import.meta.url), "utf8");
  const shell = fs.readFileSync(new URL("../components/Shell.js", import.meta.url), "utf8");
  const native = fs.readFileSync(new URL("../app/m/page.js", import.meta.url), "utf8");
  assert.match(app, /navigateAppPage\(scroller\.current, from, to\)/);
  assert.match(app, /navigateAppPage\(scroller\.current, previous, route\)/);
  assert.match(shell, /<StoreApp/);
  assert.match(native, /<StoreApp/);
  assert.match(shell, /window\.scrollTo\(0, 0\)/);
  assert.doesNotMatch(shell, /appScroll/);
});
