
'use client';
export default function AdminPage(){
  return (
    <div className="min-h-screen bg-[#080808] text-white p-8 pt-[90px]">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-black">ADMIN - Coming Later</h1>
        <p className="mt-3 text-[13px] text-zinc-500">We finish buttons first without admin. Location part is built ready for future admin update.</p>
        <div className="mt-6 bg-[#111] border border-zinc-800 rounded-[20px] p-6 text-[12px] text-zinc-400 space-y-2">
          <div>Current button flows:</div>
          <div>Guest can browse every page until JOIN or INVITE goes to auth</div>
          <div>JOIN Register age 18 to 18-23 auto, gender, orientation optional, phone MUST, OTP 123456, 90-day trial, Subscribe Confirm, saved Visa 4242 single button</div>
          <div>INVITE Step 1 LOCATION dynamic if restaurant 1 location auto skip, if many locations show all ready for future admin restaurant update</div>
          <div>Step 2 DATE Mon to Sun with date plus NEXT WEEK button</div>
          <div>Step 3 TIME presets plus custom type box</div>
          <div>Step 4 TYPE BLIND DATE or MEET FRIENDS</div>
          <div>SHARE Copy Link Bookmark Share via plus WhatsApp Messages News Feed Your groups Chats</div>
        </div>
        <div className="mt-6">
          <a href="/venues" className="px-6 py-3 rounded-full bg-white text-black font-black text-[11px] tracking-widest">GO TO VENUES TEST BUTTONS</a>
        </div>
      </div>
    </div>
  );
}
