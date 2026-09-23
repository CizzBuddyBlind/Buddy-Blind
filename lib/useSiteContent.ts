'use client'
import { useEffect, useState } from 'react'
export function useSiteContent(defaults: Record<string,string>){
  const [content, setContent] = useState(defaults)
  useEffect(()=>{
    try{
      const d=JSON.parse(localStorage.getItem('bb_draft')||'{}')
      if(d.siteContent) setContent(p=>({...p,...d.siteContent}))
    }catch{}
    const h=()=>{try{const d=JSON.parse(localStorage.getItem('bb_draft')||'{}');if(d.siteContent)setContent(p=>({...p,...d.siteContent}))}catch{}}
    window.addEventListener('storage',h)
    return()=>window.removeEventListener('storage',h)
  },[])
  const getText=(k:string)=>content[k]||defaults[k]||k
  const getStyle=(_k:string)=>({} as React.CSSProperties)
  const getImage=(k:string)=>content[k]||defaults[k]||''
  return {content,getText,getStyle,getImage,setContent}
}
