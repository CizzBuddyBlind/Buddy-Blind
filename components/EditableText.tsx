
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

type EditableProps = {
  textKey:string,
  defaultValue:string,
  as?:'span'|'h1'|'h2'|'h3'|'p'|'div'|'a',
  className?:string,
  style?:React.CSSProperties,
  children?:React.ReactNode
}

const ALL_FONTS = [
  {label:'Inter', value:'Inter'},
  {label:'Instrument Serif (serif)', value:'Instrument Serif'},
  {label:'Space Mono (mono)', value:'Space Mono'},
  {label:'Playfair Display', value:'Playfair Display'},
  {label:'DM Serif Display', value:'DM Serif Display'},
  {label:'JetBrains Mono', value:'JetBrains Mono'},
  {label:'IBM Plex Mono', value:'IBM Plex Mono'},
  {label:'Syne', value:'Syne'},
  {label:'Arial', value:'Arial'},
  {label:'Georgia', value:'Georgia'},
]

export function EditableText({textKey, defaultValue, as='span', className='', style={}, children}:EditableProps){
  const { isAdmin } = useAuth()
  const [value,setValue]=useState(defaultValue)
  const [showEdit,setShowEdit]=useState(false)
  const [editText,setEditText]=useState(defaultValue)
  const [editColor,setEditColor]=useState((style as any)?.color || '#ffffff')
  const [editSize,setEditSize]=useState((style as any)?.fontSize || '')
  const [editFont,setEditFont]=useState((style as any)?.fontFamily || '')
  const [editWeight,setEditWeight]=useState((style as any)?.fontWeight || '')

  useEffect(()=>{setValue(defaultValue)},[defaultValue])

  useEffect(()=>{
    // Load draft override
    try{
      const draftStr = localStorage.getItem('bb_draft')
      if(draftStr){
        const draft = JSON.parse(draftStr)
        if(draft.siteContent && draft.siteContent[textKey]){
          setValue(draft.siteContent[textKey])
        }
        if(draft.siteContent && draft.siteContent[`${textKey}_color`]){
          setEditColor(draft.siteContent[`${textKey}_color`])
        }
        if(draft.siteContent && draft.siteContent[`${textKey}_size`]){
          setEditSize(draft.siteContent[`${textKey}_size`])
        }
        if(draft.siteContent && draft.siteContent[`${textKey}_font`]){
          setEditFont(draft.siteContent[`${textKey}_font`])
        }
        if(draft.siteContent && draft.siteContent[`${textKey}_weight`]){
          setEditWeight(draft.siteContent[`${textKey}_weight`])
        }
      }
    }catch{}
  },[textKey])

  const save = async () => {
    setValue(editText)
    // Save to draft for instant preview across all pages
    try{
      const draftStr = localStorage.getItem('bb_draft') || '{}'
      const draft = JSON.parse(draftStr)
      if(!draft.siteContent) draft.siteContent = {}
      draft.siteContent[textKey] = editText
      if(editColor) draft.siteContent[`${textKey}_color`] = editColor
      if(editSize) draft.siteContent[`${textKey}_size`] = editSize
      if(editFont) draft.siteContent[`${textKey}_font`] = editFont
      if(editWeight) draft.siteContent[`${textKey}_weight`] = editWeight
      localStorage.setItem('bb_draft', JSON.stringify(draft))
      // Trigger reload in other components
      window.dispatchEvent(new Event('storage'))
    }catch{}
    setShowEdit(false)
  }

  const Tag = as as any
  const combinedStyle:React.CSSProperties = {
    ...style,
    ...(editColor && editColor!=='#ffffff' ? {color: editColor} : style?.color ? {color: style.color} : {}),
    ...(editSize ? {fontSize: editSize} : {}),
    ...(editFont ? {fontFamily: editFont} : {}),
    ...(editWeight ? {fontWeight: editWeight} : {}),
  }

  const displayValue = children ? children : value

  if(!isAdmin){
    return <Tag className={className} style={combinedStyle}>{displayValue}</Tag>
  }

  return(
    <>
      <Tag 
        className={`${className} relative group cursor-pointer hover:outline hover:outline-1 hover:outline-[#C45A3C] hover:outline-dashed hover:bg-[#C45A3C]/10`} 
        style={combinedStyle}
        onClick={(e:any)=>{e.stopPropagation(); setEditText(value); setShowEdit(true)}}
        title="Click to edit - Admin Edit Mode"
      >
        {displayValue}
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C45A3C] rounded-full text-[9px] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 shadow">✎</span>
      </Tag>

      {showEdit && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setShowEdit(false)}>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[16px] p-5 w-full max-w-[480px] max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="mono text-[11px] text-white">Edit Text: {textKey}</div>
              <div className="mono text-[9px] text-zinc-500">All pages - font, colour, size, bold/thin</div>
            </div>
            
            <div className="mt-4">
              <label className="mono text-[10px] text-zinc-400">TEXT</label>
              <textarea value={editText} onChange={e=>setEditText(e.target.value)} className="mt-1 w-full min-h-[80px] bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#C45A3C]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mono text-[9px] text-zinc-500">COLOUR - pick any</label>
                <div className="flex gap-1 mt-1">
                  <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer" />
                  <input value={editColor} onChange={e=>setEditColor(e.target.value)} placeholder="#ffffff" className="flex-1 h-10 bg-black border border-zinc-800 rounded-xl px-3 text-xs font-mono text-white" />
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {['#ffffff','#000000','#C45A3C','#c96a4a','#f5f2eb','#71717a','#FF0000','#00FF00','#0000FF','#FFD700'].map(c=>(
                    <button key={c} onClick={()=>setEditColor(c)} className="w-6 h-6 rounded-full border border-zinc-700" style={{background:c}}></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">SIZE - e.g. 14px, 24px, 2rem</label>
                <input value={editSize} onChange={e=>setEditSize(e.target.value)} placeholder="e.g. 18px" className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white" />
                <div className="mt-2 flex gap-1 flex-wrap">
                  {['12px','14px','16px','20px','24px','32px','48px','64px'].map(s=>(
                    <button key={s} onClick={()=>setEditSize(s)} className="mono text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full">{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">FONT - all fonts imported</label>
                <select value={editFont} onChange={e=>setEditFont(e.target.value)} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white">
                  <option value="">Default</option>
                  {ALL_FONTS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <div className="mt-2 mono text-[10px] p-2 rounded border border-zinc-800" style={{fontFamily: editFont || 'Inter', color: editColor, fontSize: editSize || '14px', fontWeight: editWeight || '400'}}>Preview: {editText.slice(0,20) || 'Text preview'}</div>
              </div>
              <div>
                <label className="mono text-[9px] text-zinc-500">BOLD / THIN - weight</label>
                <select value={editWeight} onChange={e=>setEditWeight(e.target.value)} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white">
                  <option value="">Default</option>
                  <option value="300">Thin 300</option>
                  <option value="400">Normal 400</option>
                  <option value="500">Medium 500</option>
                  <option value="700">Bold 700</option>
                  <option value="900">Black 900</option>
                </select>
                <div className="mt-2 flex gap-1">
                  <button onClick={()=>setEditWeight('300')} className="mono text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full">Thin</button>
                  <button onClick={()=>setEditWeight('700')} className="mono text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full">Bold</button>
                  <button onClick={()=>setEditWeight('900')} className="mono text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full">Black</button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={save} className="flex-1 h-11 rounded-full bg-white text-black mono text-[11px] font-bold hover:bg-zinc-200">SAVE (Draft - instant)</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full border border-zinc-800 mono text-[11px] text-zinc-500">CANCEL</button>
            </div>
            <div className="mt-3 mono text-[9px] text-zinc-600 text-center">Save = draft, instant on all pages. Use PUBLISH in top bar to go live.</div>
          </div>
        </div>
      )}
    </>
  )
}
