
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type UserRole = 'guest' | 'user' | 'admin' | 'superadmin';
type AuthState = {
  isLoggedIn:boolean,
  isAdmin:boolean,
  userRole: UserRole,
  userName:string,
  userEmail:string,
  draftStatus:string,
  loginUser:(name:string, email?:string, password?:string)=>boolean,
  loginAdmin:(password:string)=>boolean,
  logout:()=>void,
  saveDraft:(data:any)=>void,
  publishDraft:()=>Promise<void>
}

const AuthContext = createContext<AuthState>({
  isLoggedIn:false,
  isAdmin:false,
  userRole:'guest',
  userName:'Guest',
  userEmail:'',
  draftStatus:'',
  loginUser:()=>false,
  loginAdmin:()=>false,
  logout:()=>{},
  saveDraft:()=>{},
  publishDraft:async()=>{}
})

export const useAuth = () => useContext(AuthContext)

// Admin accounts - in production these would be in database with permission field
const ADMIN_ACCOUNTS: Record<string, {password:string, role: UserRole, name:string}> = {
  'admin@buddyblind.com': { password: 'buddyadmin2025', role: 'admin', name: 'ADMIN' },
  'admin': { password: 'buddyadmin2025', role: 'admin', name: 'ADMIN' },
  'admin@buddyblind': { password: 'admin123', role: 'admin', name: 'ADMIN' },
  'cizz@buddyblind.com': { password: 'buddyadmin2025', role: 'superadmin', name: 'Cizz J Choi' },
};

export function AuthProvider({children}:{children:React.ReactNode}){
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [userRole,setUserRole]=useState<UserRole>('guest')
  const [userName,setUserName]=useState('Guest')
  const [userEmail,setUserEmail]=useState('')
  const [draftStatus,setDraftStatus]=useState('')

  useEffect(()=>{
    const saved = localStorage.getItem('bb_auth')
    if(saved){
      try{
        const p = JSON.parse(saved)
        setIsLoggedIn(p.isLoggedIn||false)
        setIsAdmin(p.isAdmin||false)
        setUserRole(p.userRole||'guest')
        setUserName(p.userName||'Guest')
        setUserEmail(p.userEmail||'')
      }catch{}
    }
    // Also check buddy_user
    const buddyUser = localStorage.getItem('buddy_user')
    if(buddyUser){
      try{
        const u = JSON.parse(buddyUser)
        if(u.firstName){
          const full = (u.firstName + ' ' + (u.lastName||'')).trim()
          if(!saved){
            setUserName(full)
            setIsLoggedIn(true)
            setUserRole('user')
          }
        }
      }catch{}
    }
  },[])

  const saveAuth = (logged:boolean, admin:boolean, role:UserRole, name:string, email:string) => {
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:logged, isAdmin:admin, userRole:role, userName:name, userEmail:email}))
  }

  const loginUser = (nameOrEmail:string, emailOrPass?:string, password?:string):boolean => {
    // Same login button for normal user and admin - auto recognition based on account credentials and permissions
    let identifier = nameOrEmail.trim()
    let pass = ''
    let email = ''

    // Determine if first param is email
    if(identifier.includes('@')){
      email = identifier
      pass = emailOrPass || ''
    } else {
      // Could be username + password in second param
      email = emailOrPass || ''
      pass = password || ''
      if(!email.includes('@') && email){
        pass = email
        email = ''
      }
    }

    // Check if admin account - automatic recognition from credentials and permissions
    const checkKey = email || identifier.toLowerCase()
    const adminAccount = ADMIN_ACCOUNTS[checkKey] || ADMIN_ACCOUNTS[checkKey.toLowerCase()] || ADMIN_ACCOUNTS[identifier.toLowerCase()]

    if(adminAccount && (adminAccount.password===pass || pass==='buddyadmin2025' || pass==='admin123')){
      // Admin Account → Admin Edit Mode - System recognises admin permission
      setIsLoggedIn(true)
      setIsAdmin(true)
      setUserRole(adminAccount.role)
      setUserName(adminAccount.name)
      setUserEmail(email || identifier)
      saveAuth(true, true, adminAccount.role, adminAccount.name, email || identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Check buddy admin password standalone - for demo allow buddyadmin2025 as admin password via same login
    if(pass==='buddyadmin2025' || pass==='BB2025' || pass==='admin123'){
      setIsLoggedIn(true)
      setIsAdmin(true)
      setUserRole('admin')
      setUserName(identifier || 'ADMIN')
      setUserEmail(email || identifier)
      saveAuth(true, true, 'admin', identifier || 'ADMIN', email || identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Normal User → Normal Website Mode
    const finalName = identifier || 'CJ'
    setIsLoggedIn(true)
    setIsAdmin(false)
    setUserRole('user')
    setUserName(finalName)
    setUserEmail(email)
    saveAuth(true,false,'user',finalName,email)
    localStorage.setItem('buddy_registered','1')
    return true
  }

  const loginAdmin = (password:string) => {
    // Legacy - kept for compatibility but new system uses same login button
    if(password==='buddyadmin2025' || password==='admin123' || password==='BB2025'){
      setIsLoggedIn(true)
      setIsAdmin(true)
      setUserRole('admin')
      setUserName('ADMIN')
      saveAuth(true,true,'admin','ADMIN','admin@buddyblind.com')
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserRole('guest')
    setUserName('Guest')
    setUserEmail('')
    localStorage.removeItem('bb_auth')
    // Admin Edit Mode immediately disappears when admin logs out
    // Website returns to normal user-facing version
  }

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
      alert('Published! Website now shows your edited version to normal users.');
    }catch(e:any){
      localStorage.setItem('bb_published', draftStr)
      setDraftStatus('PUBLISHED LOCALLY (Supabase not configured) - Website updated')
      setTimeout(()=>setDraftStatus(''),3000)
      alert('Published locally! In production, this would update Supabase live tables.')
    }
  }

  return(
    <AuthContext.Provider value={{isLoggedIn,isAdmin,userRole,userName,userEmail,draftStatus,loginUser,loginAdmin,logout,saveDraft,publishDraft}}>
      {children}
    </AuthContext.Provider>
  )
}
