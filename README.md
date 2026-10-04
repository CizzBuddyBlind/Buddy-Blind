# Buddy Blind

Hong Kong blind social dining. Next.js app for Vercel.

Before changing shared UI, responsive behaviour, or navigation, read [UI_INVARIANTS.md](UI_INVARIANTS.md). If a change conflicts with one of those rules, report the conflict instead of overriding it.

Production: https://buddyblind.com

```bash
npm install
npm run dev
npm run build
```

Sign in from the Login button (top right). Founder and Admin open Edit Mode on the live page. There is no separate admin login. Draft stays in the browser until Publish.

Publish writes the shared page into the Supabase `venues` table using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Vercel. `site_content` and `profiles` exist, but this anon key is not granted access to them, so accounts stay in the browser.
