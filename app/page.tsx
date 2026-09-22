
'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import AuthGateModal from '@/components/AuthGateModal';

export default function Home(){
  const [showAuth,setShowAuth]=useState(false);
  const [booked,setBooked]=useState(false);
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header/>
      <main className="max-w-[1600px] mx-auto px-8 lg:px-12 py-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
        {/* LEFT HERO */}
        <div className="pt-10">
          <div className="mono text-[11px] tracking-[0.18em] text-zinc-500 flex items-center gap-2">
            HONG KONG · TONIGHT · 1,247 BLIND BOXES / 89 HOSTS / 156 SCENES
          </div>
          <h1 className="hero-h1 mt-12">
            <span className="block font-light">You don't know</span>
            <span className="block italic font-light">who you'll meet.</span>
            <span className="block orange font-light">That's the point.</span>
          </h1>
          <p className="mt-10 text-[18px] leading-[1.6] text-zinc-400 max-w-[520px]">
            Restaurants provide the scene. Private events create the reason.<br/>
            <span className="text-zinc-300">You bring curiosity.</span>
          </p>
          <div className="mt-12 flex gap-4">
            <button onClick={()=>setShowAuth(true)} className="h-[48px] px-8 rounded-full bg-white text-black mono text-[12px] tracking-[0.15em] font-bold hover:bg-zinc-100 transition">
              JOIN A BLIND DINNER →
            </button>
            <button className="h-[48px] px-8 rounded-full border border-zinc-800 mono text-[12px] tracking-[0.15em] text-zinc-400 hover:text-white hover:border-zinc-700 transition">
              PRIVATE EVENTS
            </button>
          </div>
          <div className="mt-20 grid grid-cols-3 max-w-[420px] border-t border-zinc-900 pt-10">
            <div><div className="text-[36px] font-light">89</div><div className="mt-3 mono text-[10px] tracking-[0.15em] text-zinc-500 leading-[1.6]">HOSTS WHO SHOW<br/>UP</div></div>
            <div><div className="text-[36px] font-light">156</div><div className="mt-3 mono text-[10px] tracking-[0.15em] text-zinc-500">SCENES TONIGHT</div></div>
            <div><div className="text-[36px] font-light">4.8</div><div className="mt-3 mono text-[10px] tracking-[0.15em] text-zinc-500 leading-[1.6]">AVG AFTER-TALK<br/>RATING</div></div>
          </div>
        </div>

        {/* RIGHT FEATURED CARD */}
        <div className="relative">
          <div className="mono text-[11px] tracking-[0.18em] text-zinc-600 flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C46A4A] inline-block"/> FEATURED TONIGHT · ONE BLIND BOX OPEN
          </div>
          <div className="featured-card">
            <div className="relative h-[560px] bg-[#1A1A1A]">
              {/* image placeholder - use dark restaurant */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"/>
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200" className="w-full h-full object-cover opacity-80" alt="restaurant"/>
              <div className="absolute top-5 left-5 flex gap-2">
                <div className="h-9 px-4 rounded-full bg-black/70 backdrop-blur-md border border-white/10 mono text-[11px] tracking-[0.15em] flex items-center">SOHO · TONIGHT 7:30PM</div>
                <div className="h-9 px-4 rounded-full bg-[#C46A4A] mono text-[11px] tracking-[0.15em] flex items-center">3 SPOTS LEFT</div>
              </div>
              <div className="absolute top-5 right-5 -mt-10 mr-[-10px] h-10 px-4 rounded-full bg-white text-black mono text-[11px] tracking-[0.15em] flex items-center gap-2 shadow-xl"><span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">C</span> HOST: COMEDIAN · GOLD</div>
              <div className="absolute bottom-5 left-5 flex items-center">
                <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black"/><div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black"/><div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-black"/><div className="w-8 h-8 rounded-full bg-white text-black border-2 border-black flex items-center justify-center text-[11px]">?</div></div>
              </div>
              <div className="absolute bottom-5 right-5 h-9 px-4 rounded-full bg-black/70 backdrop-blur-md border border-white/10 mono text-[11px] tracking-[0.15em] flex items-center">$$ · CREATIVE MINDS</div>
            </div>
            <div className="p-8 bg-[#111]">
              <h3 className="text-[28px] font-light tracking-tight">Kissa Tanaka</h3>
              <div className="mt-2 mono text-[11px] tracking-[0.15em] text-zinc-500">SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS</div>
              <p className="mt-5 mono text-[11px] tracking-[0.12em] text-zinc-400 leading-[1.7]">CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS — NO PITCHES, JUST PRESENCE.</p>
              <button className="mt-5 h-9 px-5 rounded-full border border-zinc-800 mono text-[11px] tracking-[0.15em]">SHARE</button>
              <p className="mt-6 text-[15px] leading-[1.6] text-zinc-400">A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.</p>
              <div className="mt-8 flex gap-3">
                <button onClick={()=>setShowAuth(true)} className="flex-1 h-[56px] rounded-full bg-white text-black mono text-[12px] tracking-[0.18em] font-bold hover:bg-zinc-100 transition">{booked?'BOOKED ✓':'JOIN BLIND BOX'}</button>
                <button className="h-[56px] px-8 rounded-full border border-zinc-800 mono text-[12px] tracking-[0.15em] hover:border-zinc-700 transition">INVITE</button>
              </div>
              <div className="mt-6 mono text-[10px] tracking-[0.15em] text-zinc-600 leading-[1.6]">DIFFERENT PHOTOS ON EVENT PAGE AND PRIVATE EVENT PAGE · NO REPEATS · MORE HEART</div>
            </div>
          </div>
          <div className="mt-6 mono text-[10px] tracking-[0.18em] text-zinc-700">SCROLL — NONE. BOTTOM PART — REMOVED PER FEEDBACK.</div>
        </div>
      </main>
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>setBooked(true)} venueName="Kissa Tanaka" />
    </div>
  );
}
