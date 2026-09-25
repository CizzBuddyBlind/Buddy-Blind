import Link from "next/link";
import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Terms & Conditions · Buddy Blind" };

export default function TermsPage() {
  return (
    <PolicyFrame kicker="Legal" title="Terms & Conditions">
      <p>These terms are a contract between you and Buddy Blind (“we”, “us”) for buddyblind.com and the Buddy Blind app. If you do not agree, do not create an account and do not take a seat.</p>

      <h2>1. What Buddy Blind is</h2>
      <p>Buddy Blind is a platform. It lets adults open, join, or host a seat at a restaurant or a private gathering. You choose the place, the time, and the number of seats. You do not get names or photos of the other people before you arrive. That is the product.</p>
      <p>We are not a restaurant, a caterer, a dating agency, a matchmaker, an employer, or a party to your meal. We do not employ the other people at the table. We do not control what they say or do. A seat on Buddy Blind is not a promise that anyone will like you, stay, or show up.</p>

      <h2>2. Who can use it</h2>
      <p>You must be 18 or older and able to enter a binding contract. One person, one account. You are responsible for what happens under your login. Tell us if you think someone else is using it.</p>

      <h2>3. Seats</h2>
      <ul>
        <li>Join, Invite, Quick Meet, and Host are requests on our platform. The restaurant may still be full, closed, or unable to take the table.</li>
        <li>Quick Meet is for today only.</li>
        <li>A private night is a Premium feature. The host sets the size, up to 20 people including the host.</li>
        <li>Numbers of seats left are what users and the system report. They can change. They are not a guarantee from the restaurant.</li>
        <li>We may cancel, merge, or close a seat if it breaks these terms, looks unsafe, or the place cannot take it.</li>
      </ul>

      <h2>4. The HK$5 administration fee</h2>
      <p>When you confirm a Join, Invite, or Host, we charge HK$5. That fee is for running the seat on Buddy Blind: trust, security, and administration. It is not payment for food, drink, service, or a booking fee charged by the restaurant. You pay the restaurant yourself, on your own bill, on their terms.</p>
      <p>The fee is taken from the card you saved when you registered, through Stripe. By confirming, you authorise that charge. If the bank declines it, the seat is not confirmed.</p>
      <p>The fee is not refundable once the seat is confirmed, including if you do not go, arrive late, dislike the people, or the restaurant changes its menu. We may refund it where the law requires, where we cancel the seat before it starts, or where the charge was a clear duplicate. A badge discount, if one is shown, applies only to this HK$5 fee. It does not apply to the restaurant bill. We may change badge rates. The rate on the page at the time you confirm is the one that applies.</p>

      <h2>5. Plans</h2>
      <p>New members can start Premium with a free trial. This build uses 90 days. We may set a different length before public launch, and the length shown at signup is the one that applies to you. During the trial, Premium features are open, including hosting a private night. If you do not cancel before the trial ends, the card you saved is charged HK$50 for that month, and then each month until you cancel. Deleting the app, or stopping using it, does not cancel the plan. Cancel in the product, or email legal@buddyblind.com, before the renewal time.</p>
      <p>Fees already due are payable. We do not refund a month that has started, except where the law requires it.</p>

      <h2>6. Points</h2>
      <p>Points are a record on our platform. Join adds 1. Invite adds 2. Host adds 5, after the HK$5 charge succeeds. Points can change your circle colour. They are not cash, not property, and not transferable. We may adjust points if a charge is reversed or a seat breaks these terms.</p>

      <h2>7. Restaurants</h2>
      <p>Places listed on Buddy Blind are independent businesses. We do not cook the food, set the prices, hold the liquor licence, or take your dietary needs as a promise to the kitchen. Allergies, halal, vegetarian, and similar needs are between you and the restaurant. Check with them. We are not liable for food, drink, hygiene, service, or anything that happens on their premises, except where the law does not allow this limit.</p>
      <p>When a seat is confirmed we may tell the place that a table was opened or joined, with the time, the date, and the number of people. We do not give them your phone number so other guests can see it.</p>

      <h2>8. Meetings are your risk</h2>
      <p>You will meet people you have not screened. We do not run police checks, identity guarantees, or employment checks. A circle colour is not a certificate of character. You decide whether to go, whether to stay, and whether to leave. Meet in the public place on the seat. Do not move the meeting to a private place you do not know if you are unsure. Buddy Blind does not supervise the table and does not insure you.</p>
      <p>To the fullest extent the law allows, you assume the risk of meeting other users, including discomfort, offence, no-shows, extra guests, and conduct we did not authorise.</p>

      <h2>9. Your conduct</h2>
      <p>You will not harass, threaten, stalk, discriminate, record people without consent where consent is required, send sexual content to someone who did not ask, bring a weapon, sell anything at the table, scrape the service, or use it for fraud. You will not post anyone else’s phone number, workplace, or photo. You will not pretend a private night is an official Buddy Blind event if you are only a host.</p>
      <p>The <Link href="/guidelines" className="text-ember">Community Guidelines</Link> are part of these terms.</p>

      <h2>10. Your content</h2>
      <p>You keep ownership of photos, video, and text you upload. You give us a non-exclusive licence to host, resize, and show that content for the seat and for operating Buddy Blind, until you delete it or close the account, and afterwards for backups for a short period. You promise you have the right to upload it. We may remove content that breaks these terms.</p>

      <h2>11. Accounts</h2>
      <p>We may suspend or close an account, or remove a seat, if we reasonably believe these terms were broken, a charge failed, or the service or other people are at risk. We do not have to give a warning where the risk is serious. You may close your account by emailing legal@buddyblind.com. Closing an account does not erase a charge that is already due.</p>

      <h2>12. No warranty</h2>
      <p>The service is provided “as is” and “as available”. We do not warrant that a seat will fill, that a person will attend, that a restaurant will honour a table, that the app will be uninterrupted, or that a night will go well. We disclaim implied warranties to the fullest extent Hong Kong law allows.</p>

      <h2>13. Liability</h2>
      <p>Nothing in these terms limits liability for death or personal injury caused by our negligence, or for fraud, or for any other liability that Hong Kong law, including the Control of Exemption Clauses Ordinance, does not allow us to limit.</p>
      <p>Subject to that, we are not liable for loss caused by other users, restaurants, no-shows, food, drink, or your decision to meet. We are not liable for lost profits, lost opportunity, or indirect or consequential loss. Our total liability arising out of the service in any 12 month period is limited to the fees you paid us in that period, or HK$100 if you paid less.</p>

      <h2>14. Indemnity</h2>
      <p>You will indemnify Buddy Blind and its people against claims, losses, and reasonable legal costs arising from your content, your conduct at a seat, your breach of these terms, or your breach of someone else’s rights, except to the extent caused by our own negligence.</p>

      <h2>15. Changes and law</h2>
      <p>We may update these terms. The new version applies from the date on this page. If you keep using Buddy Blind after that, you accept the update. If you do not accept it, stop using the service and cancel any paid plan.</p>
      <p>Hong Kong law governs these terms. The courts of Hong Kong have exclusive jurisdiction, except that we may seek urgent relief in any court.</p>
      <p>If a clause is unenforceable, the rest still stands. These terms, the Privacy Policy, the Cookie Policy, and the Community Guidelines are the whole agreement on this subject.</p>
      <p>Questions: legal@buddyblind.com</p>
    </PolicyFrame>
  );
}
