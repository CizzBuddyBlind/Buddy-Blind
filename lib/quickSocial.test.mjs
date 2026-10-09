import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { joinOwnQuick } from "./quickFeed.js";
import {
  applyLike,
  applySignal,
  clearSignal,
  commentCount,
  locateSocial,
  noteForViewer,
  placeBooking,
  postSignal,
  signalRows,
  suggestedTableSize,
  syncBookingNotes,
  TABLE_BOOKED_LINE,
  toggleLike,
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

test("the comment count is only the current visible presets", () => {
  const seated = ownEvent({
    spots: 2,
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
    meetingNote: "Door on the left",
    pings: [{ id: "ping-1", choice: "coming" }],
    booking: { booked: true, venueName: "ABC Kitchen", address: "1 Peel Street", time: "7:00 PM", tableSize: 2, bookingName: "Lee", at: 1 },
    hostSignal: { code: "see-you", at: 1 },
    signals: [
      { userId: guest.userId, code: "keen", at: 2 },
      { userId: "left-already", code: "late", at: 3 },
    ],
  });
  assert.equal(signalRows(seated).some((item) => item.system), true);
  assert.equal(commentCount(seated), 3);
  const replaced = applySignal(seated, guest, "forward");
  assert.equal(commentCount(replaced.record), 3);
  assert.equal(replaced.record.signals.length, 2);
  const cleared = applySignal(replaced.record, guest, "forward");
  assert.equal(commentCount(cleared.record), 2);
  assert.equal(commentCount(ownEvent({
    participants: [{ ...guest, role: "guest" }],
    signals: [{ userId: guest.userId, code: "not-a-line", at: 1 }],
    hostSignal: { code: "not-a-line", at: 1 },
  })), 0);
  assert.equal(commentCount({
    hostUserId: host.userId,
    hostName: "Host",
    hostSignal: { code: "cant-wait", at: 1 },
    participants: [{ ...guest, role: "guest" }],
  }), 1);
});

test("a normal table and a private event use the same preset rules, and a like stays on that record", () => {
  const content = {
    venues: [{
      id: "v",
      tables: [
        { id: "quick", quick: true, likes: ["q"], capacity: 2 },
        { id: "a", likes: [], capacity: 6, spots: 5, participants: [{ ...host, role: "host" }] },
        { id: "b", likes: ["kept"], capacity: 6 },
        { id: "seed", auto: true, likes: ["s"] },
      ],
    }],
    events: [
      { id: "own", kind: "quick", source: "own" },
      { id: "night", kind: "private", capacity: 20, spots: 19, hostUserId: host.userId, hostName: "Host", participants: [{ ...host, role: "host" }] },
    ],
  };
  assert.equal(locateSocial(content, { source: "table", venueId: "v", tableId: "quick" }), null);
  assert.equal(locateSocial(content, { source: "partner", venueId: "v", tableId: "a" }), null);
  assert.equal(locateSocial(content, { source: "partner", venueId: "v", tableId: "quick" }).likes[0], "q");
  assert.equal(locateSocial(content, { source: "table", venueId: "v", tableId: "seed" }), null);
  assert.equal(locateSocial(content, { source: "own", id: "night" }), null);
  assert.equal(locateSocial(content, { source: "private", id: "own" }), null);
  const first = locateSocial(content, { source: "table", venueId: "v", tableId: "a" });
  const second = locateSocial(content, { source: "table", venueId: "v", tableId: "b" });
  first.likes = toggleLike(first.likes, guest.userId);
  assert.deepEqual(first.likes, [guest.userId]);
  assert.deepEqual(second.likes, ["kept"]);
  assert.equal(first.capacity, 6);
  assert.equal(first.spots, 5);
  const joined = { ...first, participants: [...first.participants, { ...guest, role: "guest" }] };
  const line = applySignal(joined, guest, "nearby");
  assert.equal(line.ok, true);
  assert.equal(line.record.capacity, 6);
  assert.equal(commentCount(line.record), 1);
  const night = locateSocial(content, { source: "private", id: "night" });
  assert.equal(applySignal(night, guest, "keen").error, "Join this meetup first.");
  const hostLine = applySignal(night, host, "cant-wait");
  assert.equal(hostLine.record.hostSignal.code, "cant-wait");
  assert.equal(hostLine.record.capacity, 20);
  assert.equal(hostLine.record.spots, 19);
  assert.equal(commentCount(hostLine.record), 1);
});

test("POST appends a comment, and an old record stays readable without being rewritten", () => {
  const seated = ownEvent({
    spots: 2,
    participants: [{ ...host, role: "host" }, { ...guest, role: "guest" }],
    post: "I want noodles, who is around Central?",
    inviteText: "Dinner",
    description: "A private night",
    meetingNote: "Door on the left",
    pings: [{ id: "ping-1", choice: "coming" }],
    hostUserId: host.userId,
    hostHandle: "Host",
    hostSignal: { code: "see-you", at: 20 },
    signals: [{ userId: guest.userId, code: "keen", at: 10 }],
  });
  const before = JSON.stringify(seated);
  const shown = signalRows(seated).filter((item) => !item.system);
  assert.equal(JSON.stringify(seated), before);
  assert.deepEqual(shown.map((item) => item.id), [`legacy-${guest.userId}`, "legacy-host"]);
  assert.equal(commentCount(seated), 2);
  assert.equal(shown[0].person.userId, guest.userId);
  assert.equal(postSignal(seated, { userId: "viewer" }, "keen").error, "Join this meetup first.");
  assert.equal(postSignal(seated, guest, "see-you").error, "Pick a line first.");
  assert.equal(postSignal(seated, host, "late").error, "Pick a line first.");
  const posted = postSignal(seated, guest, "late", 30);
  assert.equal(posted.ok, true);
  assert.equal(posted.record.signals.length, 2);
  assert.equal(posted.record.signals[0].code, "keen");
  assert.equal(posted.record.signals[0].id, undefined);
  assert.match(posted.record.signals[1].id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  assert.equal(posted.record.signals[1].role, "member");
  assert.equal(posted.record.hostSignal.code, "see-you");
  assert.equal(posted.record.capacity, 4);
  assert.equal(posted.record.spots, 2);
  assert.equal(commentCount(posted.record), 3);
  const same = postSignal(posted.record, guest, "late", 40);
  assert.equal(same.record.signals.filter((item) => item.code === "late").length, 2);
  assert.equal(commentCount(same.record), 4);
  const hostPosted = postSignal(same.record, host, "cant-wait", 50);
  assert.equal(hostPosted.record.hostSignal.code, "see-you");
  assert.equal(hostPosted.record.signals.at(-1).role, "host");
  assert.equal(hostPosted.record.signals.at(-1).code, "cant-wait");
  assert.equal(commentCount(hostPosted.record), 5);
  const order = signalRows(hostPosted.record).filter((item) => !item.system).map((item) => item.id);
  assert.deepEqual(order, [`legacy-${guest.userId}`, "legacy-host", hostPosted.record.signals[1].id, hostPosted.record.signals[2].id, hostPosted.record.signals[3].id]);
  const removed = clearSignal(hostPosted.record, guest, hostPosted.record.signals[1].id);
  assert.equal(removed.ok, true);
  assert.equal(removed.record.signals.some((item) => item.id === hostPosted.record.signals[1].id), false);
  assert.equal(removed.record.signals.some((item) => item.code === "keen"), true);
  assert.equal(removed.record.hostSignal.code, "see-you");
  assert.equal(commentCount(removed.record), 4);
  assert.equal(clearSignal(removed.record, host, `legacy-${guest.userId}`).error, "You can only remove your own comment.");
  assert.equal(clearSignal(removed.record, guest, "legacy-host").error, "You can only remove your own comment.");
  const legacyGone = clearSignal(removed.record, guest, `legacy-${guest.userId}`);
  assert.equal(legacyGone.record.signals.some((item) => item.code === "keen" && !item.id), false);
  assert.equal(legacyGone.record.hostSignal.code, "see-you");
  const hostLegacy = clearSignal(legacyGone.record, host, "legacy-host");
  assert.equal(hostLegacy.record.hostSignal, null);
  assert.equal(hostLegacy.record.signals.at(-1).code, "cant-wait");
  const departed = {
    hostUserId: host.userId,
    hostHandle: "Host",
    hostSignal: { code: "see-you", at: 1 },
    participants: [{ ...host, role: "host" }],
    signals: [{ userId: guest.userId, code: "keen", at: 2 }, { id: "kept", userId: guest.userId, code: "late", at: 3, role: "member" }],
    post: "I want noodles",
    meetingNote: "Door",
    pings: [{ choice: "coming" }],
  };
  assert.equal(commentCount(departed), 3);
  assert.equal(signalRows(departed).filter((item) => !item.system).length, 3);
  assert.equal(postSignal(departed, guest, "forward").error, "Join this meetup first.");
  const own = clearSignal(departed, guest, "kept");
  assert.equal(own.ok, true);
  assert.equal(own.record.signals.length, 1);
  assert.equal(own.record.signals[0].code, "keen");
  assert.equal(own.record.hostSignal.code, "see-you");
  assert.equal(commentCount(own.record), 2);
  assert.equal(commentCount({
    post: "I want noodles",
    inviteText: "Dinner",
    description: "A private night",
    meetingNote: "Door",
    pings: [{ choice: "coming" }],
    booking: { booked: true },
    signals: [{ userId: guest.userId, code: "not-a-line", at: 1 }],
    hostSignal: { code: "not-a-line", at: 1 },
  }), 0);
});

test("the comment panel posts from POST only, and Quick detail no longer publishes on tap", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const panel = readFileSync(join(root, "components/SocialMarks.js"), "utf8");
  const detail = readFileSync(join(root, "components/QuickStart.js"), "utf8");
  assert.equal(detail.includes("LinePicker"), false);
  assert.equal(detail.includes("pickLine"), false);
  assert.equal(detail.includes("setQuickSignal"), false);
  assert.equal(panel.includes("onClick={() => setSelected(line.code)}"), true);
  assert.equal(panel.includes("{open && <PresetDialog"), true);
  assert.equal(panel.includes("Join to leave a comment."), true);
  assert.equal(panel.includes("HostBadge"), true);
  assert.equal(panel.includes("ADD COMMENT"), true);
  assert.equal(panel.includes("composing && choices.length > 0"), true);
  const publish = panel.slice(panel.indexOf("async function publish"), panel.indexOf("async function remove"));
  assert.equal(publish.includes("setQuickSignal"), true);
  assert.equal(publish.includes("if (!selected || saving.current) return"), true);
  assert.equal(publish.includes("setSelected(\"\")"), true);
  assert.equal(publish.includes("setComposing(false)"), true);
  assert.equal(publish.includes("onClose"), false);
  const remove = panel.slice(panel.indexOf("async function remove"), panel.indexOf("return createPortal"));
  assert.equal(remove.includes("clearQuickSignal"), true);
  assert.equal(remove.includes("setSelected(\"\")"), true);
  assert.equal(remove.includes("onClose"), false);
});
