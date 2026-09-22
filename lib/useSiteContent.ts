
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Style = { color?:string, fontSize?:string, fontWeight?:string, fontFamily?:string }

export function useSiteContent(defaults:Record<string,string>){
  const [texts,setTexts]=useState<Record<string,string>>(defaults)
  const [styles,setStyles]=useState<Record<string,Style>>({})

  useEffect(()=>{
    (async()=>{
      try{
        const {data} = await supabase.from('site_content').select('*')
        if(!data) return
        const t:any={...defaults}
        const s:any={}
        data.forEach((r:any)=>{
          if(r.key in defaults){
            t[r.key]=r.value
          }
          // Style keys: key_color, key_size, key_weight, key_font
          if(r.key.includes('_color') || r.key.includes('_size') || r.key.includes('_weight') || r.key.includes('_font')){
            const parts = r.key.split('_')
            const prop = parts.pop() // color,size,weight,font
            const baseKey = parts.join('_')
            if(!s[baseKey]) s[baseKey]={}
            if(prop==='color') s[baseKey].color=r.value
            if(prop==='size') s[baseKey].fontSize=r.value
            if(prop==='weight') s[baseKey].fontWeight=r.value
            if(prop==='font') s[baseKey].fontFamily=r.value
          }
          // Also support direct color keys like color_bg
          if(r.key.startsWith('color_')){
            if(!s[r.key]) s[r.key]={}
            s[r.key].color=r.value
          }
        })
        setTexts(t)
        setStyles(s)
      }catch{}
    })()
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

  return { texts, styles, getText, getStyle, allTexts: texts }
}
