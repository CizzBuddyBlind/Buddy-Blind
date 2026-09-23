# Buddy Blind

Hong Kong blind social dining. Next.js app for Vercel.

Production: https://buddy-blind.vercel.app

```bash
npm install
npm run dev
npm run build
```

Sign in from the Login button (top right). Founder and Admin open Edit Mode on the live page. There is no separate admin login. Draft stays in the browser until Publish.

Publish writes the shared page into the Supabase `venues` table using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Vercel. `site_content` and `profiles` exist, but this anon key is not granted access to them, so accounts stay in the browser.
