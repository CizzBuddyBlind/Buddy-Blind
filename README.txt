V12 FIXED - WILL BUILD IN VERCEL

Fixes:
- Wrapped all useSearchParams in Suspense (Invite, Join, Premium) - fixes Next.js 14 build error
- Added /cancel page
- Added /lib/supabase fallback

Steps:
1. Unzip to your buddy-blind project, overwrite
2. git add . && git commit -m "V12 fix build" && git push
3. Vercel will succeed now

Flows:
- Invite: /invite PAY $5 -> /invite?paid=true -> copy link
- Join: VenueCard JOIN $5 or /join?venue=id BOOK -> Stripe $5 -> places_left-1
- Premium: LITE $10, PREMIUM $50 with 90-day trial
