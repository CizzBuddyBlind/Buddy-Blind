
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
      // New user No register before - can browse website without login
      // Do not auto login - let them browse as guest
      setIsLoggedIn(false)
    }
    // Also check buddy_user for full name
    const buddyUser = localStorage.getItem('buddy_user')
    if(buddyUser){
      try{
        const u = JSON.parse(buddyUser)
        if(u.firstName){
          const full = (u.firstName + ' ' + (u.lastName||'')).trim()
          setUserName(full)
          setIsLoggedIn(true)
        }
      }catch{}
    }
    const registered = localStorage.getItem('buddy_registered')
    if(registered==='1'){
      const saved2 = localStorage.getItem('bb_auth')
      if(!saved2){
        // If registered but no auth, keep logged in
        setIsLoggedIn(true)
      }
    }
  },[])

  const saveAuth = (logged:boolean, admin:boolean, name:string) => {
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:logged, isAdmin:admin, userName:name}))
  }

  const loginUser = (name:string) => {
    const finalName = name||'CJ'
    setIsLoggedIn(true)
    setIsAdmin(false)
    setUserName(finalName)
    saveAuth(true,false,finalName)
    localStorage.setItem('buddy_registered','1')
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
    // Keep userName for initials display? No, reset to CJ for demo
    // But keep buddy_user for re-login? Clear auth only, keep user data for browsing
    localStorage.removeItem('bb_auth')
    // Do not remove buddy_registered and buddy_user - so they can login again or browse
    // New logic: after logout, they can browse without login
  }

  // DRAFT / PUBLISH SYSTEM
  const saveDraft = (data:any) => {
    const existing = JSON.parse(localStorage.getItem('bb_draft') || '{}')
    const merged = {...existing, ...data, savedAt: new Date().toISOString()}
    localStorage.setItem('bb_draft', JSON.stringify(merged))
    localStorage.setItem('bb_draft_status', 'DRAFT SAVED - Not published yet')
    setDraftStatus('DRAFT SAVED - Website unchanged, draft saved')
    setTimeout(()=>setDraftStatus(''),3000)
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
      if(draft.siteContent){
        for(const [k,v] of Object.entries(draft.siteContent)){
          await supabase.from('site_content').upsert({key:k, value:v as string},{onConflict:'key'})
        }
      }
      if(draft.venues){
        for(const venue of draft.venues){
          await supabase.from('venues').upsert(venue,{onConflict:'id'})
        }
      }
      if(draft.privateEvents){
        for(const ev of draft.privateEvents){
          await supabase.from('featured_events').upsert({id:ev.id, title:ev.title, image_url:ev.image, area:ev.tag, time:'PRIVATE', spots_left:6, host_label:ev.host, price_label:ev.subtitle, vibe_label:ev.tag, invite_text:ev.attraction, description_long:ev.subtitle},{onConflict:'id'})
        }
      }
      localStorage.setItem('bb_draft_status', 'PUBLISHED')
      setDraftStatus('PUBLISHED - Website updated live!')
      setTimeout(()=>setDraftStatus(''),3000)
      localStorage.removeItem('bb_draft')
      alert('Published! Website now shows your edited version.')
    }catch(e:any){
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
