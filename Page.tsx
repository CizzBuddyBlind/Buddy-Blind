
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Venue = { id: string, name: string, location: string, photo_url?: string, places_left: number, cuisine?: string, price?: string }

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('venues').select('*').order('created_at', { ascending: false })
      if (!error && data) setVenues(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F3EF]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 md:px-12 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-mono">BB</div>
          <span className="font-mono text-xs tracking-widest">BUDDY BLIND</span>
        </div>
        <div className="hidden md:flex gap-8 font-mono text-[11px] tracking-widest text-white/60">
          <Link href="/" className="text-white">VENUES</Link>
          <Link href="/#private">PRIVATE EVENTS</Link>
          <Link href="/#how">HOW IT WORKS</Link>
          <Link href="/admin" className="hover:text-white">ADMIN</Link>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">CJ</div>
      </nav>

      {/* Hero - V9 Heart exact */}
      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 px-8 md:px-12 pt-16 pb-20 max-w-[1440px] mx-auto">
        <div>
          <div className="font-mono text-[11px] tracking-widest text-white/30 mb-8">HONG KONG · TONIGHT · 1,247 BLIND BOXES / 89 HOSTS / 156 SCENES</div>
          <h1 className="font-instrument text-[56px] md:text-[88px] leading-[0.9] tracking-tight">
            <span className="block text-white">You don't know</span>
            <span className="block text-white italic font-light">who you'll meet.</span>
            <span className="block text-[#C45A3C]">That's the point.</span>
          </h1>
          <p className="mt-8 text-white/60 max-w-[380px] leading-relaxed">Restaurants provide the scene. Private events create the reason. You bring curiosity.</p>
          <div className="mt-10 flex gap-4">
            <Link href="#venues" className="px-6 py-3 rounded-full bg-white text-black font-mono text-xs tracking-widest">JOIN A BLIND DINNER →</Link>
            <Link href="/#private" className="px-6 py-3 rounded-full border border-white/20 font-mono text-xs tracking-widest text-white/60">PRIVATE EVENTS</Link>
          </div>
        </div>

        {/* Featured Card - Kissa Tanaka style */}
        <div className="relative">
          <div className="font-mono text-[10px] tracking-widest text-white/30 mb-3">● FEATURED TONIGHT · ONE BLIND BOX OPEN</div>
          <div className="rounded-[24px] overflow-hidden bg-[#151515] border border-white/10">
            <div className="relative h-[380px] bg-[#222]">
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-mono">SOHO · TONIGHT 7:30PM</span>
                <span className="px-3 py-1.5 rounded-full bg-[#C45A3C] text-[10px] font-mono">3 SPOTS LEFT</span>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-mono">C HOST: COMEDIAN · GOLD</div>
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-mono text-xs">Restaurant Photo</div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-black"></div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-xs">?</div>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-black/70 text-[10px] font-mono">$$ · CREATIVE MINDS</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-instrument text-[24px]">Kissa Tanaka</h3>
              <div className="font-mono text-[10px] text-white/30 mt-1">SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS</div>
              <p className="font-mono text-[11px] text-white/50 mt-3 leading-relaxed">CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS — NO PITCHES, JUST PRESENCE.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venues - Real Supabase */}
      <section id="venues" className="px-8 md:px-12 pb-24 max-w-[1440px] mx-auto">
        <div className="font-mono text-[11px] tracking-widest text-white/30 mb-6">ALL VENUES · {loading ? 'LOADING...' : `${venues.length} OPEN TONIGHT`}</div>
        <div className="grid md:grid-cols-3 gap-6">
          {venues.map(v => (
            <div key={v.id} className="rounded-[24px] overflow-hidden bg-[#151515] border border-white/10 group hover:border-white/20 transition-all">
              <div className="h-[240px] bg-[#1E1E1E] relative overflow-hidden">
                {v.photo_url ? <img src={v.photo_url} alt={v.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20 font-mono text-xs">No Photo</div>}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-[10px] font-mono">{v.location}</div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#C45A3C] text-[10px] font-mono">{v.places_left} SPOTS LEFT</div>
              </div>
              <div className="p-5 flex justify-between items-end">
                <div>
                  <h4 className="font-instrument text-[20px]">{v.name}</h4>
                  <div className="font-mono text-[11px] text-white/40 mt-1">📍 {v.location}</div>
                </div>
                <button className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs">Join</button>
              </div>
            </div>
          ))}
        </div>
        {venues.length === 0 && !loading && <div className="text-white/30 font-mono text-center py-20">No venues yet. Go to /admin to add.</div>}
      </section>
    </div>
  )
}
