
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Style = { color?:string, fontSize?:string, fontWeight?:string, fontFamily?:string }

export function useSiteContent(defaults:Record<string,string>){
  const [texts,setTexts]=useState<Record<string,string>>(defaults)
  const [styles,setStyles]=useState<Record<string,Style>>({})

  const load = async () => {
    try{
      // Load drafts first for admin preview
      const draftStr = localStorage.getItem('bb_draft')
      let draftContent:any = {}
      if(draftStr){
        try{ draftContent = JSON.parse(draftStr).siteContent || {} }catch{}
      }
      const {data} = await supabase.from('site_content').select('*')
      const t:any={...defaults}
      const s:any={}
      if(data){
        data.forEach((r:any)=>{
          if(r.key in defaults){
            t[r.key]=r.value
          }
          if(r.key.includes('_color') || r.key.includes('_size') || r.key.includes('_weight') || r.key.includes('_font')){
            const parts = r.key.split('_')
            const prop = parts.pop()
            const baseKey = parts.join('_')
            if(!s[baseKey]) s[baseKey]={}
            if(prop==='color') s[baseKey].color=r.value
            if(prop==='size') s[baseKey].fontSize=r.value
            if(prop==='weight') s[baseKey].fontWeight=r.value
            if(prop==='font') s[baseKey].fontFamily=r.value
          }
        })
      }
      // Override with draft if exists
      Object.entries(draftContent).forEach(([k,v]:any)=>{
        if(k in t) t[k]=v
        if(k.includes('_color') || k.includes('_size') || k.includes('_weight') || k.includes('_font')){
          const parts = k.split('_')
          const prop = parts.pop()
          const baseKey = parts.join('_')
          if(!s[baseKey]) s[baseKey]={}
          if(prop==='color') s[baseKey].color=v
          if(prop==='size') s[baseKey].fontSize=v
          if(prop==='weight') s[baseKey].fontWeight=v
          if(prop==='font') s[baseKey].fontFamily=v
        }
      })
      setTexts(t)
      setStyles(s)
    }catch{
      setTexts(defaults)
    }
  }

  useEffect(()=>{load()
    const handleStorage = () => load()
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(load, 2000) // poll for draft changes
    return ()=>{window.removeEventListener('storage', handleStorage); clearInterval(interval)}
  },[])

  const getStyle = (key:string):React.CSSProperties => {
    const st = styles[key] || {}
    const css:any={}
    if(st.color) css.color=st.color
    if(st.fontSize) css.fontSize=st.fontSize
    if(st.fontWeight) css.fontWeight=st.fontWeight
    if(st.fontFamily) css.fontFamily=st.fontFamily
    return css
  }

  const getText = (key:string) => texts[key] || defaults[key] || ''

  return { texts, styles, getText, getStyle, reload:load }
}
