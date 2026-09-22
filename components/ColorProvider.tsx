
'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ColorProvider({children}:{children:React.ReactNode}){
  useEffect(()=>{
    (async()=>{
      try{
        const {data} = await supabase.from('site_content').select('*')
        if(data){
          const get = (k:string, fallback:string) => data.find((r:any)=>r.key===k)?.value || fallback
          const root = document.documentElement
          root.style.setProperty('--color-bg', get('color_bg','#080808'))
          root.style.setProperty('--color-card', get('color_card','#0f0f0f'))
          root.style.setProperty('--color-border', get('color_border','#27272a'))
          root.style.setProperty('--color-text', get('color_text','#ffffff'))
          root.style.setProperty('--color-text-secondary', get('color_text_secondary','#71717a'))
          root.style.setProperty('--color-accent-orange', get('color_accent_orange','#C45A3C'))
          root.style.setProperty('--color-accent-terracotta', get('color_accent_terracotta','#c96a4a'))
          root.style.setProperty('--color-pill-white', get('color_pill_white','#f5f2eb'))
          document.body.style.background = get('color_bg','#080808')
        }
      }catch{}
    })()
  },[])
  return <>{children}</>
}
