
export default function HowItWorks(){
 return(<main className="max-w-5xl mx-auto px-6 py-20">
  <h1 className="text-5xl font-black">HOW IT WORKS</h1>
  <div className="mt-16 grid md:grid-cols-3 gap-12">
    <div><div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black">1</div><h3 className="mt-6 font-bold text-xl">You see only vibes</h3><p className="mt-3 text-sm text-zinc-500">No names, no photos, no menu. Just location area, price tier, and left count. Like {`{ 6 LEFT }`}.</p></div>
    <div><div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-black">2</div><h3 className="mt-6 font-bold text-xl">You book blind</h3><p className="mt-3 text-sm text-zinc-500">Pay $88 deposit. We subtract places_left in Supabase. You get address only 2h before.</p></div>
    <div><div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-black">3</div><h3 className="mt-6 font-bold text-xl">You show up, you taste</h3><p className="mt-3 text-sm text-zinc-500">No decisions. Chef picks. You rate after. Good taste = more invites.</p></div>
  </div>
  <div className="mt-20 bg-[#111] border border-zinc-800 rounded-[32px] p-10"><h4 className="font-black tracking-widest text-xs">INVITE & JOIN PROCESS</h4><div className="mt-6 grid md:grid-cols-4 gap-6 text-sm"><div><b>Invite:</b> Member sends invite link (/invite). 1 invite = 1 buddy.</div><div><b>Join:</b> Buddy signs via /join, pays, gets waitlist.</div><div><b>Drop:</b> Every Thu 8pm, 3 new blind venues drop.</div><div><b>Reveal:</b> Venue name revealed only at table.</div></div></div>
 </main>)
}
