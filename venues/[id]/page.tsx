
'use client'
import { useState } from 'react'
import Link from 'next/link'

const VENUE_DATA:Record<string,any> = {
  'kissa-tanaka': {
    name:'Kissa Tanaka',
    area:'SOHO',
    cuisine:'KISSATEN · JAPANESE',
    price:'$$',
    branch:['TST','CWB','CENTRAL'],
    contact:'+852 2345 6789',
    opening:'6PM — 11:30PM',
    tonight:'TONIGHT 7:30PM · 3 SPOTS LEFT',
    image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    gallery:[
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    about_type:'Intimate counter, warm wood, low light. The host picks music that makes you stay longer than planned. No loud groups, no phones at table.',
    about_occasion:'Blind boxes only tonight. Shared plates, seasonal. You don\'t choose who sits — that\'s the point. Special feature: Chef whispers the last dish.',
    boxes:[
      {time:'TONIGHT 7:30PM · CREATIVE MINDS', host:'COMEDIAN', avatars:'? AVATARS', spots:'3 SPOTS LEFT'},
      {time:'TONIGHT 7:30PM · CREATIVE MINDS', host:'COMEDIAN', avatars:'? AVATARS', spots:'3 SPOTS LEFT'}
    ]
  }
}

export default function VenueDetail({params}:{params:{id:string}}){
  const id = params.id
  const data = VENUE_DATA[id] || VENUE_DATA['kissa-tanaka']
  const [branch,setBranch]=useState('TST')

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20">
        <Link href="/venues" className="mono text-[11px] tracking-[0.1em] text-zinc-500 hover:text-zinc-300">← GO BACK</Link>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6">
          {/* Left - Images */}
          <div>
            <div className="relative h-[520px] rounded-[20px] overflow-hidden bg-zinc-900">
              <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {data.gallery.map((g:string,i:number)=>(
                <div key={i} className="h-[160px] rounded-[14px] overflow-hidden bg-zinc-900"><img src={g} alt="" className="w-full h-full object-cover" /></div>
              ))}
            </div>
            <div className="mt-12 border-t border-zinc-900 pt-8">
              <h2 className="serif text-[28px] text-white">About the scene</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <div className="mono text-[11px] tracking-[0.15em] text-white">TYPE & ATMOSPHERE</div>
                  <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">{data.about_type}</p>
                </div>
                <div>
                  <div className="mono text-[11px] tracking-[0.15em] text-white">OCCASIONS & DINING</div>
                  <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">{data.about_occasion}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right - Details */}
          <div className="bg-[#0f0f0f] border border-zinc-900 rounded-[20px] p-6 h-fit">
            <h1 className="serif text-[36px] text-white">{data.name}</h1>
            <div className="mt-2 mono text-[11px] tracking-[0.1em] text-zinc-500">{data.area} · {data.cuisine} · {data.price}</div>

            <div className="mt-8 space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <span className="mono text-[11px] text-zinc-600">BRANCH</span>
                <div className="flex gap-1.5">
                  {data.branch.map((b:string)=><button key={b} onClick={()=>setBranch(b)} className={`mono text-[11px] px-3 py-1 rounded-full border transition ${branch===b?'bg-white text-black border-white':'border-zinc-800 text-zinc-500'}`}>{b}</button>)}
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <span className="mono text-[11px] text-zinc-600">CONTACT</span>
                <span className="mono text-[11px] text-white">{data.contact}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <span className="mono text-[11px] text-zinc-600">OPENING</span>
                <span className="mono text-[11px] text-white">{data.opening}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <span className="mono text-[11px] text-zinc-600">TONIGHT</span>
                <span className="mono text-[11px] text-[#c96a4a]">{data.tonight}</span>
              </div>
            </div>

            <div className="mt-8">
              <div className="mono text-[11px] tracking-[0.1em] text-zinc-600">AVAILABLE BLIND BOXES</div>
              <div className="mt-4 space-y-3">
                {data.boxes.map((b:any,i:number)=>(
                  <div key={i} className="bg-[#111] border border-zinc-900 rounded-[14px] p-4 flex justify-between items-center">
                    <div>
                      <div className="mono text-[11px] text-white">{b.time}</div>
                      <div className="mono mt-1 text-[10px] text-zinc-600">HOST: {b.host} · {b.avatars} · {b.spots}</div>
                    </div>
                    <Link href={`/join?venue=${id}`} className="mono h-9 px-5 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.1em] flex items-center hover:bg-white">JOIN</Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link href={`/join?venue=${id}`} className="flex-1 mono h-11 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center justify-center hover:bg-white transition">JOIN BLIND BOX</Link>
              <Link href="/invite" className="mono h-11 px-5 rounded-full border border-zinc-800 text-[11px] tracking-[0.1em] flex items-center justify-center text-zinc-400 hover:border-zinc-600 transition">INVITE</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
