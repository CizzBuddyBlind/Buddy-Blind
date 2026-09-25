import Link from "next/link";
import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Privacy Policy · Buddy Blind" };

export default function PrivacyPage() {
  return (
    <PolicyFrame kicker="Legal" title="Privacy Policy">
      <p>This policy is our Personal Information Collection Statement for the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong. Buddy Blind is the data user for personal data collected through buddyblind.com and the app.</p>

      <h2>1. What we collect</h2>
      <ul>
        <li>Account: email, phone number if you verify one, password (stored as a hash), username, and the details you enter, such as gender, age range, sexual orientation, and the areas where you live or work.</li>
        <li>What you choose to show. You can hide gender, age range, orientation, and where you live or work from your profile. We may still keep them to run the account.</li>
        <li>Seats you open, join, or host, points, buddies, ratings, comments, notifications, and photos or video you upload for a private night.</li>
        <li>Payment: Stripe processes the card. We store a customer reference and the fact that a card is saved. We do not store the full card number.</li>
        <li>Location only if you tap Nearby and agree to share it. We use it to list places near you for that search. We do not track you in the background.</li>
        <li>Technical data: device, browser, IP address, and cookies described in the <Link href="/cookies" className="text-ember">Cookie Policy</Link>.</li>
      </ul>
      <p>Please do not upload identity documents, medical records, or anyone else’s contact details. We do not ask for them.</p>

      <h2>2. Why we use it</h2>
      <ul>
        <li>To create your account, take a seat, charge the HK$5 administration fee, and run a plan.</li>
        <li>To show a host or joiner initial, and the profile fields you leave visible.</li>
        <li>To send seat notifications inside the product. We do not give your phone number to other people at the table.</li>
        <li>To tell a restaurant that a table was opened or joined: place, time, date, and how many people. Not your phone number for other guests to see.</li>
        <li>To keep the service secure, prevent fraud, and enforce our terms.</li>
        <li>To reply if you write to us.</li>
      </ul>
      <p>We do not sell personal data.</p>

      <h2>3. Direct marketing</h2>
      <p>We will not use your personal data for direct marketing unless you opt in separately. Opting in is not a condition of taking a seat. You can opt out at any time, at no charge, by emailing privacy@buddyblind.com or using the unsubscribe link in a message. We will stop using your data for that purpose.</p>

      <h2>4. Who we share it with</h2>
      <ul>
        <li>Stripe, for payments.</li>
        <li>Our host and infrastructure providers, including Vercel, so the site can run.</li>
        <li>A restaurant, limited to the seat details above, when you confirm a table there.</li>
        <li>Other users, only what the product is designed to show: an initial, a circle colour, fields you leave visible, and the words you send through the notify buttons. Not your phone number or email.</li>
        <li>Authorities, if the law requires it, or to respond to a lawful request.</li>
        <li>A buyer of the business, if we sell or reorganise it, under the same privacy duties.</li>
      </ul>
      <p>Some of these providers store data outside Hong Kong, including in the United States. Section 33 of the PDPO is not in force. We still tell you this so you can decide. We ask providers to protect the data and to use it only on our instructions.</p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>Account data: while the account is open, then up to 24 months, unless we must keep it longer for a dispute, a charge, or the law.</li>
        <li>Payment records: up to 7 years, for accounting and tax.</li>
        <li>Seat and notification records: up to 24 months after the seat.</li>
        <li>If we close an account for a serious breach, we may keep a record of the ban for up to 6 years so the person cannot simply rejoin.</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>You may ask to access your personal data, and to correct it if it is inaccurate. We will answer within 40 days. We may charge a reasonable fee allowed by the PDPO for an access request. Email privacy@buddyblind.com with the subject “Data request”. We may need to confirm it is you.</p>
      <p>Hong Kong law does not give a general right to erasure. You can close your account and ask us to delete what we do not need to keep. We will delete or de-identify the rest.</p>

      <h2>7. Security and breaches</h2>
      <p>We use access controls and a payment provider that is certified to handle cards. No online service is perfectly secure. Hong Kong law does not force us to notify you of every incident. If a breach is likely to cause real harm, we will tell affected people and, where it is serious, the Privacy Commissioner.</p>

      <h2>8. Children</h2>
      <p>Buddy Blind is not for anyone under 18. If we learn we have data of a child, we will delete the account.</p>

      <h2>9. Contact</h2>
      <p>Privacy questions: privacy@buddyblind.com. You may also contact the Office of the Privacy Commissioner for Personal Data, Hong Kong.</p>
    </PolicyFrame>
  );
}
