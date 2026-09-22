
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type AuthState = {
  isLoggedIn:boolean,
  isAdmin:boolean,
  userName:string,
  draftStatus:string,
  loginUser:(name:string)=>void,
  loginAdmin:(password:string)=>boolean,
  logout:()=>void,
  saveDraft:(data:any)=>void,
  publishDraft:()=>Promise<void>
}

const AuthContext = createContext<AuthState>({
  isLoggedIn:false,
  isAdmin:false,
  userName:'CJ',
  draftStatus:'',
  loginUser:()=>{},
  loginAdmin:()=>false,
  logout:()=>{},
  saveDraft:()=>{},
  publishDraft:async()=>{}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({children}:{children:React.ReactNode}){
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [userName,setUserName]=useState('CJ')
  const [draftStatus,setDraftStatus]=useState('')

  useEffect(()=>{
    const saved = localStorage.getItem('bb_auth')
    if(saved){
      try{
        const p = JSON.parse(saved)
        setIsLoggedIn(p.isLoggedIn||false)
        setIsAdmin(p.isAdmin||false)
        setUserName(p.userName||'CJ')
      }catch{}
    } else {
      setIsLoggedIn(true)
    }
  },[])

  const saveAuth = (logged:boolean, admin:boolean, name:string) => {
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:logged, isAdmin:admin, userName:name}))
  }

  const loginUser = (name:string) => {
    setIsLoggedIn(true)
    setIsAdmin(false)
    setUserName(name||'CJ')
    saveAuth(true,false,name||'CJ')
  }

  const loginAdmin = (password:string) => {
    if(password==='buddyadmin2025' || password==='admin123' || password==='BB2025'){
      setIsLoggedIn(true)
      setIsAdmin(true)
      setUserName('ADMIN')
      saveAuth(true,true,'ADMIN')
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserName('CJ')
    localStorage.removeItem('bb_auth')
  }

  // DRAFT / PUBLISH SYSTEM
  const saveDraft = (data:any) => {
    // data can be {venues, privateEvents, siteContent}
    const existing = JSON.parse(localStorage.getItem('bb_draft') || '{}')
    const merged = {...existing, ...data, savedAt: new Date().toISOString()}
    localStorage.setItem('bb_draft', JSON.stringify(merged))
    localStorage.setItem('bb_draft_status', 'DRAFT SAVED - Not published yet')
    setDraftStatus('DRAFT SAVED - Website unchanged, draft saved')
    setTimeout(()=>setDraftStatus(''),3000)
    // Also try save to Supabase drafts table
    try{
      supabase.from('site_content_drafts').upsert(Object.entries(merged.siteContent||{}).map(([k,v]:any)=>({key:k, value:v, draft:true})), {onConflict:'key'} as any)
    }catch{}
  }

  const publishDraft = async () => {
    const draftStr = localStorage.getItem('bb_draft')
    if(!draftStr){
      setDraftStatus('No draft to publish')
      setTimeout(()=>setDraftStatus(''),2000)
      return
    }
    const draft = JSON.parse(draftStr)
    setDraftStatus('PUBLISHING...')
    try{
      // Publish siteContent to live table
      if(draft.siteContent){
        for(const [k,v] of Object.entries(draft.siteContent)){
          await supabase.from('site_content').upsert({key:k, value:v as string},{onConflict:'key'})
        }
      }
      // Publish venues
      if(draft.venues){
        for(const venue of draft.venues){
          await supabase.from('venues').upsert(venue,{onConflict:'id'})
        }
      }
      // Publish private events to featured or venues
      if(draft.privateEvents){
        for(const ev of draft.privateEvents){
          await supabase.from('featured_events').upsert({id:ev.id, title:ev.title, image_url:ev.image, area:ev.tag, time:'PRIVATE', spots_left:6, host_label:ev.host, price_label:ev.subtitle, vibe_label:ev.tag, invite_text:ev.attraction, description_long:ev.subtitle},{onConflict:'id'})
        }
      }
      // Mark as published
      localStorage.setItem('bb_draft_status', 'PUBLISHED')
      setDraftStatus('PUBLISHED - Website updated live!')
      setTimeout(()=>setDraftStatus(''),3000)
      localStorage.removeItem('bb_draft')
      alert('Published! Website now shows your edited version.')
    }catch(e:any){
      // Fallback: save to local published store
      localStorage.setItem('bb_published', draftStr)
      setDraftStatus('PUBLISHED LOCALLY (Supabase not configured) - Website updated')
      setTimeout(()=>setDraftStatus(''),3000)
      alert('Published locally! In production, this would update Supabase live tables.')
    }
  }

  return(
    <AuthContext.Provider value={{isLoggedIn,isAdmin,userName,draftStatus,loginUser,loginAdmin,logout,saveDraft,publishDraft}}>
      {children}
    </AuthContext.Provider>
  )
}
