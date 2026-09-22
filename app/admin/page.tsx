
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PAGES = {
  HOME: [
    {key:'top_stats', label:'Top bar - HONG KONG · TONIGHT'},
    {key:'headline_1', label:'Headline 1 - You dont know'},
    {key:'headline_2', label:'Headline 2 - who you meet (italic serif)'},
    {key:'headline_3', label:'Headline 3 - Thats the point (orange serif)'},
    {key:'subtext_1', label:'Subtext 1'},
    {key:'subtext_2', label:'Subtext 2 - You bring curiosity'},
    {key:'cta_join', label:'CTA Join button'},
    {key:'cta_private', label:'CTA Private button'},
    {key:'stat1_num', label:'Stat 1 number - 89'},
    {key:'stat1_label', label:'Stat 1 label'},
    {key:'stat2_num', label:'Stat 2 number'},
    {key:'stat2_label', label:'Stat 2 label'},
    {key:'stat3_num', label:'Stat 3 number'},
    {key:'stat3_label', label:'Stat 3 label'},
    {key:'featured_label', label:'Featured label'},
    {key:'footer_left', label:'Footer left'},
  ],
  HOW_IT_WORKS: [
    {key:'how_label', label:'Label - HOW IT WORKS · NO META WORDING'},
    {key:'how_headline_1', label:'Headline 1 - See venue,'},
    {key:'how_headline_2', label:'Headline 2 - see vibe, join.'},
    {key:'how_step1_title', label:'Step 1 title'},
    {key:'how_step1_desc', label:'Step 1 desc'},
    {key:'how_step2_title', label:'Step 2 title'},
    {key:'how_step2_desc', label:'Step 2 desc'},
    {key:'how_step3_title', label:'Step 3 title'},
    {key:'how_step3_desc', label:'Step 3 desc'},
    {key:'how_step4_title', label:'Step 4 title'},
    {key:'how_step4_desc', label:'Step 4 desc'},
    {key:'how_step5_title', label:'Step 5 title'},
    {key:'how_step5_desc', label:'Step 5 desc'},
    {key:'how_step6_title', label:'Step 6 title'},
    {key:'how_step6_desc', label:'Step 6 desc'},
    {key:'how_step7_title', label:'Step 7 title'},
    {key:'how_step7_desc', label:'Step 7 desc'},
    {key:'how_cta_join', label:'CTA Join'},
    {key:'how_cta_private', label:'CTA Private'},
  ],
  VENUES: [
    {key:'venues_title', label:'Title - Venues — Where it happens'},
    {key:'venues_subtitle', label:'Subtitle - Six scenes tonight...'},
    {key:'venues_filter_all', label:'Filter ALL VENUES'},
    {key:'venues_filter_quick', label:'Filter QUICK MEET'},
    {key:'venues_filter_private', label:'Filter PRIVATE EVENTS'},
  ],
  PRIVATE_EVENTS: [
    {key:'private_title', label:'Title - Private Events'},
    {key:'private_subtitle', label:'Subtitle - Host creates attraction...'},
    {key:'private_bottom_title', label:'Bottom - Wine tasting...'},
    {key:'private_bottom_sub', label:'Bottom sub - NOT JUST DARK...'},
  ],
  PREMIUM: [
    {key:'premium_label', label:'Label - PREMIUM · MORE HEART'},
    {key:'premium_headline_1', label:'Headline 1 - Why Premium'},
    {key:'premium_headline_2', label:'Headline 2 - unlocks Private'},
    {key:'premium_sub', label:'Subtext'},
    {key:'free_title', label:'Free title'},{key:'free_tag', label:'Free tag'},{key:'free_price', label:'Free price'},{key:'free_f1', label:'Free f1'},{key:'free_f2', label:'Free f2'},{key:'free_f3', label:'Free f3'},{key:'free_btn', label:'Free btn'},
    {key:'lite_title', label:'Lite title'},{key:'lite_tag', label:'Lite tag'},{key:'lite_price', label:'Lite price'},{key:'lite_f1', label:'Lite f1'},{key:'lite_f2', label:'Lite f2'},{key:'lite_f3', label:'Lite f3'},{key:'lite_btn', label:'Lite btn'},
    {key:'pro_title', label:'Premium title'},{key:'pro_tag', label:'Premium tag'},{key:'pro_price', label:'Premium price'},{key:'pro_f1', label:'Pro f1'},{key:'pro_f2', label:'Pro f2'},{key:'pro_f3', label:'Pro f3'},{key:'pro_f4', label:'Pro f4'},{key:'pro_f5', label:'Pro f5'},{key:'pro_btn', label:'Pro btn'},{key:'pro_foot', label:'Pro foot'},{key:'bottom_text', label:'Bottom - NO META WORDING'},
  ],
  GLOBAL_COLORS: [
    {key:'color_bg', label:'Background #080808'},
    {key:'color_card', label:'Card bg #0f0f0f'},
    {key:'color_accent_orange', label:'Orange hover #C45A3C'},
    {key:'color_accent_terracotta', label:'Terracotta #c96a4a'},
    {key:'color_pill_white', label:'White pill #f5f2eb'},
  ]
}

const FONTS = ['Inter','Instrument Serif','Space Mono','Arial','Georgia']
const WEIGHTS = [
  {label:'Thin (300)', value:'300'},
  {label:'Normal (400)', value:'400'},
  {label:'Medium (500)', value:'500'},
  {label:'Bold (700)', value:'700'},
  {label:'Black (900)', value:'900'},
]

export default function AdminFull(){
  const [rows,setRows]=useState<any[]>([])
  const [page,setPage]=useState<keyof typeof PAGES>('HOME')
  const [search,setSearch]=useState('')

  const load=async()=>{
    const {data}=await supabase.from('site_content').select('*')
    if(data) setRows(data)
  }
  useEffect(()=>{load()},[])

  const getVal = (k:string) => rows.find(r=>r.key===k)?.value || ''
  const save = async (key:string) => {
    const el = document.getElementById(key) as HTMLInputElement
    const val = el?.value
    if(!val && val!=='') return
    await supabase.from('site_content').upsert({key,value:val},{onConflict:'key'})
    load()
  }
  const saveStyle = async (baseKey:string, prop:'color'|'size'|'weight'|'font') => {
    const id = `${baseKey}_${prop}`
    const el = document.getElementById(id) as HTMLInputElement
    const val = el?.value
    await supabase.from('site_content').upsert({key:id,value:val},{onConflict:'key'})
    load()
  }

  const filteredKeys = PAGES[page].filter(k=> !search || k.label.toLowerCase().includes(search.toLowerCase()) || k.key.toLowerCase().includes(search.toLowerCase()))

  return(
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mono text-[14px] tracking-[0.2em]">BUDDY BLIND - FULL CMS</h1>
          <p className="mono text-[11px] text-zinc-500 mt-1">Edit ALL pages, ALL texts, colour, size, font, bold/thin — live. No code.</p>
        </div>
        <div className="mono text-[10px] text-zinc-600">Total keys: {rows.length}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Object.keys(PAGES).map(p=>(
          <button key={p} onClick={()=>setPage(p as any)} className={`mono h-9 px-4 rounded-full text-[11px] border transition ${page===p?'bg-white text-black border-white':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>{p.replace('_',' ')}</button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search text..." className="mono flex-1 h-10 rounded-full bg-[#111] border border-zinc-800 px-4 text-[11px] text-white placeholder:text-zinc-600" />
        <button onClick={load} className="mono h-10 px-5 rounded-full border border-zinc-800 text-[11px]">REFRESH</button>
      </div>

      <div className="mt-6 border border-zinc-900 rounded-[16px] overflow-hidden">
        <div className="grid grid-cols-[220px_1fr_90px_90px_140px_80px_60px] gap-2 bg-[#111] p-3 mono text-[10px] tracking-[0.1em] text-zinc-500">
          <div>KEY / LABEL</div><div>TEXT</div><div>SIZE</div><div>COLOR</div><div>FONT</div><div>WEIGHT</div><div>SAVE</div>
        </div>

        {filteredKeys.map(({key,label})=>{
          const textVal = getVal(key)
          const colorVal = getVal(`${key}_color`)
          const sizeVal = getVal(`${key}_size`)
          const fontVal = getVal(`${key}_font`)
          const weightVal = getVal(`${key}_weight`)
          return(
            <div key={key} className="grid grid-cols-[220px_1fr_90px_90px_140px_80px_60px] gap-2 p-3 border-t border-zinc-900 items-start hover:bg-[#0f0f0f]">
              <div className="mono text-[10px] leading-tight">
                <div className="text-zinc-300">{label}</div>
                <div className="text-zinc-600 text-[9px] mt-1">{key}</div>
                {(colorVal || sizeVal) && (
                  <div className="mt-2 text-[10px] p-1.5 rounded border border-zinc-800" style={{color: colorVal || 'white', fontSize: sizeVal || '11px', fontWeight: weightVal || '400', fontFamily: fontVal || 'Space Mono'}}>
                    Preview
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <textarea id={key} defaultValue={textVal} className="w-full min-h-[36px] bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-zinc-600" placeholder="Text..." />
                <div className="flex gap-1">
                  <button onClick={()=>save(key)} className="mono h-7 px-3 rounded-full bg-white text-black text-[9px]">SAVE TEXT</button>
                  <span className="mono text-[9px] text-zinc-600 self-center">{textVal ? `${textVal.length} chars` : 'empty = default'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <input id={`${key}_size`} defaultValue={sizeVal} placeholder="e.g. 16px" className="w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs font-mono" />
                <button onClick={()=>saveStyle(key,'size')} className="mono h-6 rounded-full bg-zinc-800 text-[9px]">SAVE SIZE</button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <input type="color" id={`${key}_color_picker`} defaultValue={colorVal || '#ffffff'} onChange={e=>{ (document.getElementById(`${key}_color`) as HTMLInputElement).value = e.target.value }} className="w-8 h-8 rounded bg-transparent" />
                  <input id={`${key}_color`} defaultValue={colorVal} placeholder="#fff" className="flex-1 h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs font-mono" />
                </div>
                <button onClick={()=>saveStyle(key,'color')} className="mono h-6 rounded-full bg-zinc-800 text-[9px]">SAVE COLOR</button>
              </div>

              <div className="flex flex-col gap-1">
                <select id={`${key}_font`} defaultValue={fontVal} className="w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs">
                  <option value="">Default</option>
                  {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
                <button onClick={()=>saveStyle(key,'font')} className="mono h-6 rounded-full bg-zinc-800 text-[9px]">SAVE FONT</button>
              </div>

              <div className="flex flex-col gap-1">
                <select id={`${key}_weight`} defaultValue={weightVal} className="w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs">
                  <option value="">Default</option>
                  {WEIGHTS.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
                <button onClick={()=>saveStyle(key,'weight')} className="mono h-6 rounded-full bg-zinc-800 text-[9px]">SAVE B/W</button>
              </div>

              <div className="flex flex-col gap-1">
                <button onClick={async()=>{
                  const t = (document.getElementById(key) as HTMLInputElement).value
                  const c = (document.getElementById(`${key}_color`) as HTMLInputElement).value
                  const s = (document.getElementById(`${key}_size`) as HTMLInputElement).value
                  const f = (document.getElementById(`${key}_font`) as HTMLInputElement).value
                  const w = (document.getElementById(`${key}_weight`) as HTMLInputElement).value
                  if(t) await supabase.from('site_content').upsert({key,value:t},{onConflict:'key'})
                  if(c) await supabase.from('site_content').upsert({key:`${key}_color`,value:c},{onConflict:'key'})
                  if(s) await supabase.from('site_content').upsert({key:`${key}_size`,value:s},{onConflict:'key'})
                  if(f) await supabase.from('site_content').upsert({key:`${key}_font`,value:f},{onConflict:'key'})
                  if(w) await supabase.from('site_content').upsert({key:`${key}_weight`,value:w},{onConflict:'key'})
                  load()
                }} className="mono h-8 rounded-full bg-[#C45A3C] text-white text-[9px]">SAVE ALL</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-[#111] border border-zinc-800 rounded-xl mono text-[11px] text-zinc-400 leading-relaxed">
        <div className="text-white">HOW TO EDIT EVERYTHING:</div>
        <div className="mt-2">
          - TEXT: type new text → SAVE TEXT<br/>
          - COLOUR: pick colour or type hex #C45A3C → SAVE COLOR<br/>
          - SIZE: type e.g. 14px, 20px, 2rem → SAVE SIZE<br/>
          - FONT: choose Instrument Serif (serif), Space Mono (mono), Inter → SAVE FONT<br/>
          - BOLD/THIN: choose 300 thin, 400 normal, 700 bold, 900 black → SAVE B/W<br/>
          - SAVE ALL saves text+colour+size+font+weight at once.<br/>
          All pages read from Supabase site_content, so changes are live instantly after refresh.
        </div>
      </div>
    </main>
  )
}
