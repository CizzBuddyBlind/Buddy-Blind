'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
type Props = { textKey: string; defaultValue: string; as?: any; className?: string; style?: any; children?: any }
export function EditableText({ textKey, defaultValue, as='span', className='', style={}, children }: Props){
  const { isAdmin, isFounder } = useAuth()
  const isEditMode = isAdmin || isFounder
  const [value, setValue] = useState(defaultValue)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(defaultValue)
  useEffect(()=>{ setValue(defaultValue) },[defaultValue])
  useEffect(()=>{ try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(d.siteContent?.[textKey]) setValue(d.siteContent[textKey]) }catch{} },[textKey])
  const save = (nv: string) => {
    const t = nv.trim(); if(!t) return
    setValue(t)
    try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(!d.siteContent) d.siteContent={}; d.siteContent[textKey]=t; localStorage.setItem('bb_draft', JSON.stringify(d)); localStorage.setItem('bb_has_unsaved','1'); window.dispatchEvent(new Event('storage')) }catch{}
    setIsEditing(false)
  }
  const Tag = as as any
  if(!isEditMode) return <Tag className={className} style={style}>{children? children : value}</Tag>
  if(!isEditing){
    return <Tag className={`${className} cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#C45A3C] hover:bg-[#C45A3C]/10 relative group`} style={style} onClick={(e:any)=>{ e.stopPropagation(); setEditValue(value); setIsEditing(true)}} onDoubleClick={(e:any)=>{ e.stopPropagation(); setEditValue(value); setIsEditing(true)}} data-bb-editable="true" data-bb-type="text" data-bb-key={textKey} title={`Click to edit: ${textKey}`}>{children? children : value}<span className="absolute -top-2 -right-2 w-4 h-4 bg-[#C45A3C] rounded-full text- flex items-center justify-center text-white opacity-0 group-hover:opacity-100">✎</span></Tag>
  }
  return <div className="inline-block relative z-10" data-bb-editable="true"><textarea value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={()=>save(editValue)} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); save(editValue) } if(e.key==='Escape') setIsEditing(false) }} className="bg-black text-white border-2 border-[#C45A3C] rounded-xl p-3 min-w- min-h- text- focus:outline-none" autoFocus /><div className="flex gap-2 mt-2"><button onClick={()=>save(editValue)} className="px-4 py-1.5 rounded-full bg-white text-black text- font-bold">Save</button><button onClick={()=>setIsEditing(false)} className="px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text- text-white">Cancel</button></div></div>
}
