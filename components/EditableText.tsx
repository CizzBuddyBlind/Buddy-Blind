
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

type Props = { textKey: string; defaultValue: string; as?: any; className?: string; style?: any; children?: any }

export function EditableText({ textKey, defaultValue, as: Tag='span', className='', style={}, children }: Props){
  const { isFounder, isAdmin } = useAuth()
  const isEditMode = isFounder || isAdmin
  const [value, setValue] = useState(defaultValue)
  const [editing, setEditing] = useState(false)
  const [draftVal, setDraftVal] = useState(defaultValue)

  useEffect(()=>{ setValue(defaultValue) },[defaultValue])
  useEffect(()=>{
    try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(d.siteContent?.[textKey]) setValue(d.siteContent[textKey]) }catch{}
  },[textKey])

  const save = () => {
    setValue(draftVal)
    try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(!d.siteContent) d.siteContent={}; d.siteContent[textKey]=draftVal; localStorage.setItem('bb_draft', JSON.stringify(d)); localStorage.setItem('bb_has_unsaved','1'); window.dispatchEvent(new Event('storage')) }catch{}
    setEditing(false)
  }

  if(!isEditMode){
    return <Tag className={className} style={style}>{value}</Tag>
  }

  return (
    <>
      <Tag className={`${className} relative group cursor-pointer hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#C45A3C] hover:bg-[rgba(196,90,60,0.08)]`} style={style} data-bb-editable="true" data-bb-type="text" data-bb-key={textKey} onClick={(e:any)=>{ e.stopPropagation(); setDraftVal(value); setEditing(true)}}>{value}</Tag>
      {editing && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setEditing(false)}>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded- p-5 w-full max-w-" onClick={e=>e.stopPropagation()} data-editor-ui>
            <div className="flex justify-between"><div className="mono text- text-white font-bold">Edit Text: {textKey}</div><button onClick={()=>setEditing(false)} className="w-7 h-7 rounded-full border border-zinc-700 text-">✕</button></div>
            <textarea value={draftVal} onChange={e=>setDraftVal(e.target.value)} className="mt-4 w-full min-h- bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-[#C45A3C]" autoFocus />
            <div className="mt-4 flex gap-2"><button onClick={save} className="flex-1 h-11 rounded-full bg-white text-black text- font-bold">SAVE (Draft - instant)</button><button onClick={()=>setEditing(false)} className="flex-1 h-11 rounded-full border border-zinc-700 text- text-zinc-400">Cancel</button></div>
          </div>
        </div>
      )}
    </>
  )
}
