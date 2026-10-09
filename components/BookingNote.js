export function BookingDetails({ booking }) {
  if (!booking) return null;
  return (
    <div className="mt-3 space-y-1 text-sm">
      <p className="font-semibold">TABLE BOOKED</p>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-60">Restaurant</p>
      <p>{booking.venueName}</p>
      {booking.address ? (
        <>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-60">Address</p>
          <p className="[overflow-wrap:anywhere]">{booking.address}</p>
        </>
      ) : null}
      <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-60">Time</p>
      <p>{booking.time}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-60">Table for</p>
      <p>{booking.tableSize}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-60">Booking under</p>
      <p>{booking.bookingName}</p>
      <a href="/quick" className="mt-3 inline-block text-xs font-semibold underline">View Quick</a>
    </div>
  );
}
