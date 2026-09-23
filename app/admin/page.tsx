
'use client';
export default function AdminPage(){
  return (
    <div className="min-h-screen bg-[#080808] text-white p-8 pt-[90px]">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-black">ADMIN - Coming Later</h1>
        <p className="mt-3 text-[13px] text-zinc-500">We finish buttons first without admin. Location part is built to be ready for future admin update from restaurant.</p>
        <div className="mt-6 bg-[#111] border border-zinc-800 rounded-[20px] p-6 text-[12px] text-zinc-400 space-y-2">
          <div>Current button flows (all working, no admin needed):</div>
          <div>• Guest can browse every page until JOIN/INVITE → /auth</div>
          <div>• JOIN: Register age 18→18-23 auto, gender, orientation optional, phone MUST, OTP 123456, 90-day trial, Subscribe → Confirm → saved Visa •••• 4242 → single-button next time</div>
          <div>• INVITE: Step 1 LOCATION dynamic (if restaurant 1 location auto skip, if McDonald's many locations show all, ready for future admin restaurant update) → Step 2 DATE Mon-Sun with date + NEXT WEEK >> → Step 3 TIME presets + custom type box → Step 4 TYPE BLIND DATE / MEET FRIENDS → Step 5 PARTICIPANTS 2-6 → Step 6 PREFERENCE → Step 7 SUMMARY & PAY HK$5 → CONFIRM BLIND BOX</div>
          <div>• SHARE: Copy Link / Bookmark / Share via... + WhatsApp / Messages / News Feed / Your groups / Chats</div>
        </div>
        <div className="mt-6">
          <a href="/venues" className="px-6 py-3 rounded-full bg-white text-black font-black text-[11px] tracking-widest">GO TO VENUES - TEST BUTTONS</a>
        </div>
      </div>
    </div>
  );
}
