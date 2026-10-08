import assert from "node:assert/strict";
import { readFileSync } from "fs";
import test from "node:test";
import { normalizeContent } from "./bible.js";
import { canOfferJoin } from "./joinOffer.js";
import { partnerQuickView, quickJoinState } from "./quickFeed.js";

const FAKE = new Set(["bb-test-aria", "bb-test-soren", "bb-test-nico", "bb-test-goldie", "acct_alex", "demo-mina", "demo-bo", "demo-sam"]);
const founder = { userId: "acct_founder", role: "founder", handle: "CJ" };
const outsider = { userId: "bb-m10-outsider", role: "user", handle: "Outsider" };

function ids(people) {
  return (people || []).map((person) => person.userId);
}

function shown(record) {
  return (record.participants || []).map((person) => ({
    userId: person.userId,
    handle: person.handle,
    role: person.role,
  }));
}

test("founder rendering no longer paints demo participants", () => {
  const people = readFileSync(new URL("./people.js", import.meta.url), "utf8");
  const providers = readFileSync(new URL("../components/Providers.js", import.meta.url), "utf8");
  assert.equal(/castForFounder/.test(people), false);
  assert.equal(/castForFounder/.test(providers), false);
  assert.equal(/bb-test-aria/.test(providers), false);
});

test("founder and another user see the same authoritative participants", () => {
  const invite = {
    id: "bbm-inv-yardbird-open",
    cohort: "bb-manual-10",
    auto: false,
    quick: false,
    joinersSeeded: true,
    dateISO: "2026-12-20",
    time: "7:30 PM",
    capacity: 4,
    joined: 2,
    hostUserId: "bb-m10-ben",
    hostHandle: "Ben",
    participants: [
      { userId: "bb-m10-ben", handle: "Ben", role: "host" },
      { userId: "bb-m10-cathy", handle: "Cathy", role: "guest" },
    ],
    pings: [],
  };
  const partner = {
    id: "bbm-pq-kissa-open",
    cohort: "bb-manual-10",
    auto: false,
    quick: true,
    joinersSeeded: true,
    dateISO: "2026-12-20",
    time: "1:00 PM",
    post: "Lunch in Causeway Bay.",
    capacity: 2,
    joined: 1,
    hostUserId: "bb-m10-cathy",
    hostHandle: "Cathy",
    participants: [{ userId: "bb-m10-cathy", handle: "Cathy", role: "host" }],
    pings: [],
    openedAt: "2026-10-01T00:00:00.000Z",
  };
  const own = {
    id: "bbm-own-kam-open",
    kind: "quick",
    source: "own",
    cohort: "bb-manual-10",
    hidden: false,
    name: "Kam's",
    post: "Roast goose.",
    dateISO: "2026-12-20",
    time: "8:00 PM",
    capacity: 4,
    spots: 3,
    hostUserId: "bb-m10-jack",
    hostHandle: "Jack",
    hostName: "Jack",
    participants: [{ userId: "bb-m10-jack", handle: "Jack", role: "host" }],
  };
  const night = {
    id: "bbm-priv-lawyers",
    kind: "private",
    cohort: "bb-manual-10",
    hidden: false,
    name: "Lawyers",
    dateISO: "2026-12-21",
    timeLabel: "7:00 PM",
    location: "Admiralty",
    hostUserId: "bb-m10-frank",
    hostName: "Frank",
    hostHandle: "Frank",
    capacity: 6,
    spots: 5,
    joined: 1,
    participants: [{ userId: "bb-m10-frank", handle: "Frank", role: "host" }],
  };
  const raw = {
    venues: [
      { id: "yardbird", name: "Yardbird", hidden: false, tables: [invite] },
      { id: "kissa-tanaka", name: "Kissa", hidden: false, tables: [partner] },
    ],
    events: [own, night],
  };
  const authoritative = {
    invite: shown(invite),
    partner: shown(partner),
    own: shown(own),
    night: shown(night),
  };
  const viewed = normalizeContent(JSON.parse(JSON.stringify(raw)));
  const inviteRow = viewed.venues.flatMap((venue) => venue.tables).find((table) => table.id === invite.id);
  const partnerRow = viewed.venues.flatMap((venue) => venue.tables).find((table) => table.id === partner.id);
  const ownRow = viewed.events.find((event) => event.id === own.id);
  const nightRow = viewed.events.find((event) => event.id === night.id);
  const after = {
    invite: shown(inviteRow),
    partner: shown(partnerRow),
    own: shown(ownRow),
    night: shown(nightRow),
  };
  assert.deepEqual(after, authoritative);
  for (const people of Object.values(after)) {
    assert.equal(people.some((person) => FAKE.has(person.userId)), false);
  }
  assert.equal(partnerRow.hostUserId, "bb-m10-cathy");
  assert.notEqual(partnerRow.hostUserId, "bb-test-goldie");

  const partnerView = partnerQuickView({ id: "kissa-tanaka", name: "Kissa" }, partnerRow);
  for (const session of [founder, outsider]) {
    assert.deepEqual(ids(inviteRow.participants), authoritative.invite.map((person) => person.userId));
    assert.deepEqual(ids(partnerView.participants), ["bb-m10-cathy"]);
    assert.deepEqual(ids(quickJoinState(partnerView, session).people), ["bb-m10-cathy"]);
    assert.deepEqual(ids(quickJoinState(ownRow, session).people), ["bb-m10-jack"]);
    assert.deepEqual(ids(nightRow.participants), ["bb-m10-frank"]);
  }

  assert.equal(quickJoinState(partnerView, founder).openSeats, 1);
  assert.equal(quickJoinState(ownRow, founder).openSeats, 3);
  assert.equal(invite.capacity - inviteRow.participants.length, 2);
  assert.equal(night.capacity - nightRow.participants.length, 5);

  const partnerOffer = canOfferJoin({ record: partnerView, session: founder, places: 1, closed: false, dateISO: partnerView.dateISO });
  const partnerOutsider = canOfferJoin({ record: partnerView, session: outsider, places: 1, closed: false, dateISO: partnerView.dateISO });
  assert.equal(partnerOffer.canJoin, true);
  assert.deepEqual(partnerOffer, partnerOutsider);
  assert.equal(canOfferJoin({ record: inviteRow, session: { userId: "bb-m10-ben", handle: "Ben" }, places: 2, closed: false }).reason, "host");
  assert.equal(canOfferJoin({ record: inviteRow, session: { userId: "bb-m10-cathy", handle: "Cathy" }, places: 2, closed: false }).reason, "member");
  assert.equal(canOfferJoin({ record: ownRow, session: founder, places: 3, closed: false }).canJoin, true);
  assert.equal(canOfferJoin({ record: ownRow, session: { userId: "bb-m10-jack", handle: "Jack" }, places: 3, closed: false }).canJoin, false);
  assert.equal(canOfferJoin({ record: nightRow, session: founder, places: 5, closed: false }).canJoin, true);
  assert.equal(canOfferJoin({ record: nightRow, session: outsider, places: 5, closed: false }).canJoin, true);
});
