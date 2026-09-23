'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
type Props = { imageKey: string; defaultSrc: string; alt?: string; className?: string; style?: any }
export function EditableImage({ imageKey, defaultSrc, alt='', className='', style={} }: Props){
  const { isAdmin, isFounder } = useAuth()
  const isEditMode = isAdmin || isFounder
  const [src, setSrc] = useState(defaultSrc)
  const [showEdit, setShowEdit] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(()=>{ setSrc(defaultSrc) },[defaultSrc])
  useEffect(()=>{ try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(d.siteContent?.[imageKey]) setSrc(d.siteContent[imageKey]) }catch{} },[imageKey])
  const saveSrc = (ns: string) => {
    setSrc(ns)
    try{ const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); if(!d.siteContent) d.siteContent={}; d.siteContent[imageKey]=ns; localStorage.setItem('bb_draft', JSON.stringify(d)); localStorage.setItem('bb_has_unsaved','1') }catch{}
    setShowEdit(false)
  }
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader(); r.onload = ev => { const ns = ev.target?.result as string; saveSrc(ns) }; r.readAsDataURL(f)
  }
  if(!isEditMode) return <img src={src} alt={alt} className={className} style={style} />
  return (<><div className="relative group cursor-pointer" data-bb-editable="true" data-bb-type="image" data-bb-key={imageKey} onClick={e=>{ e.stopPropagation(); setShowEdit(true) }}><img src={src} alt={alt} className={`${className} group-hover:brightness-75 transition`} style={{...style, objectFit: 'cover'}} /><div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C45A3C] group-hover:border-dashed rounded-[inherit] pointer-events-none"></div><div className="absolute top-2 right-2 bg-[#C45A3C] text-white text- px-2 py-1 rounded-full opacity-0 group-hover:opacity-100">📷 Edit</div></div>{showEdit && <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setShowEdit(false)}><div className="bg-[#0f0f0f] border border-zinc-800 rounded- p-5 w-full max-w-" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><div className="mono text- text-white font-bold">Edit Photo: {imageKey}</div><button onClick={()=>setShowEdit(false)} className="w-7 h-7 rounded-full border border-zinc-700 text-">✕</button></div><div className="mt-4 h- bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"><img src={src} alt="" className="w-full h-full object-cover" /></div><div className="mt-4 grid grid-cols-3 gap-2"><button onClick={()=>fileRef.current?.click()} className="h-10 rounded-full bg-white text-black text- font-bold">Replace</button><button className="h-10 rounded-full bg-zinc-800 border border-zinc-700 text- text-white">Crop</button><button onClick={()=>{ if(confirm('Delete photo?')) saveSrc('') }} className="h-10 rounded-full bg-red-900/30 border border-red-800 text- text-red-300">Delete</button></div><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} /><div className="mt-4 flex gap-2"><button onClick={()=>fileRef.current?.click()} className="flex-1 h-11 rounded-full bg-white text-black text- font-bold">📁 Upload from Computer</button><button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full border border-zinc-700 text- text-zinc-400">Cancel</button></div></div></div>}</>)
}
