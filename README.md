# Buddy Blind - 上線步驟 (BB版)

1. 去 supabase.com 建表 venues (id, created_at, name, location, photo_url, places_left) + 開 4條 policy (read/insert/update/delete for all)
2. 去 vercel.com > Add New Project > 揀呢個 buddy-blind folder > 加 Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Deploy -> 你會得到 buddy-blind.vercel.app
4. 加餐廳: 去 buddy-blind.vercel.app/admin
ABC no need testing only
