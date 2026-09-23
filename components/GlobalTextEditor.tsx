'use client'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

export function GlobalTextEditor(){
  const { isFounder, isAdmin } = useAuth()
  const isEditMode = isFounder || isAdmin
  const [editing, setEditing] = useState<{el: HTMLElement, key: string, value: string} | null>(null)

  useEffect(()=>{
    if(!isEditMode) return
    const style = document.createElement('style')
    style.innerHTML = `
      [data-bb-auto-editable] { outline: 1px dashed rgba(196,90,60,0)!important; transition: all 0.2s; cursor: pointer!important; }
      [data-bb-auto-editable]:hover { outline: 1px dashed #C45A3C!important; background: rgba(196,90,60,0.08)!important; }
    `
    document.head.appendChild(style)

    const makeEditable = () => {
      // Make ALL text elements editable, including buttons
      document.querySelectorAll('h1,h2,h3,h4,h5,p,span,button,a,div').forEach((el)=>{
        const h = el as HTMLElement
        if(h.closest('[data-editor-ui]')) return
        if(h.closest('nav')) return
        if(h.closest('[data-bb-editable]')) return // already handled by EditableText
        const txt = h.childNodes.length===1 && h.childNodes[0].nodeType===3? (h.textContent||'').trim() : ''
        // Only leaf text nodes, short enough, visible, not empty, not a wrapper
        if(txt.length>0 && txt.length<200 && h.children.length===0 && h.offsetWidth>20 && h.offsetHeight>5 && h.offsetHeight<500){
          if(!h.getAttribute('data-bb-auto-editable')){
            h.setAttribute('data-bb-auto-editable','true')
            h.setAttribute('data-bb-key', `auto_${h.tagName}_${txt.slice(0,20).replace(/\W/g,'_')}`)
            h.addEventListener('click', (e)=>{
              if(!isEditMode) return
              e.preventDefault(); e.stopPropagation()
              const key = h.getAttribute('data-bb-key')||'auto'
              setEditing({el:h, key, value: txt})
            }, {once:false})
          }
        }
      })
    }
    makeEditable()
    const obs = new MutationObserver(()=>makeEditable())
    obs.observe(document.body,{childList:true, subtree:true})
    return ()=>{ obs.disconnect(); style.remove() }
  },[isEditMode])

  const save = () => {
    if(!editing) return
    const { el, key, value } = editing
    el.textContent = value
    try{
      const d = JSON.parse(localStorage.getItem('bb_draft')||'{}')
      if(!d.siteContent) d.siteContent={}
      d.siteContent[key]=value
      localStorage.setItem('bb_draft', JSON.stringify(d))
      localStorage.setItem('bb_has_unsaved','1')
      window.dispatchEvent(new Event('storage'))
    }catch{}
    setEditing(null)
  }

  if(!isEditMode) return null
  return (
    <>
      {editing && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setEditing(null)}>
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded- p-5 w-full max-w-" onClick={e=>e.stopPropagation()} data-editor-ui>
            <div className="flex justify-between items-center">
              <div className="mono text- text-white font-bold">Edit Text: {editing.key}</div>
              <button onClick={()=>setEditing(null)} className="w-7 h-7 rounded-full border border-zinc-700 text-">✕</button>
            </div>
            <textarea value={editing.value} onChange={e=>setEditing({...editing, value: e.target.value})} className="mt-4 w-full min-h- bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-[#C45A3C]" autoFocus />
            <div className="mt-4 flex gap-2">
              <button onClick={save} className="flex-1 h-11 rounded-full bg-white text-black text- font-bold">SAVE (Draft)</button>
              <button onClick={()=>setEditing(null)} className="flex-1 h-11 rounded-full border border-zinc-700 text- text-zinc-400">Cancel</button>
            </div>
            <div className="mt-3 text- text-zinc-500">Tip: Press Cmd+K and type bb_force_edit to force edit mode if login fails. Run localStorage.setItem('bb_force_edit','1') in console.</div>
          </div>
        </div>
      )}
    </>
  )
}
