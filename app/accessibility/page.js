import { PolicyFrame } from "@/components/Policy";

export const metadata = { title: "Accessibility · Buddy Blind" };

export default function AccessibilityPage() {
  return (
    <PolicyFrame kicker="Legal" title="Accessibility">
      <p>Buddy Blind (“we”, “us”, “our”) wants the public website and app to be usable by as many adults (18+) as we can reasonably support.</p>
      <p>This page describes a voluntary accessibility aim. It is not a warranty, not a service-level promise, and not a certification.</p>

      <h2>1. Voluntary standard (not a claim of compliance)</h2>
      <p>We aim towards the Web Content Accessibility Guidelines (WCAG) 2.2, level AA, for the public website, as a design goal.</p>
      <ul>
        <li>We have not commissioned a formal accessibility audit for every page and release.</li>
        <li>We do not claim WCAG certification, conformance, or “AA compliance”.</li>
        <li>We do not claim compliance with overseas regimes. This Service is operated for Hong Kong and this statement is governed by Hong Kong law.</li>
        <li>Meeting a voluntary guideline is not a condition of the contract in our Terms & Conditions unless Hong Kong law separately imposes a duty we cannot limit.</li>
      </ul>
      <p>If anything on a marketing page suggests a stronger promise than this statement, this statement and the Terms prevail.</p>

      <h2>2. What we aim for</h2>
      <p>Where reasonably practicable for Buddy Blind–controlled public web pages, we aim for:</p>
      <ul>
        <li>text that can be read against the background;</li>
        <li>buttons and links with visible accessible names;</li>
        <li>pages that can be operated with a keyboard, not only a pointer;</li>
        <li>meaning that is not conveyed by colour alone (for example a gold circle also has a letter or other non-colour cue);</li>
        <li>captions or a text alternative where we add Buddy Blind–produced video that carries the meaning of a seat.</li>
      </ul>
      <p>Host and user videos and third-party media are the uploader’s content. We cannot promise that each one has captions, transcripts, or descriptions.</p>

      <h2>3. Known limits</h2>
      <p>Content we do not fully control:</p>
      <ul>
        <li>Restaurant photos, menus, and copy may be supplied by venues or hosts. We cannot promise every image has a useful text description.</li>
        <li>User-generated content (comments, ratings, private-night media, notify text) may not meet WCAG.</li>
        <li>Embedded or linked third-party services (for example Stripe checkout, maps, app stores) follow their accessibility practices, not ours.</li>
      </ul>
      <p>The in-person meal and venue:</p>
      <p>Buddy Blind is a platform for seats. The meal happens at a third-party restaurant or venue.</p>
      <ul>
        <li>Access to that place — including step-free entry, toilets, lifts, seating, service animals, and assistance — is the restaurant’s or venue’s responsibility.</li>
        <li>We do not inspect, certify, or guarantee physical accessibility of listed places.</li>
        <li>Ask the place before you go. Do not rely on Buddy Blind as an accessibility guide to the building.</li>
      </ul>
      <p>Product design limits:</p>
      <ul>
        <li>The Blind Box product deliberately limits what you see about other people before you arrive. That product choice is not an accessibility defect.</li>
        <li>Some flows (maps, camera upload, payments) depend on device, OS, and browser capabilities we do not control.</li>
        <li>Emergency or safety situations at a venue are outside Buddy Blind’s real-time supervision.</li>
      </ul>
      <p>Languages:</p>
      <p>We may offer English and/or Chinese. We do not promise that every accessibility aid, caption, or description exists in every language at all times.</p>

      <h2>4. Assistive technology</h2>
      <p>We do not warrant that the Service will work with every screen reader, browser, OS version, or assistive technology. Results vary by device and settings. You are responsible for keeping your software reasonably up to date.</p>

      <h2>5. Tell us</h2>
      <p>If something on our website or app blocks you, email privacy@buddyblind.com (or legal@buddyblind.com) with:</p>
      <ul>
        <li>the page or screen address;</li>
        <li>what you were trying to do;</li>
        <li>the device / browser (and assistive technology, if any);</li>
        <li>what went wrong.</li>
      </ul>
      <p>We will look at genuine reports about Buddy Blind–controlled interfaces and reply when practicable.</p>
      <p>We do not guarantee a fix, a fix by a particular date, a particular WCAG technique, or changes to third-party venue premises or host content. Repeated, abusive, or bad-faith reports may be ignored. Feedback does not create a duty beyond Hong Kong law.</p>

      <h2>6. Liability</h2>
      <p>To the fullest extent Hong Kong law allows:</p>
      <ul>
        <li>we do not accept liability for failure to meet a voluntary guideline (including WCAG 2.2 AA);</li>
        <li>we are not liable for third-party content, restaurant or venue physical access, Stripe or other processor interfaces, or host or user media;</li>
        <li>our liability for the Service remains as limited in the Terms & Conditions.</li>
      </ul>
      <p>Nothing in this page limits liability for death or personal injury caused by our negligence, fraud, or any other liability Hong Kong law does not allow us to limit.</p>

      <h2>7. Changes</h2>
      <p>We may update this page at any time. The “Last updated” date will change. Continued use of the Service after an update means you acknowledge the new version.</p>

      <h2>8. Contact</h2>
      <p>Accessibility / privacy: privacy@buddyblind.com</p>
      <p>Legal: legal@buddyblind.com</p>
    </PolicyFrame>
  );
}
