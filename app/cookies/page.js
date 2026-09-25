import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Cookies · Buddy Blind" };

export default function CookiesPage() {
  return (
    <PolicyFrame kicker="Legal" title="Cookies">
      <p>Cookies are small text files a site stores on your device. We use them to run Buddy Blind, not to sell a profile of you.</p>

      <h2>1. Strictly necessary</h2>
      <p>These keep you logged in, remember the seat you are confirming, and protect the form from abuse. The site does not work properly without them. They do not need a separate marketing consent.</p>

      <h2>2. Preferences</h2>
      <p>We may store your language choice and whether you have dismissed a notice. These stay on your device.</p>

      <h2>3. Payments</h2>
      <p>Stripe may set cookies when you save a card or pay the HK$5 administration fee or a plan. Stripe’s own policy describes those cookies. We do not use those cookies to advertise to you on other sites.</p>

      <h2>4. What we do not do</h2>
      <p>We do not sell cookie data. We do not run third-party advertising cookies on Buddy Blind at this time. If that changes, we will update this page and ask before any non-essential marketing cookie is set.</p>

      <h2>5. How to refuse</h2>
      <p>You can block or delete cookies in your browser. If you block the necessary ones, login and checkout may fail. The mobile app may use local storage for the same necessary jobs. Clearing the app’s data logs you out.</p>
      <p>Questions: privacy@buddyblind.com</p>
    </PolicyFrame>
  );
}
