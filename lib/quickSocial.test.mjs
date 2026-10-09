import assert from "node:assert/strict";
import test from "node:test";
import { joinOwnQuick } from "./quickFeed.js";
import {
  applyLike,
  applySignal,
  noteForViewer,
  placeBooking,
  signalRows,
  suggestedTableSize,
  syncBookingNotes,
  TABLE_BOOKED_LINE,
} from "./quickSocial.js";

const host = { userId: "host-1", handle: "Host" };
const guest = { userId: "guest-1", handle: "Guest" };

function ownEvent(extra = {}) {
  return {
    id: "own-1",
    kind: "quick",
    source: "own",
    name: "ABC",
    time: "7:00 PM",
    capacity: 4,
    spots: 3,
    participants: [{ ...host, role: "host" }],
    ...extra,
  };
}

test("a like does not take a seat and a second tap removes it", () => {
  const row = ownEvent();
  const once = applyLike(row, guest.userId);
  assert.deepEqual(once.likes, [guest.userId]);
  assert.equal(once.spots, 3);
  assert.equal(once.participants.length, 1);
  assert.equal(once.capacity, 4);
  const twice = applyLike(once, guest.userId);
  assert.deepEqual(twice.likes, []);
  assert.equal(noteForViewer(applyLike(row, guest.userId), guest), null);
});

test("only a joined person can leave a preset, and the host uses host lines", () => {
  const open = ownEvent();
  assert.equal(applySignal(open, guest, "keen").error, "Join this meetup first.");
  assert.equal(open.signals, undefined);
  const seated = ownEvent({
    spots: 2,
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
  });
  const liked = applyLike(ownEvent(), guest.userId);
  assert.equal(applySignal(liked, guest, "keen").error, "Join this meetup first.");
  const late = applySignal(seated, guest, "late");
  assert.equal(late.ok, true);
  assert.equal(late.record.signals.length, 1);
  assert.equal(late.record.capacity, 4);
  const changed = applySignal(late.record, guest, "keen");
  assert.equal(changed.record.signals.length, 1);
  assert.equal(changed.record.signals[0].code, "keen");
  const cleared = applySignal(changed.record, guest, "keen");
  assert.equal(cleared.record.signals.length, 0);
  assert.equal(applySignal(seated, guest, "no-worries").error, "Pick a line first.");
  const reply = applySignal(seated, host, "no-worries");
  assert.equal(reply.record.hostSignal.code, "no-worries");
  assert.equal(reply.record.signals, undefined);
  assert.equal(applySignal(seated, host, "late").error, "Pick a line first.");
});

test("table size follows current attendance and does not change capacity", () => {
  const row = ownEvent({
    spots: 2,
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
  });
  assert.equal(suggestedTableSize(row), 2);
  assert.notEqual(suggestedTableSize(row), row.capacity);
  assert.equal(suggestedTableSize(ownEvent()), 1);
  const built = placeBooking(row, {
    venueName: "ABC Kitchen",
    address: "1 Peel Street",
    time: "7:30 PM",
    tableSize: 3,
    bookingName: "Lee",
    capacity: 2,
  });
  assert.equal(built.ok, true);
  assert.equal(built.booking.tableSize, 3);
  assert.equal(built.booking.venueName, "ABC Kitchen");
  assert.equal(row.capacity, 4);
  assert.equal(row.spots, 2);
  assert.equal(row.participants.length, 2);
  assert.equal(row.booked, undefined);
  assert.equal(row.bookingName, undefined);
  assert.equal(placeBooking(row, { venueName: "", time: "7:00 PM", tableSize: 2, bookingName: "Lee" }).error, "Add the restaurant name.");
  assert.equal(placeBooking(row, { venueName: "ABC", time: "7:00 PM", tableSize: 4.5, bookingName: "Lee" }).error, "Add the table size.");
});

test("the public line hides booking details and a like does not reveal them", () => {
  const row = ownEvent({
    booking: {
      booked: true,
      venueName: "ABC Kitchen",
      address: "1 Peel Street",
      time: "7:00 PM",
      tableSize: 2,
      bookingName: "Lee",
      at: 10,
    },
    hostSignal: { code: "see-you", at: 1 },
    signals: [{ userId: guest.userId, code: "keen", at: 2 }],
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
  });
  const lines = signalRows(row);
  assert.equal(lines.some((item) => item.text === TABLE_BOOKED_LINE), true);
  assert.equal(lines.some((item) => /Lee|Peel|ABC Kitchen/.test(item.text)), false);
  assert.equal(noteForViewer(row, { userId: "viewer" }), null);
  const note = noteForViewer(row, guest);
  assert.equal(note.quickBooking.bookingName, "Lee");
  assert.equal(note.quickBooking.address, "1 Peel Street");
  assert.equal(note.quickBooking.tableSize, 2);
  const partner = signalRows({ source: "partner", booking: { booked: true, bookingName: "Lee" } });
  assert.equal(partner.length, 0);
});

test("someone who joins after the booking gets the note and the reservation stays as confirmed", () => {
  const row = ownEvent({
    booking: {
      booked: true,
      venueName: "ABC Kitchen",
      address: "",
      time: "7:00 PM",
      tableSize: 2,
      bookingName: "Lee",
      at: 10,
    },
  });
  assert.equal(noteForViewer(row, guest), null);
  assert.equal(joinOwnQuick(row, guest).ok, true);
  assert.equal(row.capacity, 4);
  assert.equal(row.spots, 2);
  assert.equal(row.booking.tableSize, 2);
  assert.equal(row.booking.bookingName, "Lee");
  const note = noteForViewer(row, guest);
  assert.equal(note.id, "qb-own-1");
  assert.equal(note.quickBooking.tableSize, 2);
  const first = syncBookingNotes([], [row], guest);
  assert.equal(first.changed, true);
  assert.equal(first.notes.length, 1);
  const again = syncBookingNotes(first.notes, [row], guest);
  assert.equal(again.changed, false);
  const corrected = { ...row, booking: { ...row.booking, at: 11, bookingName: "Chan" } };
  const next = syncBookingNotes(again.notes, [corrected], guest);
  assert.equal(next.changed, true);
  assert.equal(next.notes.length, 1);
  assert.equal(next.notes[0].quickBooking.bookingName, "Chan");
  assert.equal(syncBookingNotes([], [row], { userId: "viewer" }).changed, false);
});
