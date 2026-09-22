
export default function PrivateEvents(){
 return(<main className="max-w-5xl mx-auto px-6 py-20">
  <h1 className="text-5xl font-black">PRIVATE EVENTS</h1>
  <p className="mt-4 text-zinc-400 max-w-2xl">Buddy Blind for teams, birthdays, and secret dinners. We take over a venue, you bring the buddies. No menus shared until you sit.</p>
  <div className="mt-12 grid md:grid-cols-3 gap-6">
    <div className="bg-[#111] border border-zinc-800 rounded-[24px] p-8"><div className="text-amber-300 text-xs tracking-widest">TEAMS</div><div className="mt-3 font-bold text-xl">8-20 people</div><div className="mt-2 text-sm text-zinc-500">Blind lunch, trust game included</div></div>
    <div className="bg-[#111] border border-zinc-800 rounded-[24px] p-8"><div className="text-amber-300 text-xs tracking-widest">BIRTHDAY</div><div className="mt-3 font-bold text-xl">Secret Takeover</div><div className="mt-2 text-sm text-zinc-500">We handle venue + cake, you bring crew</div></div>
    <div className="bg-[#111] border border-zinc-800 rounded-[24px] p-8"><div className="text-amber-300 text-xs tracking-widest">BRANDS</div><div className="mt-3 font-bold text-xl">Drop Collab</div><div className="mt-2 text-sm text-zinc-500">Your product, our blind venue</div></div>
  </div>
  <a href="/invite" className="mt-12 inline-flex px-8 h-14 rounded-full bg-white text-black font-black text-xs tracking-widest items-center">REQUEST PRIVATE</a>
 </main>)
}
