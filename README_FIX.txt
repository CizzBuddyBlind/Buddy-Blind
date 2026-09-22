V13 FIX - STRIPE MODULE NOT FOUND

This fixes: Module not found: Can't resolve 'stripe'

1. Replace your package.json with this one (or just run npm install stripe)
2. If you replace file:
   npm install
   git add package.json package-lock.json app components lib
   git commit -m "V13 fix stripe module"
   git push

Vercel will now build SUCCESS (green).

Then test:
- /venues JOIN button -> Stripe $5
- /invite PAY $5 -> unlock link
- /premium LITE $10 / PREMIUM $50 90-day trial

Test card: 4242 4242 4242 4242, 12/34, 123
