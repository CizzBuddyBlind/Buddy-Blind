
'use client'
import { useState } from 'react'
export default function Invite(){
  const [copied,setCopied]=useState(false)
  const link='https://buddy-blind.vercel.app/join?ref=cizz-HEART'
  return(<main className="max-w-2xl mx-auto px-6 py-20 text-center">
    <h1 className="text-5xl font-black">INVITE</h1><p className="mt-4 text-zinc-500">Good taste is scarce. Invite only 3 buddies per month.</p>
    <div className="mt-12 bg-[#111] border border-zinc-800 rounded-[32px] p-8">
      <div className="text-xs tracking-[0.3em] text-zinc-500">YOUR INVITE LINK</div><div className="mt-4 bg-black border border-zinc-800 rounded-full px-6 py-4 text-sm font-mono truncate">{link}</div>
      <button onClick={()=>{navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="mt-6 w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">{copied?'COPIED':'COPY LINK'}</button>
      <div className="mt-6 text-xs text-zinc-600">1 invite used • 2 left • Resets in 12 days</div>
    </div>
  </main>)
}
