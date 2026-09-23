
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

function getInitials(name:string){
  if(!name) return '??'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if(parts.length===0) return '??'
  if(parts.length===1){ return parts[0].slice(0,1).toUpperCase() }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Navbar(){
  const { isLoggedIn, isAdmin, isFounder, userName, userRole, draftStatus, loginUser, logout, saveDraft, publishDraft } = useAuth()
  const [showMenu,setShowMenu]=useState(false)
  const [userNameInput,setUserNameInput]=useState('')
  const [emailInput,setEmailInput]=useState('')
  const [passInput,setPassInput]=useState('')
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false)
  const [showPostLogout,setShowPostLogout]=useState(false)
  const [currentPlan,setCurrentPlan]=useState('free')

  useEffect(()=>{
    setCurrentPlan(localStorage.getItem('bb_plan') || 'free')
  },[showMenu])

  const handleLogin = () => {
    const success = loginUser(userNameInput || emailInput, emailInput, passInput)
    if(success){
      setShowMenu(false)
      setUserNameInput('')
      setEmailInput('')
      setPassInput('')
    }
  }

  const handleLogoutClick = () => { setShowLogoutConfirm(true) }
  const confirmLogout = () => { logout(); setShowLogoutConfirm(false); setShowMenu(false); setShowPostLogout(true); }
  const handleSignInAnother = () => { logout(); setShowMenu(false); window.location.href='/auth'; }

  const initials = isLoggedIn ? getInitials(userName) : '??'

  return(
    <>
      <nav className="sticky top-0 z-40 bg-black border-b border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">BB</div>
            <span className="text-xs tracking-widest text-white">BUDDY BLIND</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs tracking-widest text-zinc-500">
            <Link href="/venues" className="hover:text-white transition">VENUES</Link>
            <Link href="/private-events" className="hover:text-white transition">PRIVATE EVENTS</Link>
            <Link href="/how-it-works" className="hover:text-white transition">HOW IT WORKS</Link>
            <Link href="/premium" className="hover:text-white transition">PREMIUM</Link>
            <Link href="/profile" className="hover:text-white transition">PROFILE</Link>
            {isFounder && <Link href="/founder" className="text-orange-500 hover:text-orange-400 transition">FOUNDER</Link>}
          </div>
          <div className="relative flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link href="/auth" className="hidden md:flex h-9 px-5 rounded-full bg-white text-black text-[11px] font-black tracking-[0.14em] items-center justify-center hover:scale-[1.02] transition">Sign In</Link>
                <button onClick={()=>setShowMenu(!showMenu)} className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-xs font-black">??</button>
              </>
            ) : (
              <button onClick={()=>setShowMenu(!showMenu)} className={'w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition hover:scale-105 ' + (isFounder?'bg-[#C45A3C] text-white': isAdmin?'bg-orange-600 text-white':'bg-white text-black border border-white')}>
                {initials}
              </button>
            )}
            {showMenu && (
              <div className="absolute right-0 top-12 w-[340px] bg-[#0f0f0f] border border-zinc-800 rounded-[24px] p-5 shadow-2xl z-50">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={'w-12 h-12 rounded-full flex items-center justify-center font-black text-sm ' + (isFounder?'bg-[#C45A3C] text-white': isAdmin?'bg-orange-600 text-white':'bg-white text-black')}>{initials}</div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">{userName} {isFounder && <span className="text-[9px] bg-[#C45A3C] px-2 py-0.5 rounded-full">FOUNDER</span>} {isAdmin && !isFounder && <span className="text-[9px] bg-orange-600 px-2 py-0.5 rounded-full">ADMIN</span>}</div>
                        <div className="text-xs text-zinc-400">{userRole} · {currentPlan.toUpperCase()} plan</div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <Link href="/profile" onClick={()=>setShowMenu(false)} className="block w-full h-10 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">GO TO PROFILE</Link>
                      {isFounder && <Link href="/founder" onClick={()=>setShowMenu(false)} className="block w-full h-10 rounded-full bg-[#C45A3C] text-white text-xs font-bold flex items-center justify-center">FOUNDER · ADMIN MANAGEMENT</Link>}
                      {isAdmin && <div className="w-full h-10 rounded-full bg-orange-600/20 border border-orange-600/30 text-orange-400 text-xs flex items-center justify-center">Admin Edit Mode Active</div>}
                      <button onClick={handleSignInAnother} className="w-full h-10 rounded-full border border-zinc-700 text-white text-xs font-bold">SIGN IN TO ANOTHER ACCOUNT</button>
                      <button onClick={handleLogoutClick} className="w-full h-10 rounded-full border border-zinc-800 text-zinc-400 text-xs">LOGOUT</button>
                    </div>
                    <div className="mt-4 text-[10px] text-zinc-500 leading-relaxed">Initials: Alan Lee = AL, Alan = A, Cizz Jun = CJ · {userName} = {initials} · Same login button auto recognises Founder/Admin/User</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-white">Sign In · Same button for Founder/Admin/User</div>
                    <div className="mt-2 text-[11px] text-zinc-400 leading-relaxed">Normal user, Admin, Founder all use same login. System auto recognises permission. No separate Admin Login button.</div>
                    <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="Email e.g. alanmmm@gmail.com or admin@buddyblind.com or founder@buddyblind.com" className="mt-4 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <input value={userNameInput} onChange={e=>setUserNameInput(e.target.value)} placeholder="Name (for user) or leave blank if using email" className="mt-2 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <input value={passInput} onChange={e=>setPassInput(e.target.value)} type="password" placeholder="Password · admin: buddyadmin2025, founder: founder2025" className="mt-2 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <button onClick={handleLogin} className="mt-3 w-full h-10 rounded-full bg-white text-black text-xs font-black tracking-[0.12em]">Sign In · Auto Recognise Role</button>
                    <Link href="/auth" onClick={()=>setShowMenu(false)} className="mt-2 block w-full h-10 rounded-full bg-[#C45A3C] text-white text-xs font-bold flex items-center justify-center">Create Account / Register</Link>
                    <div className="mt-3 text-[10px] text-zinc-500 leading-relaxed">Demo: Normal user any email+pass → User. Admin email admin@buddyblind.com + buddyadmin2025 → Admin Edit Mode. Founder founder@buddyblind.com + founder2025 → Founder can assign Admin. Founder is you.</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {isAdmin && !isFounder && (
        <div className="sticky top-[64px] z-30 bg-orange-600 text-white text-xs tracking-widest px-6 py-2.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3"><span>ADMIN EDIT MODE - See it → Click it → Edit it → Drag it → Preview → Publish</span></div>
          <div className="flex gap-2">
            <button onClick={()=>{const draft=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(draft)}} className="bg-black text-white px-3 py-1 rounded-full text-xs border border-white/20">SAVE DRAFT</button>
            <button onClick={()=>publishDraft()} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PUBLISH</button>
            <button onClick={()=>{logout();}} className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">EXIT</button>
          </div>
        </div>
      )}
      {isFounder && (
        <div className="sticky top-[64px] z-30 bg-[#C45A3C] text-white text-xs tracking-widest px-6 py-2.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3"><span>FOUNDER MODE - You control Founder → Can assign/remove Admin → Admin → Edit Mode → User → Normal · Founder can manage all admins</span></div>
          <div className="flex gap-2">
            <Link href="/founder" className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">ADMIN MANAGEMENT</Link>
            <button onClick={()=>{const draft=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(draft)}} className="bg-black text-white px-3 py-1 rounded-full text-xs border border-white/20">SAVE DRAFT</button>
            <button onClick={()=>publishDraft()} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PUBLISH</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 shadow-2xl">
            <div className="flex justify-between items-start"><h2 className="font-serif text-[22px] text-white">Logout?</h2><button onClick={()=>setShowLogoutConfirm(false)} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400">✕</button></div>
            <div className="mt-4 flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black">{initials}</div><div><div className="text-sm font-bold text-white">{userName}</div><div className="text-xs text-zinc-400">{userRole}</div></div></div>
            <p className="mt-5 text-[13px] text-zinc-400 leading-relaxed">Confirm logout - After logout you can login again or browse without logging in</p>
            <div className="mt-6 flex gap-3"><button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em]">Cancel</button><button onClick={confirmLogout} className="flex-1 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em]">Confirm Logout</button></div>
            <button onClick={()=>{ setShowLogoutConfirm(false); handleSignInAnother(); }} className="mt-3 w-full h-10 rounded-full border border-zinc-700 text-white text-[11px]">Sign in to another account</button>
          </div>
        </div>
      )}

      {showPostLogout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-[20px]">👋</div>
            <h2 className="mt-4 font-serif text-[20px] text-white">Logged out</h2>
            <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">You logged out - You can login again or browse without logging in</p>
            <div className="mt-6 space-y-3">
              <button onClick={()=>{ setShowPostLogout(false); window.location.href='/auth'; }} className="w-full h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em]">LOGIN / REGISTER</button>
              <button onClick={()=>setShowPostLogout(false)} className="w-full h-12 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em]">CONTINUE BROWSING WITHOUT LOGIN</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
