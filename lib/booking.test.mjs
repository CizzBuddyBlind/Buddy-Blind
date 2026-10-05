import assert from "node:assert/strict";
import test from "node:test";
import { bookingHold } from "./bible.js";
import { cappedCapacity, headsUpText, planVenueNotices } from "./booking.js";

const venue = { name: "Crave", contactMethod: "whatsapp", email: "book@crave.example", phone: "+85255550199" };

function table(extra) {
  return {
    id: "t1",
    auto: false,
    capacity: 6,
    joined: 1,
    time: "7:00 PM",
    dateISO: "2026-10-07",
    ...extra,
  };
}

test("advance booking keeps the original hold, then steps 6 to 4 to 2", () => {
  const early = new Date("2026-10-01T10:00:00+08:00");
  const far = bookingHold(table({ dateISO: "2026-10-07", joined: 1 }), early);
  assert.equal(far.status, "reserved");
  assert.equal(far.held, 6);

  const day4 = new Date("2026-10-03T10:00:00+08:00");
  const mid = bookingHold(table({ dateISO: "2026-10-07", joined: 2 }), day4);
  assert.equal(mid.held, 4);
  assert.equal(mid.status, "reserved");

  const day2 = new Date("2026-10-05T10:00:00+08:00");
  const near = bookingHold(table({ dateISO: "2026-10-07", joined: 2 }), day2);
  assert.equal(near.held, 2);
  assert.equal(near.status, "reserved");
});

test("one person the day before is a walk-in, not a held table", () => {
  const now = new Date("2026-10-06T10:00:00+08:00");
  const hold = bookingHold(table({ dateISO: "2026-10-07", joined: 1, capacity: 6 }), now);
  assert.equal(hold.status, "walk-in");
  assert.equal(hold.held, 0);
  assert.equal(hold.mode, "released");
  assert.equal(hold.closed, false);
});

test("two people the day before stay reserved", () => {
  const now = new Date("2026-10-06T10:00:00+08:00");
  const hold = bookingHold(table({ dateISO: "2026-10-07", joined: 2, capacity: 6 }), now);
  assert.equal(hold.status, "reserved");
  assert.equal(hold.held, 2);
});

test("same-day cap is 2 unless the venue sets its own", () => {
  const now = new Date("2026-10-05T09:00:00+08:00");
  assert.equal(cappedCapacity(6, "2026-10-05", {}, now), 2);
  assert.equal(cappedCapacity(6, "2026-10-08", {}, now), 6);
  assert.equal(cappedCapacity(6, "2026-10-05", { sameDayMax: 4 }, now), 4);
});

test("a same-day table opened inside 2 hours is a walk-in heads-up", () => {
  const now = new Date("2026-10-05T11:00:00+08:00");
  const row = table({
    dateISO: "2026-10-05",
    time: "12:00 PM",
    capacity: 2,
    joined: 1,
    openedAt: "2026-10-05T10:30:00+08:00",
  });
  const hold = bookingHold(row, now);
  assert.equal(hold.status, "walk-in");
  assert.equal(hold.mode, "heads-up");
  assert.equal(hold.held, 0);
  const notices = planVenueNotices(row, venue, now);
  assert.deepEqual(notices.map((notice) => notice.action), ["heads-up"]);
  assert.deepEqual(notices[0].channels, ["whatsapp"]);
  assert.match(headsUpText({ participants: 2, time: "12:00 PM" }), /No table needs to be held/);
  row.venueNotices = notices.map((notice) => notice.key);
  assert.equal(planVenueNotices(row, venue, now).length, 0);
});

test("a same-day table opened with time to spare is reserved, then confirmed inside 2 hours", () => {
  const opened = new Date("2026-10-05T08:00:00+08:00");
  const row = table({
    dateISO: "2026-10-05",
    time: "12:00 PM",
    capacity: 2,
    joined: 2,
    openedAt: opened.toISOString(),
  });
  const first = bookingHold(row, opened);
  assert.equal(first.status, "reserved");
  assert.equal(first.held, 2);
  const opening = planVenueNotices(row, venue, opened);
  assert.deepEqual(opening.map((notice) => notice.action), ["opened"]);
  assert.deepEqual(opening[0].channels, ["email"]);
  row.venueNotices = opening.map((notice) => notice.key);

  const later = new Date("2026-10-05T10:30:00+08:00");
  const still = bookingHold(row, later);
  assert.equal(still.status, "reserved");
  const final = planVenueNotices(row, venue, later);
  assert.deepEqual(final.map((notice) => notice.action), ["final"]);
  assert.deepEqual(final[0].channels, ["email", "whatsapp"]);
  row.venueNotices = [...row.venueNotices, ...final.map((notice) => notice.key)];
  assert.equal(planVenueNotices(row, venue, later).length, 0);
});

test("size drops notify once on the instant channel, and an unchanged hold does not", () => {
  const row = table({ dateISO: "2026-10-07", joined: 1, capacity: 6, openedAt: "2026-10-01T09:00:00+08:00" });
  const early = new Date("2026-10-01T10:00:00+08:00");
  const opened = planVenueNotices(row, venue, early);
  assert.equal(opened[0].action, "opened");
  assert.equal(opened[0].held, 6);
  row.venueNotices = opened.map((notice) => notice.key);
  row.joined = 2;
  assert.equal(planVenueNotices(row, venue, early).length, 0);

  const day4 = new Date("2026-10-03T10:00:00+08:00");
  const down = planVenueNotices(row, venue, day4);
  assert.deepEqual(down.map((notice) => notice.action), ["reduce"]);
  assert.equal(down[0].held, 4);
  assert.deepEqual(down[0].channels, ["whatsapp"]);
  row.venueNotices = [...row.venueNotices, ...down.map((notice) => notice.key)];
  assert.equal(planVenueNotices(row, venue, day4).length, 0);

  const day2 = new Date("2026-10-05T10:00:00+08:00");
  const again = planVenueNotices(row, venue, day2);
  assert.equal(again[0].action, "reduce");
  assert.equal(again[0].held, 2);
});

test("final confirmation for an advance booking is one day before, once", () => {
  const row = table({
    dateISO: "2026-10-07",
    joined: 2,
    capacity: 6,
    openedAt: "2026-10-01T09:00:00+08:00",
    venueNotices: ["opened:6:reserved", "reduce:4:reserved", "reduce:2:reserved"],
  });
  const dayBefore = new Date("2026-10-06T10:00:00+08:00");
  const notices = planVenueNotices(row, venue, dayBefore);
  assert.deepEqual(notices.map((notice) => notice.action), ["final"]);
  row.venueNotices = [...row.venueNotices, notices[0].key];
  assert.equal(planVenueNotices(row, venue, dayBefore).length, 0);
});

test("releasing the last person does not say the table is reserved", () => {
  const row = table({
    dateISO: "2026-10-07",
    joined: 1,
    capacity: 6,
    openedAt: "2026-10-01T09:00:00+08:00",
    venueNotices: ["opened:6:reserved", "reduce:4:reserved", "reduce:2:reserved"],
  });
  const dayBefore = new Date("2026-10-06T10:00:00+08:00");
  const hold = bookingHold(row, dayBefore);
  assert.equal(hold.status, "walk-in");
  const notices = planVenueNotices(row, venue, dayBefore);
  assert.deepEqual(notices.map((notice) => notice.action), ["walk-in"]);
  assert.equal(notices[0].hold.held, 0);
  assert.ok(notices[0].channels.includes("email"));
  assert.ok(notices[0].channels.includes("whatsapp"));
});
