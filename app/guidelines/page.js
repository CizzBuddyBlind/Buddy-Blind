import Link from "next/link";
import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Community Guidelines · Buddy Blind" };

export default function GuidelinesPage() {
  return (
    <PolicyFrame kicker="Legal" title="Community Guidelines">
      <p>These guidelines are part of the <Link href="/terms" className="text-ember">Terms</Link>. They exist so a table stays a meal, not a problem we have to answer for.</p>

      <h2>1. Be a guest, not a risk</h2>
      <ul>
        <li>Show up, or send a notify if you cannot. Do not leave people waiting in silence if you already know.</li>
        <li>No harassment, stalking, hate, or sexual pressure.</li>
        <li>No recording of faces or conversations unless everyone there agrees.</li>
        <li>No weapons, no illegal drugs, no drink-spiking, no theft.</li>
        <li>Adults only. Nothing sexual involving anyone under 18. We report that.</li>
      </ul>

      <h2>2. Keep people blind until the table</h2>
      <ul>
        <li>Do not post another person’s phone number, full name, workplace, photo, or exact home address.</li>
        <li>Do not try to identify someone before the meal and then screen them out. That breaks the product and can be used to target people.</li>
        <li>Your notify messages stay inside the seat. Do not copy them out to shame someone.</li>
      </ul>

      <h2>3. Hosts</h2>
      <p>A private night is still your gathering, on our platform. Do not advertise it as run by Buddy Blind. Do not charge guests an extra fee through us or off to the side for “access” to the table. The only Buddy Blind charge is the administration fee in the product. Do not change the place, the location, or the time inside the lock window. Do not use the night to pitch a product unless the description says that clearly before anyone joins.</p>

      <h2>4. What we do</h2>
      <p>We may remove a seat, a photo, a comment, or an account. We do not promise to monitor every table. A report is not a promise that we will act, or that we will act in the way you prefer. Email legal@buddyblind.com. If you are in immediate danger, contact the police. We are not an emergency service.</p>
    </PolicyFrame>
  );
}
