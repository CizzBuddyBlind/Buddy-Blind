import { bookingHold, iso } from "./bible";

/** Partner Quick is stored on the venue table, but it is not a Venues event. */
export function isPartnerQuick(table) {
  return !!table?.quick;
}

/** Seed rows injected beside real tables. They must not take a live event's place. */
export function isSyntheticTable(table) {
  if (!table) return false;
  return !!table.auto || table.id === "kissa-home-feature";
}

export function isNormalVenueTable(table) {
  return !!table && !isPartnerQuick(table);
}

/** Availability for one table. Surfaces may show a subset, but not a different state. */
export function venueTableState(table, now = new Date()) {
  const hold = bookingHold(table, now);
  const today = iso(0, now);
  const dateISO = table?.dateISO || "";
  const current = !!dateISO && dateISO >= today;
  const places = hold.places;
  const closed = !!hold.closed || places <= 0;
  const normal = isNormalVenueTable(table);
  return {
    hold,
    dateISO,
    time: table?.time || "",
    places,
    closed,
    joinable: normal && current && !closed && places > 0,
    status: hold.status,
    synthetic: isSyntheticTable(table),
    quick: isPartnerQuick(table),
    normal,
  };
}

function bySchedule(a, b) {
  return `${a.dateISO}${a.time}`.localeCompare(`${b.dateISO}${b.time}`);
}

/** Current normal Venue tables, genuine ones first. Includes full tables. Excludes Partner Quick. */
export function normalVenueTables(venue, now = new Date()) {
  const today = iso(0, now);
  return (venue?.tables || [])
    .filter((table) => isNormalVenueTable(table) && table.dateISO >= today)
    .map((table) => ({ table, ...venueTableState(table, now) }))
    .sort((a, b) => (a.synthetic - b.synthetic) || bySchedule(a, b));
}

/** Open normal Venue tables a discovery surface can offer. A demo row never sorts ahead of a real one. */
export function joinableVenueTables(venue, now = new Date()) {
  return normalVenueTables(venue, now).filter((row) => row.joinable);
}
