'use client'
import { useEffect, useState } from 'react'

export function useSiteContent(defaults: Record<string,string>){
  const [content, setContent] = useState<Record<string,string>>(defaults)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('bb_draft')
      if(raw){
        const draft = JSON.parse(raw)
        if(draft.siteContent){
          setContent(prev => ({...prev,...draft.siteContent}))
        }
      }
    }catch{}
    const onStorage = () => {
      try{
        const raw = localStorage.getItem('bb_draft')
        if(raw){
          const draft = JSON.parse(raw)
          if(draft.siteContent){
            setContent(prev => ({...prev,...draft.siteContent}))
          }
        }
      }catch{}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },[])

  const getText = (key: string) => {
    return content[key] || defaults[key] || key
  }

  const getStyle = (key: string) => {
    const v = content[key] || defaults[key]
    if(!v) return {} as any
    try{ return typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))? JSON.parse(v) : v }catch{ return v as any }
  }

  const getImage = (key: string) => {
    return content[key] || defaults[key] || ''
  }

  return { content, getText, getStyle, getImage, setContent }
}
