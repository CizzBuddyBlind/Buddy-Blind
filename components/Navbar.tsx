'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
function getInitials(name:string){
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if(parts.length===0) return 'W'
  if(parts.length===1) return parts[0].slice(0,1).toUpperCase()
  return (parts[0][0]+parts[1][0]).toUpperCase()
}
export default function Navbar(){
  const { isLoggedIn, isAdmin, isFounder, userName, userRole, loginUser, logout, saveDraft, publishDraft } = useAuth()
  const [showMenu,setShowMenu]=useState(false)
  const [emailInput,setEmailInput]=useState('')
  const [passInput,setPassInput]=useState('')
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false)
  const [showPostLogout,setShowPostLogout]=useState(false)
  const initials = isLoggedIn ? getInitials(userName) : 'Welcome'
  const handleLogin = () => { const ok = loginUser(emailInput, emailInput, passInput); if(ok){ setShowMenu(false); setEmailInput(''); setPassInput(''); } }
  const confirmLogout = () => { logout(); setShowLogoutConfirm(false); setShowMenu(false); setShowPostLogout(true); }
  return(
    <>
      <nav className="sticky top-0 z-40 bg-black border-b border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">BB</div><span className="text-xs tracking-widest text-white">BUDDY BLIND</span></Link>
          <div className="hidden md:flex items-center gap-6 text-xs tracking-widest text-zinc-500">
            <Link href="/venues" className="hover:text-white">VENUES</Link>
            <Link href="/private-events" className="hover:text-white">PRIVATE EVENTS</Link>
            <Link href="/how-it-works" className="hover:text-white">HOW IT WORKS</Link>
            <Link href="/premium" className="hover:text-white">PREMIUM</Link>
            {isFounder && <Link href="/founder" className="text-orange-500">FOUNDER</Link>}
          </div>
          <div className="relative">
            {!isLoggedIn ? (
              <button onClick={()=>setShowMenu(!showMenu)} className="h-10 px-5 rounded-full bg-white text-black text-[11px] font-black tracking-widest hover:scale-105 transition">Welcome</button>
            ) : (
              <button onClick={()=>setShowMenu(!showMenu)} className={'w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ' + (isFounder?'bg-[#C45A3C] text-white': isAdmin?'bg-orange-600 text-white':'bg-white text-black')}>{initials.slice(0,2)}</button>
            )}
            {showMenu && (
              <div className="absolute right-0 top-12 w-[340px] bg-[#0f0f0f] border border-zinc-800 rounded-[24px] p-5 shadow-2xl z-50">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3"><div className={'w-12 h-12 rounded-full flex items-center justify-center font-black ' + (isFounder?'bg-[#C45A3C] text-white':'bg-white text-black')}>{initials.slice(0,2)}</div><div><div className="text-sm font-bold text-white">{userName} {isFounder&&<span className="text-[9px] bg-[#C45A3C] px-2 py-0.5 rounded-full">FOUNDER</span>}</div><div className="text-xs text-zinc-400">{userRole}</div></div></div>
                    <div className="mt-5 space-y-2">
                      {isFounder && <Link href="/founder" onClick={()=>setShowMenu(false)} className="block w-full h-10 rounded-full bg-[#C45A3C] text-white text-xs font-bold flex items-center justify-center">FOUNDER · ADMIN MANAGEMENT</Link>}
                      <button onClick={()=>{ logout(); setShowMenu(false); window.location.href='/auth'; }} className="w-full h-10 rounded-full border border-zinc-700 text-white text-xs font-bold">SIGN IN TO ANOTHER ACCOUNT</button>
                      <button onClick={()=>setShowLogoutConfirm(true)} className="w-full h-10 rounded-full border border-zinc-800 text-zinc-400 text-xs">LOGOUT</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-white">Welcome</div>
                    <div className="mt-2 text-[11px] text-zinc-400">Once CJ logout, icon Welcome. Tap shows Sign in, Create account. Founder same login, no separate Founder/Admin login button.</div>
                    <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="Email founder@buddyblind.com admin@buddyblind.com alanmmm@gmail.com" className="mt-4 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <input value={passInput} onChange={e=>setPassInput(e.target.value)} type="password" placeholder="Password founder2025 / buddyadmin2025" className="mt-2 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <button onClick={handleLogin} className="mt-3 w-full h-10 rounded-full bg-white text-black text-xs font-black">Sign In</button>
                    <Link href="/auth" onClick={()=>setShowMenu(false)} className="mt-2 block w-full h-10 rounded-full bg-[#C45A3C] text-white text-xs font-bold flex items-center justify-center">Create account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      {isAdmin && !isFounder && <div className="sticky top-[64px] z-30 bg-orange-600 text-white text-xs px-6 py-2 flex justify-between"><span>ADMIN EDIT MODE</span><button onClick={()=>publishDraft()} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PUBLISH</button></div>}
      {isFounder && <div className="sticky top-[64px] z-30 bg-[#C45A3C] text-white text-xs px-6 py-2 flex justify-between"><span>FOUNDER EDIT MODE - Same as admin + Admin Management - Not redirected</span><Link href="/founder" className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">ADMIN MANAGEMENT</Link></div>}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7"><div className="flex justify-between"><h2 className="font-serif text-[22px] text-white">Logout?</h2><button onClick={()=>setShowLogoutConfirm(false)} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center">✕</button></div><div className="mt-4 flex gap-3"><button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-full border border-zinc-700 text-white text-[11px]">Cancel</button><button onClick={confirmLogout} className="flex-1 h-12 rounded-full bg-white text-black text-[11px] font-black">Confirm Logout</button></div><div className="mt-3 text-[10px] text-zinc-500">After logout icon becomes Welcome</div></div></div>
      )}
      {showPostLogout && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 text-center"><div className="w-14 h-14 rounded-full bg-zinc-800 mx-auto flex items-center justify-center">👋</div><h2 className="mt-4 text-[20px] text-white">Logged out · Now Welcome</h2><p className="mt-2 text-[12px] text-zinc-500">Icon Welcome · Tap Welcome shows Sign in, Create account</p><button onClick={()=>setShowPostLogout(false)} className="mt-6 w-full h-12 rounded-full bg-white text-black text-[11px] font-black">Continue</button></div></div>
      )}
    </>
  )
}
