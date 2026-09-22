
# BUDDY BLIND V9 HEART - MASTER PROMPT (Upload this to v0 / Cursor / Lovable)

You are building BUDDY BLIND V9 HEART - a blind dining drop platform. Design system below is LOCKED, do not change.

## DESIGN SYSTEM - V9 HEART
- Background: #050505, Card: #111111, Border: zinc-800, Amber: #facc15 / bg-amber-400/10 border-amber-400/20
- Font: Space Grotesk (Google), Tracking: 0.2em-0.4em for labels, -0.02em for body, Font-black for titles
- Radius: 24px-32px cards, 9999px pills, 12px avatars
- Card structure: top row = avatar circle (w-12 h-12 bg-zinc-800) left + {X LEFT} pill right, middle = venue name 22px bold, location with 📍 14px zinc-500, bottom = BLIND DROP + → VIEW 11px tracking-widest zinc-600
- No photos by default, only if photo_url not empty. Never show IDs.
- Navbar: sticky top, glass (backdrop-blur 20px bg 17/17/17 0.8), links: DROP, VENUES, PRIVATE, HOW IT WORKS, PREMIUM, plus INVITE pill + profile circle
- All pages dark mode only.

## SUPABASE SCHEMA (Table: venues)
id uuid primary, created_at timestamp, name text, location text, places_left int default 4, photo_url text default '', vibe text, price int default 88
RLS disabled (or policy allow anon read/write for demo). Use URL: https://cfihskrrbqgvgnnxergj.supabase.co + anon key provided.

## PAGES REQUIRED
1. / - HOME: Hero BUDDY BLIND 88px font-black, NO NAMES. NO PHOTOS. JUST GOOD TASTE. tracking 0.4em 11px, 2 CTA: ENTER DROP (white bg) + HOW IT WORKS (border). Grid 3 cols of VenueCard (6 LEFT etc). Click opens modal with blurred backdrop, card 440px max, avatar white bg black text, 2 stats boxes LOCATION + STATUS (amber), BOOK BLIND $88 button -> /join?venue=id.

2. /venues - List all venues from Supabase, same card, click -> /join?venue=id.

3. /private-events - Title PRIVATE EVENTS, 3 cards: TEAMS 8-20, BIRTHDAY Secret Takeover, BRANDS Drop Collab, CTA REQUEST PRIVATE -> /invite.

4. /how-it-works - 3 steps: 1 You see only vibes, 2 You book blind, 3 You show up, you taste. Bottom big card: INVITE & JOIN PROCESS with 4 cols Invite/Join/Drop/Reveal.

5. /premium - 2 tiers FREE vs HEART $19/mo, HEART white bg black text, lists.

6. /profile - Avatar 20x20, name Cizz, HEART member, 12 blinds, score 9.2, 3 stat cards UPCOMING, INVITES LEFT 2/3 amber, TASTE SCORE.

7. /invite - Centered, invite link https://buddy-blind.vercel.app/join?ref=cizz-HEART, copy button with COPIED state.

8. /join - Reads ?venue=id and ?ref, shows selected venue box with places_left, email input, BOOK BLIND $88 button that decrements places_left in Supabase (update places_left = places_left -1) and alerts. Sold out check.

9. /admin - Simple table add/delete venues, matches schema.

## LOGIC
- Home fetches venues order created_at desc limit 9.
- Join decrements places_left atomically: select places_left, if >0 update places_left-1.
- All VenueCards show {places_left} LEFT.
- No authentication needed for demo, mock profile.

## WHAT TO BUILD
Build all above files in Next.js 14 App Router, Tailwind. lib/supabase.ts uses env vars with fallback to provided URL/key. Components/Navbar.tsx and VenueCard.tsx reusable. app/globals.css imports Space Grotesk. Ensure /admin shows total count.

Keep everything black, minimal, luxury, like private members club.

