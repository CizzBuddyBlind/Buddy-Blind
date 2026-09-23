
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type UserRole = 'guest' | 'user' | 'admin' | 'founder';
type AuthState = {
  isLoggedIn:boolean,
  isAdmin:boolean,
  isFounder:boolean,
  userRole: UserRole,
  userName:string,
  userEmail:string,
  draftStatus:string,
  loginUser:(name:string, email?:string, password?:string)=>boolean,
  loginAdmin:(password:string)=>boolean,
  logout:()=>void,
  saveDraft:(data:any)=>void,
  publishDraft:()=>Promise<void>,
  assignAdmin:(email:string)=>{success:boolean, token?:string, message:string},
  removeAdmin:(email:string)=>{success:boolean, message:string},
  getAdmins:()=>{email:string, role:UserRole, status:string, invitedAt:string}[],
  getPendingInvites:()=>any[]
}

const AuthContext = createContext<AuthState>({
  isLoggedIn:false,
  isAdmin:false,
  isFounder:false,
  userRole:'guest',
  userName:'Guest',
  userEmail:'',
  draftStatus:'',
  loginUser:()=>false,
  loginAdmin:()=>false,
  logout:()=>{},
  saveDraft:()=>{},
  publishDraft:async()=>{},
  assignAdmin:()=>({success:false, message:''}),
  removeAdmin:()=>({success:false, message:''}),
  getAdmins:()=>[],
  getPendingInvites:()=>[]
})

export const useAuth = () => useContext(AuthContext)

const FOUNDER_ACCOUNTS: Record<string, {password:string, role: UserRole, name:string}> = {
  'founder@buddyblind.com': { password: 'founder2025', role: 'founder', name: 'Founder' },
  'cizz@buddyblind.com': { password: 'founder2025', role: 'founder', name: 'Cizz J Choi' },
  'cizz.j.choi@gmail.com': { password: 'founder2025', role: 'founder', name: 'Cizz J Choi' },
};

const ADMIN_ACCOUNTS: Record<string, {password:string, role: UserRole, name:string}> = {
  'admin@buddyblind.com': { password: 'buddyadmin2025', role: 'admin', name: 'ADMIN' },
  'admin': { password: 'buddyadmin2025', role: 'admin', name: 'ADMIN' },
};

export function AuthProvider({children}:{children:React.ReactNode}){
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [isFounder,setIsFounder]=useState(false)
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
        setIsFounder(p.isFounder||false)
        setUserRole(p.userRole||'guest')
        setUserName(p.userName||'Guest')
        setUserEmail(p.userEmail||'')
      }catch{}
    }
    const buddyUser = localStorage.getItem('buddy_user')
    if(buddyUser){
      try{
        const u = JSON.parse(buddyUser)
        if(u.firstName && !saved){
          const full = (u.firstName + ' ' + (u.lastName||'')).trim()
          setUserName(full)
          setIsLoggedIn(true)
          setUserRole('user')
        }
      }catch{}
    }
    // Load admins from storage
    if(!localStorage.getItem('bb_admins')){
      localStorage.setItem('bb_admins', JSON.stringify([
        {email:'admin@buddyblind.com', role:'admin', status:'active', invitedAt: new Date().toISOString(), name:'ADMIN'},
        {email:'founder@buddyblind.com', role:'founder', status:'active', invitedAt: new Date().toISOString(), name:'Founder'}
      ]))
    }
  },[])

  const saveAuth = (logged:boolean, admin:boolean, founder:boolean, role:UserRole, name:string, email:string) => {
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:logged, isAdmin:admin, isFounder:founder, userRole:role, userName:name, userEmail:email}))
  }

  const loginUser = (nameOrEmail:string, emailOrPass?:string, password?:string):boolean => {
    let identifier = nameOrEmail.trim()
    let pass = ''
    let email = ''
    if(identifier.includes('@')){
      email = identifier
      pass = emailOrPass || ''
    } else {
      email = emailOrPass || ''
      pass = password || ''
      if(!email.includes('@') && email){
        pass = email
        email = ''
      }
    }
    const checkKey = (email || identifier).toLowerCase()

    // Founder check - founder controlled by founder (you)
    const founderAcc = FOUNDER_ACCOUNTS[checkKey] || FOUNDER_ACCOUNTS[identifier.toLowerCase()]
    if(founderAcc && (founderAcc.password===pass || pass==='founder2025')){
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(true); setUserRole('founder'); setUserName(founderAcc.name); setUserEmail(email||identifier);
      saveAuth(true,true,true,'founder',founderAcc.name,email||identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Check stored admins (assigned by founder)
    const storedAdmins = JSON.parse(localStorage.getItem('bb_admins')||'[]')
    const storedAdmin = storedAdmins.find((a:any)=>a.email.toLowerCase()===checkKey && a.status==='active')
    if(storedAdmin){
      // For demo, if admin was assigned, allow any password or the created password
      const adminCreds = JSON.parse(localStorage.getItem('bb_admin_creds')||'{}')
      const cred = adminCreds[checkKey]
      if(!cred || cred.password===pass || pass==='buddyadmin2025' || pass==='founder2025' || pass===cred?.password){
        setIsLoggedIn(true); setIsAdmin(true); setIsFounder(storedAdmin.role==='founder'); setUserRole(storedAdmin.role); setUserName(storedAdmin.name||identifier); setUserEmail(email||identifier);
        saveAuth(true,true,storedAdmin.role==='founder',storedAdmin.role,storedAdmin.name||identifier,email||identifier)
        localStorage.setItem('buddy_registered','1')
        return true
      }
    }

    // Legacy admin accounts
    const adminAcc = ADMIN_ACCOUNTS[checkKey] || ADMIN_ACCOUNTS[identifier.toLowerCase()]
    if(adminAcc && (adminAcc.password===pass || pass==='buddyadmin2025' || pass==='admin123')){
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(false); setUserRole('admin'); setUserName(adminAcc.name); setUserEmail(email||identifier);
      saveAuth(true,true,false,'admin',adminAcc.name,email||identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Check admin creds created via activation flow
    const adminCreds = JSON.parse(localStorage.getItem('bb_admin_creds')||'{}')
    if(adminCreds[checkKey] && adminCreds[checkKey].password===pass){
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(adminCreds[checkKey].role==='founder'); setUserRole(adminCreds[checkKey].role); setUserName(adminCreds[checkKey].name); setUserEmail(email||identifier);
      saveAuth(true,true,adminCreds[checkKey].role==='founder',adminCreds[checkKey].role,adminCreds[checkKey].name,email||identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Password-only admin (same login button)
    if(pass==='buddyadmin2025' || pass==='BB2025' || pass==='admin123'){
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(false); setUserRole('admin'); setUserName(identifier||'ADMIN'); setUserEmail(email||identifier);
      saveAuth(true,true,false,'admin',identifier||'ADMIN',email||identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }
    if(pass==='founder2025'){
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(true); setUserRole('founder'); setUserName(identifier||'Founder'); setUserEmail(email||identifier);
      saveAuth(true,true,true,'founder',identifier||'Founder',email||identifier)
      localStorage.setItem('buddy_registered','1')
      return true
    }

    // Normal User
    const finalName = identifier || 'User'
    setIsLoggedIn(true); setIsAdmin(false); setIsFounder(false); setUserRole('user'); setUserName(finalName); setUserEmail(email);
    saveAuth(true,false,false,'user',finalName,email)
    localStorage.setItem('buddy_registered','1')
    return true
  }

  const loginAdmin = (password:string) => {
    if(password==='buddyadmin2025' || password==='admin123' || password==='BB2025' || password==='founder2025'){
      const isF = password==='founder2025'
      setIsLoggedIn(true); setIsAdmin(true); setIsFounder(isF); setUserRole(isF?'founder':'admin'); setUserName(isF?'Founder':'ADMIN')
      saveAuth(true,true,isF,isF?'founder':'admin',isF?'Founder':'ADMIN','admin@buddyblind.com')
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false); setIsAdmin(false); setIsFounder(false); setUserRole('guest'); setUserName('Guest'); setUserEmail(''); localStorage.removeItem('bb_auth')
  }

  const assignAdmin = (email:string) => {
    if(!isFounder){
      return {success:false, message:'Only Founder can assign Admin'}
    }
    const cleanEmail = email.trim().toLowerCase()
    if(!cleanEmail.includes('@')){
      return {success:false, message:'Invalid email'}
    }
    const token = 'admin-invite-' + Date.now() + '-' + Math.random().toString(36).substr(2,9)
    const admins = JSON.parse(localStorage.getItem('bb_admins')||'[]')
    if(admins.find((a:any)=>a.email.toLowerCase()===cleanEmail)){
      return {success:false, message:'Email already has admin access'}
    }
    // Add pending invite
    admins.push({email:cleanEmail, role:'admin', status:'pending', invitedAt: new Date().toISOString(), token, name: cleanEmail.split('@')[0]})
    localStorage.setItem('bb_admins', JSON.stringify(admins))
    const invites = JSON.parse(localStorage.getItem('bb_admin_invites')||'[]')
    invites.push({email:cleanEmail, token, createdAt: new Date().toISOString(), invitedBy: userEmail})
    localStorage.setItem('bb_admin_invites', JSON.stringify(invites))
    // In production, send email via API: /api/send-admin-invite with email, token, link
    // Mock email sending - log
    console.log('Admin Invitation Email would be sent to', cleanEmail, 'with token', token)
    return {success:true, token, message:`Admin Invitation Email sent to ${cleanEmail}. In production, email with activation link would be sent. Mock link: /admin/activate?token=${token}`}
  }

  const removeAdmin = (email:string) => {
    if(!isFounder){
      return {success:false, message:'Only Founder can remove Admin'}
    }
    const cleanEmail = email.trim().toLowerCase()
    let admins = JSON.parse(localStorage.getItem('bb_admins')||'[]')
    const before = admins.length
    admins = admins.filter((a:any)=>a.email.toLowerCase()!==cleanEmail || a.role==='founder')
    if(admins.length===before){
      return {success:false, message:'Admin not found or is Founder (cannot remove founder)'}
    }
    localStorage.setItem('bb_admins', JSON.stringify(admins))
    const creds = JSON.parse(localStorage.getItem('bb_admin_creds')||'{}')
    delete creds[cleanEmail]
    localStorage.setItem('bb_admin_creds', JSON.stringify(creds))
    return {success:true, message:`Admin authority removed from ${cleanEmail}. They can no longer access Admin Edit Mode.`}
  }

  const getAdmins = () => {
    return JSON.parse(localStorage.getItem('bb_admins')||'[]')
  }

  const getPendingInvites = () => {
    return JSON.parse(localStorage.getItem('bb_admin_invites')||'[]')
  }

  const saveDraft = (data:any) => {
    const existing = JSON.parse(localStorage.getItem('bb_draft') || '{}')
    const merged = {...existing, ...data, savedAt: new Date().toISOString()}
    localStorage.setItem('bb_draft', JSON.stringify(merged))
    localStorage.setItem('bb_draft_status', 'DRAFT SAVED - Not published yet')
    setDraftStatus('DRAFT SAVED - Website unchanged, draft saved')
    setTimeout(()=>setDraftStatus(''),3000)
    try{ supabase.from('site_content_drafts').upsert(Object.entries(merged.siteContent||{}).map(([k,v]:any)=>({key:k, value:v, draft:true})), {onConflict:'key'} as any) }catch{}
  }

  const publishDraft = async () => {
    const draftStr = localStorage.getItem('bb_draft')
    if(!draftStr){ setDraftStatus('No draft to publish'); setTimeout(()=>setDraftStatus(''),2000); return }
    const draft = JSON.parse(draftStr)
    setDraftStatus('PUBLISHING...')
    try{
      if(draft.siteContent){ for(const [k,v] of Object.entries(draft.siteContent)){ await supabase.from('site_content').upsert({key:k, value:v as string},{onConflict:'key'}) } }
      if(draft.venues){ for(const venue of draft.venues){ await supabase.from('venues').upsert(venue,{onConflict:'id'}) } }
      if(draft.privateEvents){ for(const ev of draft.privateEvents){ await supabase.from('featured_events').upsert({id:ev.id, title:ev.title, image_url:ev.image, area:ev.tag, time:'PRIVATE', spots_left:6, host_label:ev.host, price_label:ev.subtitle, vibe_label:ev.tag, invite_text:ev.attraction, description_long:ev.subtitle},{onConflict:'id'}) } }
      localStorage.setItem('bb_draft_status', 'PUBLISHED'); setDraftStatus('PUBLISHED - Website updated live!'); setTimeout(()=>setDraftStatus(''),3000); localStorage.removeItem('bb_draft'); alert('Published! Website now shows your edited version to normal users.');
    }catch(e:any){ localStorage.setItem('bb_published', draftStr); setDraftStatus('PUBLISHED LOCALLY (Supabase not configured) - Website updated'); setTimeout(()=>setDraftStatus(''),3000); alert('Published locally! In production, this would update Supabase live tables.') }
  }

  return(
    <AuthContext.Provider value={{isLoggedIn,isAdmin,isFounder,userRole,userName,userEmail,draftStatus,loginUser,loginAdmin,logout,saveDraft,publishDraft,assignAdmin,removeAdmin,getAdmins,getPendingInvites}}>
      {children}
    </AuthContext.Provider>
  )
}
