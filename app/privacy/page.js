import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Privacy Policy · Buddy Blind" };

export default function PrivacyPage() {
  return (
    <PolicyFrame kicker="Legal" title="Privacy Policy">
      <p>This Privacy Policy is also our Personal Information Collection Statement (PICS) under the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong (“PDPO”).</p>
      <p>Buddy Blind (“we”, “us”, “our”) is the data user (as defined in Cap. 486) for personal data collected through buddyblind.com and the Buddy Blind app (together, the “Service”).</p>
      <p>By creating an account, confirming a seat, starting a plan, uploading content, or otherwise using the Service, you acknowledge this policy. If you do not agree, do not use the Service.</p>
      <p>This policy should be read with our Terms & Conditions, Cookie Policy, and Community Guidelines. Cap. 553 (Electronic Transactions Ordinance), Cap. 362 (Trade Descriptions Ordinance), and Cap. 593 (Unsolicited Electronic Messages Ordinance) may also apply to how we operate the Service and send certain messages; those topics are covered here only as they relate to personal data.</p>

      <h2>1. What we collect</h2>
      <p>We collect personal data that you provide, that is generated when you use the Service, and that we receive from our service providers as necessary to operate the Service.</p>
      <h3>1.1 Account and profile</h3>
      <ul>
        <li>Email address</li>
        <li>Phone number (if you verify one)</li>
        <li>Password (stored as a hash; we do not store your password in plain text)</li>
        <li>Username / display name</li>
        <li>Details you choose to enter, which may include gender, age range, sexual orientation, and areas where you live or work</li>
        <li>Account settings, including what you choose to show or hide on your profile</li>
      </ul>
      <p>Visibility: You can hide gender, age range, orientation, and where you live or work from other users. We may still hold and use those fields to operate your account, apply eligibility and safety rules (including the 18+ requirement), match product features, and enforce our Terms — even when they are hidden from your public profile.</p>
      <h3>1.2 Seats, social features, and content</h3>
      <ul>
        <li>Seats you open, join, invite to, or host (including time, date, place, seat counts, host/joiner status, and related event metadata)</li>
        <li>Points, circle colour, buddies, ratings, and comments</li>
        <li>Notifications you send or receive through the product</li>
        <li>Photos, video, and text you upload (including for a private night)</li>
      </ul>
      <h3>1.3 Payment and trust records</h3>
      <ul>
        <li>Stripe (or our then-current payment provider) processes card payments</li>
        <li>We store a customer / payment-method reference and the fact that a payment method is saved</li>
        <li>We store records that a HK$5 trust and security fee, plan charge, refund, chargeback, or failed payment was attempted or completed, linked to the relevant seat or account</li>
        <li>We do not store the full card number (PAN) on our systems</li>
      </ul>
      <p>These payment-linked records exist so we can operate trust and security features described in our Terms (including accountability for unpaid restaurant bills / dine-and-dash style misconduct, fraud prevention, and cooperation with lawful authority requests). The HK$5 charge is not a restaurant booking fee and is not payment for food or drink.</p>
      <h3>1.4 Location</h3>
      <ul>
        <li>Location only if you tap Nearby (or a similar feature) and agree to share it for that use</li>
        <li>We use it to list places near you for that search</li>
        <li>We do not track your location in the background for the Service as described in this policy</li>
      </ul>
      <h3>1.5 Technical and security data</h3>
      <ul>
        <li>Device type, browser, app version, IP address, approximate network location derived from IP, timestamps, and diagnostic logs</li>
        <li>Cookies and similar technologies described in the Cookie Policy</li>
        <li>Security signals reasonably needed to detect abuse, scraping, or unauthorised access</li>
      </ul>
      <h3>1.6 What we ask you not to upload</h3>
      <p>Please do not upload identity documents, medical records, bank statements, full card numbers, or anyone else’s contact details or personal data unless we expressly ask for a specific field in the product. We do not require identity documents for ordinary use of the Service as currently described.</p>
      <p>If you upload such material anyway, you do so at your own risk. We may delete it and may treat the upload as a Terms breach.</p>
      <h3>1.7 Voluntary fields</h3>
      <p>Fields such as sexual orientation, if provided, are voluntary. Provide them only if you are comfortable. We use them only for the purposes in section 2 and as otherwise permitted under Cap. 486. Do not assume that hiding a field from your profile means we have erased it.</p>

      <h2>2. Why we use personal data (purposes)</h2>
      <p>Under Cap. 486, we collect personal data for lawful purposes directly related to our functions, and we take practicable steps so you are informed of the purposes of use. We use personal data to:</p>
      <ol>
        <li>Create and manage accounts — registration, login, password reset, profile, settings, 18+ eligibility.</li>
        <li>Operate seats — open, join, invite, host, cancel, merge, or close seats; show limited profile information the product is designed to display (for example an initial, circle colour, and fields you leave visible).</li>
        <li>Charge and administer fees and plans — including the HK$5 trust and security fee, Premium trial and subscription charges, badge discounts, refunds where applicable, failed payments, and chargebacks, through our payment provider.</li>
        <li>Trust, security, and accountability — link a confirmed seat to a saved payment method and seat records; help identify who was associated with a seat if there is a dispute, unpaid restaurant bill, dine-and-dash, fraud, harassment, or similar misconduct; enforce our Terms and Community Guidelines; protect users, restaurants, and Buddy Blind.</li>
        <li>Notify you inside the product about seats, account, security, and service messages. We do not give your phone number to other people at the table for them to contact you outside the designed product flows.</li>
        <li>Tell a restaurant that a table was opened or joined: place, time, date, and number of people — not your phone number for other guests to see.</li>
        <li>Prevent and investigate fraud, abuse, and crime — including cooperating with the Hong Kong Police Force or other competent authorities where Cap. 486 and other Hong Kong law permit or require.</li>
        <li>Handle support and complaints — reply if you write to us; handle data access / correction requests.</li>
        <li>Improve and secure the Service — debugging, security monitoring, capacity, and product improvement using aggregated or de-identified data where practicable.</li>
        <li>Business operations — accounting, tax, audit, insurance, corporate reorganisation, and professional advice.</li>
        <li>Direct marketing — only if you opt in separately (see section 3).</li>
      </ol>
      <p>We do not sell personal data for money.</p>
      <p>We will not use personal data for a new purpose unrelated to the above without your prescribed consent under Cap. 486, unless Cap. 486 otherwise permits or requires.</p>

      <h2>3. Direct marketing (Cap. 486 Part 6A) and Cap. 593</h2>
      <h3>3.1 Direct marketing under Cap. 486</h3>
      <p>We will not use your personal data for direct marketing unless you opt in separately. Opting in is not a condition of taking a seat.</p>
      <p>If you opt in, we may use your personal data to offer or advertise Buddy Blind facilities and services (for example Premium, events, or product updates) through channels you agree to.</p>
      <p>You may opt out at any time, at no charge, by emailing privacy@buddyblind.com or using the unsubscribe / opt-out channel we provide. After we receive a valid opt-out, we will stop using your personal data for that direct marketing purpose without charge.</p>
      <h3>3.2 Commercial electronic messages (Cap. 593)</h3>
      <p>If we send commercial electronic messages that have a Hong Kong link under the Unsolicited Electronic Messages Ordinance (Cap. 593), we will do so in line with Cap. 593 (including accurate sender information and an unsubscribe facility where required, and respect for unsubscribe requests and applicable do-not-call rules).</p>
      <p>Service / transactional messages about your seats, charges, trust and security, account security, or Terms enforcement are not treated as optional marketing. You may still receive those while you have an account or an outstanding seat/payment matter.</p>

      <h2>4. Who we share it with</h2>
      <p>We may provide personal data to the following classes of persons, for the purposes in section 2:</p>
      <ol>
        <li>Payment processors — currently Stripe, for payment processing, fraud tools, and payment-method references.</li>
        <li>Hosting, infrastructure, analytics, email/SMS/push, and support providers — including Vercel and other processors we engage to run, secure, and support the Service. They may process data only on our instructions and under contracts that require appropriate protection.</li>
        <li>Restaurants / venues — limited seat details (place, time, date, number of people) when you confirm a seat there; not your phone number for other guests to see, unless a future product feature obtains a further lawful basis and notice.</li>
        <li>Other users — only what the product is designed to show (for example an initial, circle colour, fields you leave visible, and content you choose to send through in-product notify / buddy / event flows). Not your phone number or email as a default disclosure.</li>
        <li>Professional advisors — lawyers, auditors, insurers, consultants bound by confidentiality duties.</li>
        <li>Authorities and courts — if Hong Kong law requires disclosure, or to respond to a lawful request, warrant, or order, or where Cap. 486 permits disclosure.</li>
        <li>A buyer or successor — if we sell, transfer, or reorganise all or part of the business or assets, under continuing privacy duties consistent with this policy or a successor notice.</li>
      </ol>
      <p>We do not promise to disclose full card numbers to restaurants, other users, or any person on demand. Card data is handled by the payment provider. Any cooperation with the Police uses only data we lawfully hold and may lawfully disclose.</p>

      <h2>5. Transfer outside Hong Kong</h2>
      <p>Some providers may store or access data outside Hong Kong, including in the United States and other places where our processors operate.</p>
      <p>Section 33 of the PDPO (restriction on transfer of personal data outside Hong Kong) is not yet in operation. We still tell you about overseas processing so you can decide whether to use the Service.</p>
      <p>We take practicable steps to require providers to protect personal data and to use it only for our instructed purposes. We cannot control every risk of overseas law or provider failure; see section 8.</p>

      <h2>6. How long we keep it</h2>
      <p>We retain personal data no longer than necessary for the purposes in section 2, subject to Cap. 486 and legal requirements. Typical periods:</p>
      <ul>
        <li>Account / profile data: while the account is open, then up to 24 months after closure, unless we must keep it longer for a dispute, charge, investigation, or law</li>
        <li>Payment, trust fee, plan, refund, and chargeback records: up to 7 years (accounting, tax, fraud, and legal claims)</li>
        <li>Seat, buddy, rating, comment, and notification records: up to 24 months after the relevant seat or activity, longer if needed for a dispute, safety, or legal matter</li>
        <li>Serious-breach / ban records: up to 6 years, so a banned person cannot simply rejoin</li>
        <li>Technical / security logs: usually shorter operational periods, longer if needed for security investigation</li>
      </ul>
      <p>We may keep data longer where Cap. 486 or other Hong Kong law requires or permits, or where needed for establishing, exercising, or defending legal claims.</p>
      <p>Closing your account does not require us to erase records we still need for trust and security, payments, bans, disputes, or law.</p>

      <h2>7. Your rights under Cap. 486</h2>
      <p>Under Cap. 486 you may:</p>
      <ul>
        <li>request access to your personal data we hold; and</li>
        <li>request correction of your personal data if it is inaccurate.</li>
      </ul>
      <p>We will respond within 40 days as required under Cap. 486 (or explain if we need more time where the Ordinance allows). We may charge a reasonable fee allowed by the PDPO for a data access request. We may refuse a request only on grounds permitted by Cap. 486.</p>
      <p>Email privacy@buddyblind.com with the subject line “Data request”. We may need to verify your identity before acting.</p>
      <p>Erasure: Hong Kong law does not give a general “right to be forgotten” equivalent to some overseas regimes. You may close your account and ask us to delete what we do not need to keep for the purposes and periods above. We will delete or de-identify the rest where practicable.</p>
      <p>We do not adopt GDPR, CCPA, or other non-Hong Kong privacy regimes in this policy.</p>

      <h2>8. Security and personal data incidents</h2>
      <p>We use access controls, hashed passwords, and a payment provider certified to handle cards. We take practicable steps under Cap. 486 to protect personal data against unauthorised or accidental access, processing, erasure, loss, or use.</p>
      <p>No online service is perfectly secure. You are responsible for keeping your login credentials confidential and for content you choose to upload or reveal to other users at a seat.</p>
      <p>Hong Kong law does not impose a general statutory duty to notify you of every personal data incident. If a breach is likely to cause significant harm, we will take steps we consider appropriate, which may include notifying affected individuals and, where warranted, the Privacy Commissioner for Personal Data. Nothing in this policy creates a broader notification duty than Cap. 486 and applicable Hong Kong law require.</p>

      <h2>9. Other users, restaurants, and your own risk</h2>
      <p>Buddy Blind is a platform for meeting people you have not screened.</p>
      <ul>
        <li>We are not responsible for how other users use information they see through the product or learn at a seat.</li>
        <li>We are not responsible for a restaurant’s own collection or use of personal data when you dine there.</li>
        <li>Do not share phone numbers, addresses, or identity documents with other users unless you accept that risk.</li>
        <li>Content you post may be visible to others according to product design; think before you upload.</li>
      </ul>
      <p>To the fullest extent Hong Kong law allows, Buddy Blind is not liable for other users’ or restaurants’ misuse of personal data once it has been disclosed through intended product flows or offline at a seat.</p>

      <h2>10. Children</h2>
      <p>Buddy Blind is not for anyone under 18. We do not knowingly collect personal data from children under 18. If we learn we hold such data, we will close the account and delete data we do not need to keep for legal or security reasons (for example a ban record).</p>

      <h2>11. Accuracy and your duties</h2>
      <p>You must provide accurate personal data where it is needed for the account, seats, payments, and trust features. You must not impersonate others or submit another person’s personal data without authority.</p>
      <p>If your email, phone, or payment method changes, update it promptly. We are not responsible for loss caused by your outdated or false data.</p>

      <h2>12. Changes to this policy</h2>
      <p>We may update this policy. The “Last updated” date will change. The new version applies from that date. If you continue using the Service after an update, you are taken to have accepted it. If you do not accept it, stop using the Service and close your account.</p>
      <p>Where Cap. 486 requires a fresh notice or consent for a material new purpose, we will provide it.</p>

      <h2>13. Governing law</h2>
      <p>This policy is governed by the laws of Hong Kong. Privacy complaints may be raised with us first at the contact below. You may also contact the Office of the Privacy Commissioner for Personal Data, Hong Kong.</p>

      <h2>14. Contact</h2>
      <p>Privacy questions and Cap. 486 data access / correction requests: privacy@buddyblind.com</p>
      <p>Legal / Terms: legal@buddyblind.com</p>
    </PolicyFrame>
  );
}
