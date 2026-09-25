import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Accessibility · Buddy Blind" };

export default function AccessibilityPage() {
  return (
    <PolicyFrame kicker="Legal" title="Accessibility">
      <p>Buddy Blind should be usable by as many adults as we can reasonably support. We aim towards the Web Content Accessibility Guidelines 2.2, level AA, for the public website. We have not commissioned a formal audit, and we do not claim a certification.</p>

      <h2>1. What we aim for</h2>
      <ul>
        <li>Text you can read against the background.</li>
        <li>Buttons and links with visible names.</li>
        <li>Pages that work with a keyboard, not only a pointer.</li>
        <li>No information that exists only as colour. A gold circle also has a letter.</li>
        <li>Captions or a text alternative where we add video that carries the meaning of a seat. Host videos are the host’s content. We cannot promise each one has captions.</li>
      </ul>

      <h2>2. Known limits</h2>
      <p>Some restaurant photos are supplied by places or hosts. We cannot promise every image has a useful description. The in-person meal is at a third-party restaurant. Access to that room, including step-free entry, is the restaurant’s responsibility. Ask the place before you go.</p>

      <h2>3. Tell us</h2>
      <p>If something blocks you, email privacy@buddyblind.com with the page address and what you were trying to do. We will look at it and reply. We do not guarantee a fix by a particular date, and we do not accept liability for a failure to meet a voluntary guideline, except where the law imposes a duty we cannot limit.</p>
    </PolicyFrame>
  );
}
