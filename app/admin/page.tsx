'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
type Row = {key:string,value:string}
const ALL_KEYS=[
  ['top_stats','Top Stats Bar'],
  ['headline_1','Headline Line 1'],
  ['headline_2','Headline Line 2 italic'],
  ['headline_3','Headline Line 3 orange'],
  ['subtext_1','Subtext line 1'],
  ['subtext_2','Subtext line 2'],
  ['cta_join','CTA Join button'],
  ['cta_private','CTA Private button'],
  ['stat1_num','Stat 1 number'],
  ['stat1_label','Stat 1 label'],
  ['stat2_num','Stat 2 number'],
  ['stat2_label','Stat 2 label'],
  ['stat3_num','Stat 3 number'],
  ['stat3_label','Stat 3 label'],
  ['featured_label','Featured label'],
  ['footer_left','Footer left text'],
]
export default function Admin(){
  const [rows,setRows]=useState<Row[]>([])
  const [featured,setFeatured]=useState<any>({title:'Kissa Tanaka',area:'SOHO',time:'TONIGHT 7:30PM',spots_left:3,host_label:'HOST: COMEDIAN · GOLD',price_label:'$$ · CREATIVE MINDS',vibe_label:'SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS',invite_text:'CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS - NO PITCHES, JUST PRESENCE.',description_long:'A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.',image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'})
  const [msg,setMsg]=useState('')
  const load=async()=>{
    const {data} = await supabase.from('site_content').select('*')
    if(data) setRows(data)
    const {data:feats} = await supabase.from('featured_events').select('*').order('created_at',{ascending:false}).limit(1)
    if(feats && feats[0]) setFeatured(feats[0])
  }
  useEffect(()=>{load()},[])
  const saveText=async(key:string,value:string)=>{
    const {error}=await supabase.from('site_content').upsert({key,value},{onConflict:'key'})
    if(error) setMsg(error.message); else setMsg(`Saved ${key}`)
    load()
  }
  const saveFeatured=async()=>{
    const {data:existing} = await supabase.from('featured_events').select('id').limit(1)
    if(existing && existing[0]){
      await supabase.from('featured_events').update(featured).eq('id',existing[0].id)
    } else {
      await supabase.from('featured_events').insert(featured)
    }
    setMsg('Saved featured event')
  }
  return(<main className="min-h-screen bg-[#080808] text-white p-8 max-w-6xl mx-auto">
    <h1 className="mono text-[14px] tracking-[0.2em]">ADMIN - V9 REAL - EVERY TEXT EDITABLE</h1>
    <p className="text-zinc-500 text-[12px] mt-2">Edit any text on homepage here. Changes save to Supabase site_content table instantly. Supabase: cfihskrrbqgvgnnxergj</p>
    {msg && <div className="mt-4 bg-green-900/30 border border-green-800 text-green-300 text-[12px] p-3 rounded-xl">{msg}</div>}
    <div className="mt-10 grid gap-6">
      <div className="bg-[#111] border border-zinc-800 rounded-[20px] p-6">
        <h2 className="font-bold text-[14px] mono tracking-widest">HOMEPAGE TEXTS - Click to edit</h2>
        <div className="mt-6 grid gap-4">
          {ALL_KEYS.map(([k,label])=>{
            const existing = rows.find(r=>r.key===k)?.value || ''
            return(<div key={k} className="grid grid-cols-[200px_1fr_80px] gap-3 items-center"><div className="mono text-[10px] text-zinc-500">{label}<br/><span className="text-zinc-700">{k}</span></div><input id={k} defaultValue={existing} placeholder={k} className="bg-black border border-zinc-800 rounded-xl p-3 text-[12px]"/><button onClick={()=>{const v=(document.getElementById(k) as HTMLInputElement).value; saveText(k,v)}} className="bg-white text-black rounded-xl h-10 text-[10px] font-bold tracking-widest">SAVE</button></div>)
          })}
        </div>
      </div>
      <div className="bg-[#111] border border-zinc-800 rounded-[20px] p-6">
        <h2 className="font-bold text-[14px] mono tracking-widest">FEATURED TONIGHT CARD - Edit</h2>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.keys(featured).filter(k=>k!=='id'&&k!=='created_at').map(key=>(
            <div key={key} className="flex flex-col gap-1"><label className="mono text-[10px] text-zinc-500">{key}</label><input value={featured[key]} onChange={e=>setFeatured({...featured,[key]:key==='spots_left'?Number(e.target.value):e.target.value})} className="bg-black border border-zinc-800 rounded-xl p-3 text-[12px]"/></div>
          ))}
        </div>
        <button onClick={saveFeatured} className="mt-6 bg-[#c96a4a] text-white px-8 h-12 rounded-xl font-bold text-[11px] tracking-widest">SAVE FEATURED CARD</button>
      </div>
      <div className="bg-[#111] border border-zinc-800 rounded-[20px] p-6">
        <h2 className="font-bold text-[14px] mono">SQL TO CREATE TABLES (run once in Supabase SQL Editor)</h2>
        <pre className="mt-4 bg-black p-4 rounded-xl text-[10px] text-zinc-400 overflow-auto">{"create table if not exists site_content (key text primary key, value text);\ncreate table if not exists featured_events (id uuid primary key default gen_random_uuid(), created_at timestamp default now(), title text, area text, time text, spots_left int default 3, host_label text, price_label text, vibe_label text, invite_text text, description_long text, image_url text);"}</pre>
      </div>
    </div>
  </main>)
}