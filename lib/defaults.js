export const SEED = {
  copy: {
    venues: {
      kickerLeft: "VENUES · CURATED NIGHTLY",
      kickerRight: "TONIGHT IN HK · 6 OPEN · 6PM DROP",
      title: "You don't know who you'll meet.",
      accent: "That's the point.",
      sub: "No faces, just places. 6 tonight · photos coloured always. Enough to WANT, enough uncertainty to be WORTH having.",
      footer: "6 VENUES · CURATED NIGHTLY AT 6PM · COLOURED PHOTOS ALWAYS · DARK CARDS",
    },
    quick: {
      title: "I'm free now.",
      accent: "Who wants to join?",
      sub: "COMPACT · NO BIO · JUST TIME & PLACE",
      note: "No one around yet? Create one. If nobody joins, fine — you were already planning to eat alone.",
    },
    private: {
      kickerLeft: "PRIVATE · HOST LED",
      kickerRight: "TAP → ORANGE",
      title: "Find your interest.",
      accent: "Meet your people.",
      sub: "Host creates the reason. You find your kind. Photos coloured always.",
    },
    how: {
      kicker: "BUDDY BLIND · FEATURES BIBLE · 7 STEPS",
      title: "How it",
      accent: "works.",
      sub: "No bios. No swiping. Just places, time, and curiosity. Blind means blind.",
      steps: [
        { n: "01", title: "See a venue or private event", body: "Curated kissaten, yakitori, wine caves, tea houses. Photos coloured, dark cards, no faces of strangers." },
        { n: "02", title: "See enough to want", body: "Neighborhood · Vibe · Time · Places left. Enough to WANT, enough uncertainty to be WORTH having. No names, no faces." },
        { n: "03", title: "Join or Invite", body: "INVITE creates a table (HK$5 admin fee). JOIN joins existing — free, instant confirmation." },
        { n: "04", title: "Show up — still blind", body: "A time, a place, a table. You recognise your people by who sits down, not by a profile photo." },
        { n: "05", title: "Eat, talk, discover", body: "The night is the product. No icebreaker scripts. If it clicks, you leave with a buddy. If not, you still had dinner." },
        { n: "06", title: "Optional review after", body: "Short, specific, no scores of a stranger's face. “On time.” “Knows wine.” Enough for the next table." },
        { n: "07", title: "Points unlock the next one", body: "2 pts invite · 1 pt join · 5 pts create. 100 pts → 5% off the whole table. Bronze, Silver, Gold." },
      ],
    },
  },
  venues: [
    { id: "kissa-tanaka", name: "Kissa Tanaka", typeLabel: "KISSATEN · JAPANESE", locationLabel: "CWB · Leighton · 30-40", priceLabel: "HK$280 · Dinner", timeLabel: "TONIGHT 7PM", spots: 3, area: "cwb", tonight: true, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80", imageAlt: "Warm Japanese kissaten interior", about: "Intimate counter, warm wood, low light. Blind boxes only. You don't choose who sits." },
    { id: "yardbird", name: "Yardbird", typeLabel: "YAKITORI · FIRE", locationLabel: "Central · Bridges St", priceLabel: "HK$450 · Counter", timeLabel: "TONIGHT 8:30PM", spots: 2, area: "central", tonight: true, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80", imageAlt: "Yakitori counter over charcoal", about: "Lanterns, smoke, shared plates. Phones stay in pockets." },
    { id: "la-cabane", name: "La Cabane", typeLabel: "NATURAL WINE · SMALL PLATES", locationLabel: "TST · Wine Cave", priceLabel: "HK$380 · Sharing", timeLabel: "TOMORROW 7PM", spots: 4, area: "tst", tonight: false, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80", imageAlt: "Candlelit natural wine table", about: "A small cave of natural wine. Four seats, no menu photos of faces." },
    { id: "lockcha", name: "LockCha Tea House", typeLabel: "TEA · VEGETARIAN", locationLabel: "Admiralty · Park · Quiet", priceLabel: "HK$180 · Afternoon", timeLabel: "TODAY 3PM", spots: 5, area: "central", tonight: false, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80", imageAlt: "Traditional tea service", about: "Quiet tea, steam, porcelain. Afternoon light through the park." },
    { id: "private-kitchen-02", name: "Private Kitchen 02", typeLabel: "SUPPER CLUB · SECRET", locationLabel: "Sheung Wan · Loft", priceLabel: "HK$680 · 8 Courses", timeLabel: "FRI 7:30PM", spots: 2, area: "central", tonight: false, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80", imageAlt: "Intimate plated supper", about: "Eight courses. The address arrives after you join." },
    { id: "sai-kung-oyster", name: "Sai Kung Oyster", typeLabel: "SEAFOOD · OYSTER", locationLabel: "Sai Kung · Pier · Outdoor", priceLabel: "HK$320 · Lunch", timeLabel: "SAT 12PM", spots: 6, area: "tst", tonight: false, locked: false, hidden: false, imageUrl: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1200&q=80", imageAlt: "Oysters on ice by the water", about: "Pier tables, salt air, a bucket of ice. Lunch only." },
  ],
  events: [
    { id: "q1", kind: "quick", name: "Kissa Tanaka", typeLabel: "COFFEE", timeLabel: "NOW · 45M · COFFEE · CWB", detail: "Solo OK · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=60" },
    { id: "q2", kind: "quick", name: "Yardbird", typeLabel: "DRINKS", timeLabel: "IN 30M · DRINKS · CENTRAL", detail: "2 left · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=60" },
    { id: "q3", kind: "quick", name: "La Cabane", typeLabel: "WINE", timeLabel: "TODAY 6PM · WINE · TST", detail: "No prefs · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=60" },
    { id: "q4", kind: "quick", name: "LockCha", typeLabel: "TEA", timeLabel: "NOW · TEA · ADMIRALTY", detail: "Quiet · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=60" },
    { id: "q5", kind: "quick", name: "Blue Bottle", typeLabel: "COFFEE", timeLabel: "TODAY 2PM · COFFEE · CENTRAL", detail: "Work buddy · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=60" },
    { id: "q6", kind: "quick", name: "Private Kitchen", typeLabel: "SUPPER", timeLabel: "TONIGHT 9PM · SUPPER · SHEUNG WAN", detail: "Members · 2 seats", spots: 2, hidden: false, imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=60" },
    { id: "comedy-night", kind: "private", name: "Comedy Night", typeLabel: "STAND-UP + SAKE", hostLabel: "Blind with Kenji", upcomingLabel: "3 upcoming", spots: 8, hidden: false, imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80" },
    { id: "tattoo-talk", kind: "private", name: "Tattoo & Talk", typeLabel: "INK STORIES", hostLabel: "Blind with Mina", upcomingLabel: "1 upcoming", spots: 6, hidden: false, imageUrl: "https://images.unsplash.com/photo-1611501275019-9b6b9e00d8b0?auto=format&fit=crop&w=1200&q=80" },
    { id: "wine-hike", kind: "private", name: "Wine Hike", typeLabel: "TRAIL + NATURAL", hostLabel: "Blind with Alex", upcomingLabel: "2 upcoming", spots: 10, hidden: false, imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" },
    { id: "mahjong-101", kind: "private", name: "Mahjong 101", typeLabel: "LEARN + LOSE", hostLabel: "Blind with Auntie", upcomingLabel: "5 upcoming", spots: 4, hidden: false, imageUrl: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=1200&q=80" },
    { id: "chefs-table", kind: "private", name: "Chef's Table", typeLabel: "YARDBIRD BACKROOM", hostLabel: "Blind with Matt", upcomingLabel: "1 upcoming", spots: 8, hidden: false, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80" },
    { id: "film-lab", kind: "private", name: "Film Lab", typeLabel: "DEVELOP + CHAT", hostLabel: "Blind with Sora", upcomingLabel: "2 upcoming", spots: 6, hidden: false, imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80" },
  ],
  reviews: [
    { handle: "Alex", body: "Easy to talk to" },
    { handle: "Alex", body: "Good listener" },
    { handle: "Mina", body: "Knows wine" },
    { handle: "Kenji", body: "On time" },
  ],
};

export const SEED_ACCOUNTS = [
  { email: "founder@buddyblind.com", username: "founder", password: "founder123", role: "founder", handle: "CJ", points: 240, neighborhood: "CENTRAL", ageRange: "30-40", occupation: "Founder", verified: true },
  { email: "admin@buddyblind.com", username: "admin", password: "admin123", role: "admin", handle: "Admin", points: 80, neighborhood: "CWB", ageRange: "30-40", occupation: "Editor", verified: true },
  { email: "user@buddyblind.com", username: "user", password: "user123", role: "user", handle: "Alex", points: 12, neighborhood: "TST", ageRange: "30-40", occupation: "Product", verified: false },
];
