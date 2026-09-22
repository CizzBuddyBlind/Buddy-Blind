
export default function Premium(){
 return(<main className="max-w-5xl mx-auto px-6 py-20">
  <h1 className="text-5xl font-black">PREMIUM</h1>
  <p className="mt-4 text-zinc-400">For those with good taste that need no proof.</p>
  <div className="mt-12 grid md:grid-cols-2 gap-6">
    <div className="bg-[#111] border border-zinc-800 rounded-[32px] p-10"><h3 className="text-2xl font-bold">FREE</h3><ul className="mt-6 text-sm text-zinc-500 space-y-2"><li>• 1 blind/month</li><li>• No guest invite</li><li>• Public drop only</li></ul><div className="mt-8 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-xs tracking-widest">CURRENT</div></div>
    <div className="bg-white text-black rounded-[32px] p-10"><h3 className="text-2xl font-black">HEART - $19/mo</h3><ul className="mt-6 text-sm space-y-2"><li>• 4 blinds/month</li><li>• 3 invites/month</li><li>• Private events access</li><li>• 2h early access to drops</li></ul><button className="mt-8 w-full h-12 rounded-full bg-black text-white font-black text-xs tracking-widest">GET HEART</button></div>
  </div>
 </main>)
}
