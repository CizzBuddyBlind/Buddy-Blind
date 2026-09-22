
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const HOME_KEYS = [
  ['top_stats','Top bar'],
  ['headline_1','Headline 1'],
  ['headline_2','Headline 2 italic'],
  ['headline_3','Headline 3 orange'],
  ['subtext_1','Subtext 1'],
  ['subtext_2','Subtext 2'],
  ['cta_join','Join button'],
  ['cta_private','Private button'],
  ['stat1_num','Stat1 num'],['stat1_label','Stat1 label'],
  ['stat2_num','Stat2 num'],['stat2_label','Stat2 label'],
  ['stat3_num','Stat3 num'],['stat3_label','Stat3 label'],
  ['featured_label','Featured label'],
  ['footer_left','Footer']
]

const HOW_KEYS = [
  ['how_label','HOW label'],
  ['how_headline_1','Headline 1 - See venue,'],
  ['how_headline_2','Headline 2 - see vibe, join.'],
  ['how_step1_num','Step1 num'],['how_step1_title','Step1 title'],['how_step1_desc','Step1 desc'],
  ['how_step2_num','Step2 num'],['how_step2_title','Step2 title'],['how_step2_desc','Step2 desc'],
  ['how_step3_num','Step3 num'],['how_step3_title','Step3 title'],['how_step3_desc','Step3 desc'],
  ['how_step4_num','Step4 num'],['how_step4_title','Step4 title'],['how_step4_desc','Step4 desc'],
  ['how_step5_num','Step5 num'],['how_step5_title','Step5 title'],['how_step5_desc','Step5 desc'],
  ['how_step6_num','Step6 num'],['how_step6_title','Step6 title'],['how_step6_desc','Step6 desc'],
  ['how_step7_num','Step7 num'],['how_step7_title','Step7 title'],['how_step7_desc','Step7 desc'],
  ['how_cta_join','CTA Join'],['how_cta_private','CTA Private']
]

export default function Admin(){
  const [rows,setRows]=useState<any[]>([])
  const [feat,setFeat]=useState<any>({title:'Kissa Tanaka',area:'SOHO',time:'TONIGHT 7:30PM',spots_left:3,host_label:'HOST: COMEDIAN · GOLD',price_label:'$$ · CREATIVE MINDS',vibe_label:'SOHO · KISSATEN',invite_text:'CJ INVITES YOU...',description_long:'A 6-seat counter...',image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'})
  const [tab,setTab]=useState<'home'|'how'|'featured'>('home')

  const load=async()=>{
    const {data}=await supabase.from('site_content').select('*')
    if(data) setRows(data)
    const {data:f}=await supabase.from('featured_events').select('*').limit(1)
    if(f&&f[0]) setFeat(f[0])
  }
  useEffect(()=>{load()},[])

  const saveText = async (key:string) => {
    const val = (document.getElementById(key) as HTMLInputElement)?.value || (document.getElementById(key) as HTMLTextAreaElement)?.value
    await supabase.from('site_content').upsert({key,value:val},{onConflict:'key'})
    load()
  }

  return(
    <main className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto">
      <h1 className="mono text-[12px] tracking-[0.2em]">ADMIN - EVERY TEXT EDITABLE</h1>
      <div className="mt-6 flex gap-2">
        <button onClick={()=>setTab('home')} className={`mono h-9 px-4 rounded-full text-[11px] border ${tab==='home'?'bg-white text-black':'border-zinc-800 text-zinc-500'}`}>HOME</button>
        <button onClick={()=>setTab('how')} className={`mono h-9 px-4 rounded-full text-[11px] border ${tab==='how'?'bg-white text-black':'border-zinc-800 text-zinc-500'}`}>HOW IT WORKS</button>
        <button onClick={()=>setTab('featured')} className={`mono h-9 px-4 rounded-full text-[11px] border ${tab==='featured'?'bg-white text-black':'border-zinc-800 text-zinc-500'}`}>FEATURED BOX</button>
      </div>

      {tab==='home' && (
        <div className="mt-8 grid gap-3">
          {HOME_KEYS.map(([k,l])=>{
            const v=rows.find(r=>r.key===k)?.value||''
            return(<div key={k} className="grid grid-cols-[200px_1fr_60px] gap-2 items-center"><span className="mono text-[10px] text-zinc-500">{l}<br/><span className="text-zinc-700 text-[9px]">{k}</span></span><input id={k} defaultValue={v} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs" /><button onClick={()=>saveText(k)} className="bg-white text-black rounded-xl h-8 text-[10px] font-bold">SAVE</button></div>)
          })}
        </div>
      )}

      {tab==='how' && (
        <div className="mt-8 grid gap-3">
          <div className="mono text-[10px] text-zinc-500">HOW IT WORKS - Every box editable. Keys prefixed with how_</div>
          {HOW_KEYS.map(([k,l])=>{
            const v=rows.find(r=>r.key===k)?.value||rows.find(r=>r.key===k.replace('how_',''))?.value||''
            return(<div key={k} className="grid grid-cols-[220px_1fr_60px] gap-2 items-center"><span className="mono text-[10px] text-zinc-500">{l}<br/><span className="text-zinc-700 text-[9px]">{k}</span></span><textarea id={k} defaultValue={v} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs min-h-[40px]" /><button onClick={()=>saveText(k)} className="bg-white text-black rounded-xl h-8 text-[10px] font-bold">SAVE</button></div>)
          })}
        </div>
      )}

      {tab==='featured' && (
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="mono text-xs">FEATURED TONIGHT CARD - Editable</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.keys(feat).filter(k=>!['id','created_at'].includes(k)).map(key=><div key={key} className="flex flex-col"><label className="mono text-[9px] text-zinc-500">{key}</label><input value={feat[key]} onChange={e=>setFeat({...feat,[key]: key==='spots_left'?Number(e.target.value):e.target.value})} className="bg-black border border-zinc-800 rounded-xl p-2 text-xs" /></div>)}
          </div>
          <button onClick={async()=>{const {data:ex}=await supabase.from('featured_events').select('id').limit(1); if(ex&&ex[0]) await supabase.from('featured_events').update(feat).eq('id',ex[0].id); else await supabase.from('featured_events').insert(feat); alert('Saved')}} className="mt-4 bg-[#c96a4a] text-white px-6 h-10 rounded-xl mono text-[10px]">SAVE FEATURED</button>
        </div>
      )}

      <pre className="mt-8 bg-black border border-zinc-900 p-4 rounded-xl text-[10px] text-zinc-600 overflow-auto">
{`-- SQL to run once:
create table if not exists site_content (key text primary key, value text);
create table if not exists featured_events (id uuid primary key default gen_random_uuid(), created_at timestamp default now(), title text, area text, time text, spots_left int, host_label text, price_label text, vibe_label text, invite_text text, description_long text, image_url text);
alter table site_content disable row level security;
alter table featured_events disable row level security;
alter table venues disable row level security;
`}
      </pre>
    </main>
  )
}
