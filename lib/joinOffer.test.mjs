import assert from "node:assert/strict";
import test from "node:test";
import { iso } from "./bible.js";
import { canOfferJoin } from "./joinOffer.js";

const today = iso(0);
const host = { userId: "ada", handle: "Ada" };
const guest = { userId: "bo", handle: "Bo" };

function table(extra = {}) {
  return {
    id: "tbl-1",
    dateISO: today,
    hostUserId: host.userId,
    hostHandle: host.handle,
    participants: [{ userId: host.userId, handle: host.handle, role: "host" }],
    ...extra,
  };
}

test("the creator is not offered JOIN, another person is, on an open table", () => {
  const row = table();
  assert.equal(canOfferJoin({ record: row, session: host, places: 1, closed: false }).canJoin, false);
  assert.equal(canOfferJoin({ record: row, session: guest, places: 1, closed: false }).canJoin, true);
});

test("a host is still recognised when only the handle was stored", () => {
  const row = table({ hostUserId: "", participants: [{ handle: "Ada", role: "host" }] });
  assert.equal(canOfferJoin({ record: row, session: host, places: 1, closed: false }).reason, "host");
});

test("a full, expired, or already-joined event is not actionable", () => {
  const row = table({ participants: [{ userId: host.userId, handle: host.handle, role: "host" }, { userId: guest.userId, handle: guest.handle, role: "guest" }] });
  assert.equal(canOfferJoin({ record: row, session: guest, places: 1, closed: false }).reason, "member");
  assert.equal(canOfferJoin({ record: table(), session: guest, places: 0, closed: true }).reason, "full");
  assert.equal(canOfferJoin({ record: table({ dateISO: "2020-01-01" }), session: guest, places: 2, closed: false }).reason, "expired");
});

test("the same rule covers a private event and an own-choice quick", () => {
  const night = { kind: "private", dateISO: today, hostUserId: host.userId, hostName: host.handle, spots: 4, participants: [{ userId: host.userId, handle: host.handle, role: "host" }] };
  const own = { kind: "quick", source: "own", dateISO: today, hostUserId: host.userId, hostHandle: host.handle, participants: [{ userId: host.userId, handle: host.handle, role: "host" }] };
  assert.equal(canOfferJoin({ record: night, session: host, places: 4, closed: false }).canJoin, false);
  assert.equal(canOfferJoin({ record: night, session: guest, places: 4, closed: false }).canJoin, true);
  assert.equal(canOfferJoin({ record: own, session: host, places: 1, closed: false }).canJoin, false);
  assert.equal(canOfferJoin({ record: own, session: guest, places: 1, closed: false }).canJoin, true);
});

test("a different account with the same handle is still offered JOIN", () => {
  const row = table();
  const other = { userId: "other", handle: "Ada" };
  assert.equal(canOfferJoin({ record: row, session: other, places: 1, closed: false }).canJoin, true);
  assert.equal(canOfferJoin({ record: row, session: null, places: 1, closed: false }).canJoin, true);
});
