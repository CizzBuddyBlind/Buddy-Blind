
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const links=[{href:'/',label:'DROP'},{href:'/venues',label:'VENUES'},{href:'/private-events',label:'PRIVATE'},{href:'/how-it-works',label:'HOW IT WORKS'},{href:'/premium',label:'PREMIUM'}]
export default function Navbar(){
  const path=usePathname()
  return(<nav className="sticky top-0 z-40 border-b border-zinc-800/50 glass">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link href="/" className="font-black tracking-[0.2em] text-sm">BUDDY BLIND</Link>
      <div className="hidden md:flex gap-8">{links.map(l=><Link key={l.href} href={l.href} className={`text-[11px] tracking-[0.2em] ${path===l.href?'text-white':'text-zinc-500 hover:text-zinc-300'}`}>{l.label}</Link>)}</div>
      <div className="flex gap-3"><Link href="/invite" className="text-[11px] tracking-widest px-4 py-2 rounded-full border border-zinc-700 hover:bg-white hover:text-black transition">INVITE</Link><Link href="/profile" className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">C</Link></div>
    </div>
  </nav>)
}
