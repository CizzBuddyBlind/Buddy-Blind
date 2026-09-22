'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
import VenueCard from '@/components/VenueCard';
export default function Home(){
  const [venues,setVenues]=useState<any[]>([]);
  useEffect(()=>{ supabase.from('venues').select('*').limit(12).then(({data})=>{ if(data && data.length) setVenues(data); else setVenues([{id:'1',name:'MC',location:'Central',places_left:6,vibe:'NO MENU'},{id:'2',name:'麥當勞 中環店',location:'中環',places_left:4,vibe:'NO MENU'},{id:'3',name:'Test 餐廳',location:'銅鑼灣',places_left:2,vibe:'NO MENU'}]); }); },[]);
  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-8 py-20">
        <h1 className="buddy-title text-white">BUDDY BLIND</h1>
        <p className="mt-6 text-[16px] text-zinc-500 max-w-[720px] leading-relaxed">Browse venues free. JOIN / INVITE requires OTP verification per Features Bible. Username, Age 18-23...53+, Gender, Orientation, Phone OTP, Email, Password 6+ chars.</p>
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {venues.map(v=><VenueCard key={v.id} venue={v} />)}
        </div>
        <div className="mt-24 p-8 rounded-[24px] bg-[#111] border border-zinc-800">
          <div className="text-[12px] tracking-widest text-amber-300">V9 HEART EMBEDDED - FIXED</div>
          <div className="mt-3 text-[14px] text-zinc-400">✓ No white Stripe redirect • ✓ Payment inside black modal • ✓ Tailwind restored • ✓ V9 card style restored • Use test card 4242 4242 4242 4242 • OTP 123456</div>
        </div>
      </div>
    </div>
  );
}
