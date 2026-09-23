# Buddy Blind

Hong Kong blind social dining. Next.js app for Vercel.

Production: https://buddy-blind.vercel.app

```bash
npm install
npm run dev
npm run build
```

Sign in from the Login button (top right). Founder and Admin open Edit Mode on the live page. There is no separate admin login. Draft stays in the browser until Publish.

Shared publishing for every visitor needs Supabase environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
