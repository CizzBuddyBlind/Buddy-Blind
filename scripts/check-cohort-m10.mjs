import assert from "node:assert/strict";
import { readFileSync } from "fs";
import { normalizeContent } from "../lib/bible.js";
import { canOfferJoin } from "../lib/joinOffer.js";
import { quickJoinState, quickRows } from "../lib/quickFeed.js";
import { isPartnerQuick, joinableVenueTables, normalVenueTables } from "../lib/venueEvents.js";

const content = JSON.parse(readFileSync(process.argv[2], "utf8"));
const cohortTables = [];
for (const venue of content.venues || []) {
  for (const table of venue.tables || []) {
    if (table?.cohort === "bb-manual-10") cohortTables.push({ venue, table });
  }
}
const cohortEvents = (content.events || []).filter((event) => event?.cohort === "bb-manual-10");
assert.equal(cohortTables.length, 7);
assert.equal(cohortEvents.length, 8);

const before = JSON.stringify(cohortTables.map(({ table }) => table.participants));
const clone = JSON.parse(JSON.stringify(content));
normalizeContent(clone);
const afterTables = [];
for (const venue of clone.venues || []) {
  for (const table of venue.tables || []) {
    if (table?.cohort === "bb-manual-10") afterTables.push(table);
  }
}
assert.equal(JSON.stringify(afterTables.map((table) => table.participants)), before);

for (const { venue, table } of cohortTables) {
  if (table.quick) {
    assert.equal(isPartnerQuick(table), true);
    assert.equal(joinableVenueTables(venue).some((row) => row.table.id === table.id), false);
    assert.equal(normalVenueTables(venue).some((row) => row.table.id === table.id), false);
    assert.equal(table.tableType, "meet-friends");
    assert.ok(table.capacity <= 2);
  } else {
    assert.equal(table.quick, false);
    assert.equal(table.tableType, "meet-friends");
  }
  assert.equal(table.joinersSeeded, true);
}

const rows = quickRows(content).filter((row) => String(row.id).startsWith("bbm-") || String(row.tableId || "").startsWith("bbm-"));
const quickIds = rows.map((row) => row.tableId || row.id).sort();
assert.deepEqual(quickIds, [
  "bbm-own-adc-full",
  "bbm-own-kam-open",
  "bbm-own-lanfong-joined",
  "bbm-own-sheko-open",
  "bbm-pq-cabane-full",
  "bbm-pq-kissa-open",
  "bbm-pq-yardbird-open",
].sort());
assert.equal(rows.some((row) => row.kind === "private"), false);
assert.equal(cohortEvents.filter((event) => event.kind === "private").every((event) => !quickRows(content).some((row) => row.id === event.id)), true);

const outsider = { userId: "bb-m10-outsider", handle: "Outsider" };
function session(id) {
  const tableHost = cohortTables.find(({ table }) => table.hostUserId === id);
  if (tableHost) return { userId: id, handle: tableHost.table.hostHandle };
  const event = cohortEvents.find((item) => item.hostUserId === id);
  return { userId: id, handle: event.hostHandle || event.hostName };
}

for (const row of rows) {
  const state = quickJoinState(row, session(row.hostUserId));
  assert.equal(state.canJoin, false, `${row.id || row.tableId} host`);
  const guest = quickJoinState(row, outsider);
  if (row.id === "bbm-own-adc-full" || row.tableId === "bbm-pq-cabane-full") assert.equal(guest.canJoin, false, row.id || row.tableId);
  else assert.equal(guest.canJoin, true, `${row.id || row.tableId} guest`);
}

for (const { venue, table } of cohortTables.filter(({ table }) => !table.quick)) {
  const listed = normalVenueTables(venue).find((row) => row.table.id === table.id);
  assert.ok(listed, table.id);
  const host = canOfferJoin({ record: table, session: session(table.hostUserId), places: listed.places, closed: listed.closed });
  assert.equal(host.canJoin, false, table.id);
  const guest = canOfferJoin({ record: table, session: outsider, places: listed.places, closed: listed.closed });
  if (table.id === "bbm-inv-oyster-full") {
    assert.equal(guest.canJoin, false, table.id);
    assert.equal(joinableVenueTables(venue).some((row) => row.table.id === table.id), false);
  } else {
    assert.equal(guest.canJoin, true, `${table.id} places ${listed.places}`);
    assert.equal(joinableVenueTables(venue).some((row) => row.table.id === table.id), true);
  }
  const member = table.participants.find((person) => person.role === "guest");
  if (member) {
    const again = canOfferJoin({ record: table, session: { userId: member.userId, handle: member.handle }, places: listed.places, closed: listed.closed });
    assert.equal(again.reason, "member", table.id);
  }
}

for (const event of cohortEvents.filter((item) => item.kind === "private")) {
  const offer = canOfferJoin({ record: event, session: session(event.hostUserId), places: event.spots, closed: event.spots <= 0 });
  assert.equal(offer.canJoin, false, event.id);
  const guest = canOfferJoin({ record: event, session: outsider, places: event.spots, closed: event.spots <= 0 });
  if (event.id === "bbm-priv-oyster-full") assert.equal(guest.reason, "full");
  else assert.equal(guest.canJoin, true, event.id);
  const member = event.participants.find((person) => person.role === "guest");
  if (member) {
    const again = canOfferJoin({ record: event, session: { userId: member.userId, handle: member.handle }, places: event.spots, closed: event.spots <= 0 });
    assert.equal(again.reason, "member", event.id);
  }
}

console.log(JSON.stringify({ ok: true, tables: cohortTables.length, events: cohortEvents.length, quick: rows.length }, null, 2));
