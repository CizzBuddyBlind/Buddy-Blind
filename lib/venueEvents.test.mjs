import assert from "node:assert/strict";
import test from "node:test";
import { iso } from "./bible.js";
import { quickRows } from "./quickFeed.js";
import { isPartnerQuick, isSyntheticTable, joinableVenueTables, normalVenueTables, venueTableState } from "./venueEvents.js";

const today = iso(0);
const now = new Date(`${today}T12:00:00+08:00`);

function table(extra) {
  return {
    id: "tbl-real",
    auto: false,
    dateISO: today,
    time: "8:00 PM",
    capacity: 4,
    joined: 1,
    openedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    hostHandle: "Ada",
    ...extra,
  };
}

test("partner quick is quick, not a venues event, and still a quick-feed row", () => {
  const quick = table({ id: "tbl-quick", quick: true, time: "1:00 PM", capacity: 2 });
  const venue = { id: "kissa", name: "Kissa", hidden: false, tables: [quick] };
  assert.equal(isPartnerQuick(quick), true);
  assert.equal(venueTableState(quick, now).joinable, false);
  assert.equal(joinableVenueTables(venue, now).length, 0);
  assert.equal(normalVenueTables(venue, now).length, 0);
  const feed = quickRows({ venues: [venue], events: [{ id: "own-1", kind: "quick", source: "own" }] });
  assert.equal(feed.some((row) => row.source === "partner" && row.tableId === "tbl-quick"), true);
  assert.equal(feed.some((row) => row.source === "own"), true);
});

test("an open invite table is the same state on discovery and detail", () => {
  const live = table();
  const venue = { tables: [live] };
  const state = venueTableState(live, now);
  const listed = normalVenueTables(venue, now);
  const open = joinableVenueTables(venue, now);
  assert.equal(listed.length, 1);
  assert.equal(open.length, 1);
  assert.equal(open[0].table.id, "tbl-real");
  assert.equal(open[0].places, state.places);
  assert.equal(open[0].closed, false);
  assert.equal(listed[0].places, open[0].places);
  assert.ok(open[0].places > 0);
});

test("a full invite table stays visible as closed and is not offered to join", () => {
  const full = table({ capacity: 2, joined: 2 });
  const venue = { tables: [full] };
  const listed = normalVenueTables(venue, now);
  const open = joinableVenueTables(venue, now);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].closed, true);
  assert.equal(listed[0].places, 0);
  assert.equal(open.length, 0);
});

test("synthetic rows cannot take the discovery slot from a real invite table", () => {
  const real = table({ id: "tbl-real", time: "9:00 PM" });
  const feature = table({
    id: "kissa-home-feature",
    time: "7:30 PM",
    joined: 48,
    capacity: 51,
  });
  const demo = table({
    id: "kissa-auto-oct26",
    auto: true,
    dateISO: "2026-10-26",
    time: "7:00 PM",
  });
  const quick = table({ id: "tbl-quick", quick: true, time: "12:00 PM" });
  const venue = { id: "kissa-tanaka", name: "Kissa Tanaka", tables: [feature, demo, quick, real] };
  const open = joinableVenueTables(venue, now);
  assert.equal(open[0].table.id, "tbl-real");
  assert.equal(isSyntheticTable(feature), true);
  assert.equal(isSyntheticTable(demo), true);
  assert.equal(open.some((row) => row.quick), false);
  assert.equal(normalVenueTables(venue, now).some((row) => row.table.id === "tbl-quick"), false);
});
