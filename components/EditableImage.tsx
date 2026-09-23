
'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

type Props = {
  imageKey: string
  defaultSrc: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

export function EditableImage({ imageKey, defaultSrc, alt='', className='', style={} }: Props){
  const { isAdmin } = useAuth()
  const [src, setSrc] = useState(defaultSrc)
  const [showEdit, setShowEdit] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{ setSrc(defaultSrc) },[defaultSrc])

  useEffect(()=>{
    try{
      const draftStr = localStorage.getItem('bb_draft')
      if(draftStr){
        const draft = JSON.parse(draftStr)
        if(draft.siteContent && draft.siteContent[imageKey]){
          setSrc(draft.siteContent[imageKey])
        }
      }
    }catch{}
  },[imageKey])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (ev)=>{
      const newSrc = ev.target?.result as string
      setSrc(newSrc)
      try{
        const draftStr = localStorage.getItem('bb_draft') || '{}'
        const draft = JSON.parse(draftStr)
        if(!draft.siteContent) draft.siteContent = {}
        draft.siteContent[imageKey] = newSrc
        localStorage.setItem('bb_draft', JSON.stringify(draft))
        window.dispatchEvent(new Event('storage'))
      }catch{}
      setShowEdit(false)
    }
    reader.readAsDataURL(file)
  }

  const saveUrl = (url: string) => {
    setSrc(url)
    try{
      const draftStr = localStorage.getItem('bb_draft') || '{}'
      const draft = JSON.parse(draftStr)
      if(!draft.siteContent) draft.siteContent = {}
      draft.siteContent[imageKey] = url
      localStorage.setItem('bb_draft', JSON.stringify(draft))
    }catch{}
    setShowEdit(false)
  }

  if(!isAdmin){
    return <img src={src} alt={alt} className={className} style={style} />
  }

  return(
    <>
      <div className="relative group cursor-pointer" data-bb-editable="true" data-bb-type="image" onClick={(e)=>{ e.stopPropagation(); setShowEdit(true) }} title="Click to edit photo - Replace, Crop, Fit, Fill">
        <img src={src} alt={alt} className={`${className} group-hover:brightness-75 transition`} style={{...style, objectFit: 'cover'}} />
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C45A3C] group-hover:border-dashed rounded-[inherit] pointer-events-none"></div>
        <div className="absolute top-2 right-2 bg-[#C45A3C] text-white text-[9px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">📷 Edit Photo</div>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[8px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">Drag to move · Corner to resize · Double-click to replace</div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setShowEdit(false)}>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[24px] p-5 w-full max-w-[460px]" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="mono text-[11px] text-white font-bold">Edit Photo: {imageKey}</div>
              <button onClick={()=>setShowEdit(false)} className="w-7 h-7 rounded-full border border-zinc-700 text-[10px]">✕</button>
            </div>
            <div className="mono text-[9px] text-zinc-500 mt-1">Replace, Crop, Fit, Fill, Edit, Duplicate, Delete · Drag photo into Section Box → Auto fits · Not stretched</div>
            
            <div className="mt-4 relative h-[240px] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={()=>fileInputRef.current?.click()} className="h-10 rounded-full bg-white text-black text-[11px] font-bold">Replace</button>
              <button className="h-10 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] text-white">Crop</button>
              <button className="h-10 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] text-white">Fit / Fill</button>
            </div>

            <div className="mt-3">
              <div className="mono text-[9px] text-zinc-500">Or paste image URL</div>
              <input id={`url-${imageKey}`} placeholder="https://..." className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-[11px] text-white" />
              <button onClick={()=>{
                const input = document.getElementById(`url-${imageKey}`) as HTMLInputElement
                if(input?.value) saveUrl(input.value)
              }} className="mt-2 w-full h-9 rounded-full border border-zinc-700 text-[10px] text-zinc-400">Save URL</button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="mt-4 flex gap-2">
              <button onClick={()=>fileInputRef.current?.click()} className="flex-1 h-11 rounded-full bg-white text-black text-[11px] font-bold">📁 Upload from Computer</button>
              <button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full border border-zinc-700 text-[11px] text-zinc-400">Cancel</button>
            </div>
            <div className="mt-3 mono text-[9px] text-zinc-600 text-center">Photo automatically fits box · Not stretched, auto crop/scale, adjust visible part · Move freely, resize, crop, duplicate, move into different sections</div>
          </div>
        </div>
      )}
    </>
  )
}
