
BUDDY BLIND V11 FULL FIX - 3 FLOWS WIRED

1. Copy these files into your buddy-blind repo overwriting existing:
   app/api/stripe/create-checkout/route.ts
   app/invite/page.tsx
   app/join/page.tsx
   app/premium/page.tsx
   components/VenueCard.tsx
   components/CheckoutButtons.tsx

2. Ensure env vars in Vercel (6 vars):
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = Config
   STRIPE_SECRET_KEY = Secret (sk_test_...)
   STRIPE_LITE_PRICE_ID = Config price_1UISXEPmyR3fIMKF3EMKbkND
   STRIPE_PREMIUM_PRICE_ID = Config price_1UISXdPmyR3fIMKFkyKCHbsB
   STRIPE_ADMIN_FEE_PRICE_ID = Config price_1UISZsPmyR3fIMKFcpj7cNdy
   NEXT_PUBLIC_BASE_URL = Config https://buddy-blind.vercel.app

3. git add . && git commit -m "V11 full fix" && git push -> Vercel deploys

4. Test:
   /venues JOIN button -> Stripe $5 -> paid=true -> places_left-1
   /invite REQUEST PRIVATE -> Stripe $5 -> invite?paid=true -> copy link
   /premium LITE $10 immediate, PREMIUM $50 with 90-day trial

Test card: 4242 4242 4242 4242, 12/34, 123
