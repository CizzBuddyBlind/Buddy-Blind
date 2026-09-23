'use client'
import { useEffect, useState } from 'react'

export function useSiteContent(defaults: Record<string,string>){
  const [content, setContent] = useState<Record<string,string>>(defaults)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('bb_draft')
      if(raw){
        const d = JSON.parse(raw)
        if(d.siteContent) setContent(prev=>({...prev,...d.siteContent}))
      }
    }catch{}
    const h = () => {
      try{
        const raw = localStorage.getItem('bb_draft')
        if(raw){
          const d = JSON.parse(raw)
          if(d.siteContent) setContent(prev=>({...prev,...d.siteContent}))
        }
      }catch{}
    }
    window.addEventListener('storage', h)
    return ()=>window.removeEventListener('storage', h)
  },[])

  const getText = (k: string) => content[k] || defaults[k] || k

  // MUST return object, never string — fixes your build error
  const getStyle = (_k: string) => {
    return {} as React.CSSProperties
  }

  const getImage = (k: string) => content[k] || defaults[k] || ''

  return { content, getText, getStyle, getImage, setContent }
}
