
'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

type EditableProps = {
  textKey:string,
  defaultValue:string,
  as?:'span'|'h1'|'h2'|'h3'|'p'|'div',
  className?:string,
  style?:React.CSSProperties
}

export function EditableText({textKey, defaultValue, as='span', className='', style={}}:EditableProps){
  const { isAdmin } = useAuth()
  const [value,setValue]=useState(defaultValue)
  const [showEdit,setShowEdit]=useState(false)
  const [editText,setEditText]=useState(defaultValue)
  const [editColor,setEditColor]=useState((style as any)?.color || '#ffffff')
  const [editSize,setEditSize]=useState((style as any)?.fontSize || '')
  const [editFont,setEditFont]=useState((style as any)?.fontFamily || '')
  const [editWeight,setEditWeight]=useState((style as any)?.fontWeight || '')

  const save = async () => {
    setValue(editText)
    setShowEdit(false)
    // Save to supabase site_content
    try{
      await supabase.from('site_content').upsert({key:textKey,value:editText},{onConflict:'key'})
      if(editColor) await supabase.from('site_content').upsert({key:`${textKey}_color`,value:editColor},{onConflict:'key'})
      if(editSize) await supabase.from('site_content').upsert({key:`${textKey}_size`,value:editSize},{onConflict:'key'})
      if(editFont) await supabase.from('site_content').upsert({key:`${textKey}_font`,value:editFont},{onConflict:'key'})
      if(editWeight) await supabase.from('site_content').upsert({key:`${textKey}_weight`,value:editWeight},{onConflict:'key'})
    }catch{}
  }

  const Tag = as as any
  const combinedStyle:React.CSSProperties = {
    ...style,
    ...(editColor ? {color: editColor} : {}),
    ...(editSize ? {fontSize: editSize} : {}),
    ...(editFont ? {fontFamily: editFont} : {}),
    ...(editWeight ? {fontWeight: editWeight} : {}),
  }

  if(!isAdmin){
    return <Tag className={className} style={combinedStyle}>{value}</Tag>
  }

  return(
    <>
      <Tag 
        className={`${className} relative group cursor-pointer hover:outline hover:outline-1 hover:outline-[#C45A3C] hover:outline-dashed`} 
        style={combinedStyle}
        onClick={()=>{setEditText(value); setShowEdit(true)}}
      >
        {value}
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#C45A3C] rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100">✎</span>
      </Tag>

      {showEdit && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[16px] p-5 w-full max-w-[400px]">
            <div className="mono text-[11px] text-white">Edit {textKey}</div>
            <textarea value={editText} onChange={e=>setEditText(e.target.value)} className="mt-3 w-full min-h-[80px] bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="mono text-[9px] text-zinc-500">COLOR</label>
                <div className="flex gap-1 mt-1">
                  <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} className="w-8 h-8 rounded bg-transparent" />
                  <input value={editColor} onChange={e=>setEditColor(e.target.value)} className="flex-1 h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs font-mono" />
                </div>
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">SIZE e.g. 16px</label>
                <input value={editSize} onChange={e=>setEditSize(e.target.value)} placeholder="16px" className="mt-1 w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs" />
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">FONT</label>
                <select value={editFont} onChange={e=>setEditFont(e.target.value)} className="mt-1 w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs">
                  <option value="">Default</option>
                  <option value="Inter">Inter</option>
                  <option value="Instrument Serif">Instrument Serif</option>
                  <option value="Space Mono">Space Mono</option>
                </select>
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">WEIGHT BOLD/THIN</label>
                <select value={editWeight} onChange={e=>setEditWeight(e.target.value)} className="mt-1 w-full h-8 bg-black border border-zinc-800 rounded-lg px-2 text-xs">
                  <option value="">Default</option>
                  <option value="300">Thin 300</option>
                  <option value="400">Normal 400</option>
                  <option value="700">Bold 700</option>
                  <option value="900">Black 900</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={save} className="flex-1 h-10 rounded-full bg-white text-black mono text-[11px]">SAVE</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 h-10 rounded-full border border-zinc-800 mono text-[11px] text-zinc-500">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
