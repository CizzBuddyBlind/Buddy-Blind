
'use client';
import Link from 'next/link';
export default function Header(){
 return (
  <header className="nav-blur sticky top-0 z-50 h-[72px] flex items-center justify-between px-8">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-black text-[13px]">BB</div>
      <span className="mono text-[13px] tracking-[0.18em]">BUDDY BLIND</span>
    </div>
    <nav className="hidden md:flex items-center gap-8 mono text-[12px] tracking-[0.15em] text-zinc-500">
      <Link href="/venues" className="hover:text-white transition">VENUES</Link>
      <Link href="/private" className="hover:text-white transition">PRIVATE EVENTS</Link>
      <Link href="/how" className="hover:text-white transition">HOW IT WORKS</Link>
      <Link href="/premium" className="hover:text-white transition">PREMIUM</Link>
      <Link href="/profile" className="hover:text-white transition">PROFILE</Link>
    </nav>
    <div className="w-9 h-9 rounded-full bg-[#1E1E1E] border border-zinc-800 flex items-center justify-center text-[12px]">CJ</div>
  </header>
 );
}
