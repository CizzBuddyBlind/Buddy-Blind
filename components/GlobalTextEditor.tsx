'use client'
import { useEffect } from 'react'
import { useAuth } from './AuthContext'
export function GlobalTextEditor(){
  const { isAdmin, isFounder } = useAuth()
  const isEditMode = isAdmin || isFounder
  useEffect(()=>{
    if(!isEditMode) return
    const makeEditable = () => {
      document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,div').forEach(el=>{
        const h = el as HTMLElement
        if(h.closest('[data-editor-ui]')) return
        if(h.closest('nav')) return
        if(h.closest('[data-bb-editable]')) return
        if(!h.textContent || h.textContent.trim().length===0) return
        if(h.textContent.trim().length>400) return
        if(h.children.length>3) return
        if(h.clientWidth>0 && h.clientHeight>0 && h.clientHeight<200){
          h.setAttribute('data-bb-editable','true')
          h.setAttribute('data-bb-type','text')
          h.style.cursor='pointer'
        }
      })
    }
    makeEditable()
    const obs = new MutationObserver(()=>makeEditable())
    obs.observe(document.body,{childList:true, subtree:true})
    return ()=>obs.disconnect()
  },[isEditMode])
  return null
}
