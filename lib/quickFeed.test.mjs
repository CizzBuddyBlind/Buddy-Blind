import assert from "node:assert/strict";
import test from "node:test";
import { joinOwnQuick, partnerQuickView, quickJoinState, quickRows } from "./quickFeed.js";

const host = { userId: "host-1", handle: "Host" };
const guest = { userId: "guest-1", handle: "Guest" };

function ownEvent(extra = {}) {
  return {
    id: "own-1",
    kind: "quick",
    source: "own",
    name: "ABC",
    capacity: 4,
    spots: 3,
    participants: [{ ...host, role: "host" }],
    ...extra,
  };
}

test("another user can join an open own-choice meetup and the host cannot", () => {
  const row = ownEvent();
  assert.equal(quickJoinState(row, host).canJoin, false);
  assert.equal(quickJoinState(row, guest).canJoin, true);
  assert.equal(quickJoinState(row, guest).openSeats, 3);
  const next = ownEvent();
  assert.equal(joinOwnQuick(next, host).error, "You're already in.");
  assert.equal(joinOwnQuick(next, guest).ok, true);
  assert.equal(next.participants.length, 2);
  assert.equal(next.spots, 2);
  assert.equal(quickJoinState(next, guest).canJoin, false);
});

test("a full own-choice meetup is closed", () => {
  const row = ownEvent({
    capacity: 2,
    spots: 0,
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
  });
  assert.equal(quickJoinState(row, { userId: "guest-2", handle: "Other" }).canJoin, false);
  assert.equal(quickJoinState(row, { userId: "guest-2" }).closed, true);
});

test("partner quick is derived from the table and is not stored as an event", () => {
  const table = {
    id: "tbl-1",
    quick: true,
    auto: false,
    dateISO: "2099-01-01",
    time: "7:00 PM",
    openedAt: "2099-01-01T08:00:00.000Z",
    capacity: 2,
    joined: 1,
    tableType: "meet-friends",
    post: "Lunch?",
    hostUserId: "host-1",
    hostHandle: "Host",
    participants: [{ userId: "host-1", handle: "Host", role: "host" }],
  };
  const content = {
    venues: [{ id: "kissa", name: "Kissa", hidden: false, tables: [table, { id: "auto", auto: true, quick: true }] }],
    events: [{ id: "q1", kind: "quick", name: "Sample" }],
  };
  const rows = quickRows(content);
  assert.equal(rows[0].source, "partner");
  assert.equal(rows[0].tableId, "tbl-1");
  assert.equal(rows[0].venueId, "kissa");
  assert.equal(rows[0].post, "Lunch?");
  assert.equal(rows.filter((row) => row.source === "partner").length, 1);
  assert.equal(content.events.length, 1);
  assert.equal(quickJoinState(rows[0], guest).canJoin, true);
  assert.equal(quickJoinState(rows[0], host).canJoin, false);
  const full = partnerQuickView(content.venues[0], {
    ...table,
    joined: 2,
    participants: [{ userId: "host-1", handle: "Host", role: "host" }, { userId: "guest-1", handle: "Guest", role: "guest" }],
  });
  assert.equal(quickJoinState(full, { userId: "guest-2", handle: "Other" }).canJoin, false);
  assert.equal(full.joinClosed, true);
});
