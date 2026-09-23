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
          setContent(prev => ({...prev,...draft.siteContent }))
        }
      }
    }catch{}

    const onStorage = () => {
      try{
        const raw = localStorage.getItem('bb_draft')
        if(raw){
          const draft = JSON.parse(raw)
          if(draft.siteContent){
            setContent(prev => ({...prev,...draft.siteContent }))
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

  return { content, getText }
}
