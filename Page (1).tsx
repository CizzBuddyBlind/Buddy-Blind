
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Venue = { id?: string, name: string, location: string, address?: string, photo_url?: string, photos?: string[], cuisine?: string, price?: string, venue_type?: string, date_time?: string, places_left: number, preferences?: string, host_name?: string, host_badge?: string, invite_msg?: string }

export default function AdminPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [form, setForm] = useState<Venue>({ name: '', location: '', address: '', photo_url: '', cuisine: 'Japanese', price: '$$', venue_type: 'Counter', date_time: '', places_left: 6, preferences: 'Creative Minds', host_name: 'CJ', host_badge: 'GOLD', invite_msg: 'CJ invites you to join a dinner and meet new friends' })
  const [open, setOpen] = useState({ details: true, photos: false, cuisine: false, event: false, participant: false, payment: false, notify: false })

  async function load() {
    const { data } = await supabase.from('venues').select('*').order('created_at', { ascending: false })
    if (data) setVenues(data)
  }
  useEffect(() => { load() }, [])

  async function addVenue() {
    if (!form.name || !form.location) { alert('Name + Location required'); return }
    const { error } = await supabase.from('venues').insert([{ 
      name: form.name, 
      location: form.location, 
      photo_url: form.photo_url, 
      places_left: form.places_left 
    }])
    if (error) alert('Error: ' + error.message)
    else { setForm({ ...form, name: '', photo_url: '' }); load() }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-black">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-black/10">
        <Link href="/" className="font-mono text-xs">← Go Back</Link>
        <span className="font-mono text-xs tracking-widest">ADMIN - BIBLE EDITION</span>
        <span className="font-mono text-xs">{venues.length} venues</span>
      </nav>

      <div className="max-w-[900px] mx-auto p-8 grid md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          <h1 className="text-[32px] font-serif">Add Restaurant / Venue</h1>
          <p className="font-mono text-xs text-black/50">Follow Features Bible: Simple to look at, easy to use, but detailed when user wants to know more. 7 Sections.</p>

          {/* Section 1 */}
          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, details: !open.details })} className="w-full flex justify-between p-5 font-mono text-xs">1. Restaurant/Venue Details <span>{open.details ? '−' : '+'}</span></button>
            {open.details && <div className="p-5 pt-0 grid gap-3">
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Name (Kissa Tanaka)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Location (SOHO / Central / CWB)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Address + Google Maps Link" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>}
          </div>

          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, photos: !open.photos })} className="w-full flex justify-between p-5 font-mono text-xs">2. Photos <span>{open.photos ? '−' : '+'}</span></button>
            {open.photos && <div className="p-5 pt-0 grid gap-3">
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Photo URL (https://...)" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} />
              {form.photo_url && <img src={form.photo_url} className="h-40 object-cover rounded-lg" />}
            </div>}
          </div>

          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, cuisine: !open.cuisine })} className="w-full flex justify-between p-5 font-mono text-xs">3. Cuisine / Price / Type <span>{open.cuisine ? '−' : '+'}</span></button>
            {open.cuisine && <div className="p-5 pt-0 grid grid-cols-3 gap-3">
              <select className="border rounded-lg px-3 py-3 text-sm" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })}><option>Japanese</option><option>Kissaten</option><option>Fusion</option><option>Fine Dining</option><option>Izakaya</option></select>
              <select className="border rounded-lg px-3 py-3 text-sm" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}><option>$</option><option>$$</option><option>$$$</option><option>$$$$</option></select>
              <select className="border rounded-lg px-3 py-3 text-sm" value={form.venue_type} onChange={e => setForm({ ...form, venue_type: e.target.value })}><option>Counter</option><option>Private Room</option><option>Bar</option></select>
            </div>}
          </div>

          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, event: !open.event })} className="w-full flex justify-between p-5 font-mono text-xs">4. Event Details (Blind Box) <span>{open.event ? '−' : '+'}</span></button>
            {open.event && <div className="p-5 pt-0 grid gap-3">
              <input type="datetime-local" className="border rounded-lg px-4 py-3 text-sm" value={form.date_time} onChange={e => setForm({ ...form, date_time: e.target.value })} />
              <div className="flex gap-3"><label className="font-mono text-xs">Places 2-20</label><input type="number" min={2} max={20} className="border rounded-lg px-3 py-2 w-20" value={form.places_left} onChange={e => setForm({ ...form, places_left: parseInt(e.target.value) })} /></div>
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Preferences: Creative Minds / 30-40 Female preferred" value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} />
              <div className="font-mono text-[10px] bg-black text-white p-3 rounded-lg">Booking Logic: 7d=6 → 4d→4 if &lt;4 → 2d→2 if 1-2 → Walk-in if only inviter</div>
            </div>}
          </div>

          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, participant: !open.participant })} className="w-full flex justify-between p-5 font-mono text-xs">5. Participant Info + Host Badge <span>{open.participant ? '−' : '+'}</span></button>
            {open.participant && <div className="p-5 pt-0 grid gap-3">
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Host Name (CJ)" value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} />
              <select className="border rounded-lg px-4 py-3 text-sm" value={form.host_badge} onChange={e => setForm({ ...form, host_badge: e.target.value })}><option>GOLD</option><option>SILVER</option><option>BRONZE</option></select>
              <input className="border rounded-lg px-4 py-3 text-sm" placeholder="Invite Message" value={form.invite_msg} onChange={e => setForm({ ...form, invite_msg: e.target.value })} />
            </div>}
          </div>

          <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
            <button onClick={() => setOpen({ ...open, payment: !open.payment })} className="w-full flex justify-between p-5 font-mono text-xs">6. Payment Details <span>{open.payment ? '−' : '+'}</span></button>
            {open.payment && <div className="p-5 pt-0 font-mono text-xs">HK$5 Admin Fee (non-refundable) checkbox required before Confirm. Free 90d Premium / Lite $10 / Premium $50 to unlock Private Events.</div>}
          </div>

          <button onClick={addVenue} className="w-full py-4 rounded-full bg-black text-white font-mono text-xs tracking-widest">+ ADD VENUE TO SUPABASE → 首頁 + App 即時同步</button>
        </div>

        <div className="space-y-4">
          <div className="font-mono text-xs">而家有 {venues.length} 間</div>
          {venues.map(v => (
            <div key={v.id} className="bg-white rounded-2xl p-4 border border-black/10 flex gap-3">
              <div className="w-16 h-16 bg-black/10 rounded-lg overflow-hidden">{v.photo_url && <img src={v.photo_url} className="w-full h-full object-cover" />}</div>
              <div className="flex-1"><div className="font-serif">{v.name}</div><div className="font-mono text-[11px] text-black/50">{v.location} · {v.places_left} left</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
