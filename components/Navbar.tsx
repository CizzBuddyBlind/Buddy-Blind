
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

function getInitials(name:string){
  if(!name) return '??'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if(parts.length===0) return '??'
  if(parts.length===1){
    return parts[0].slice(0,1).toUpperCase()
  }
  // For Cizz J Choi -> C + J = CJ, Alan Lee -> A + L = AL
  // Take first char of first word + first char of second word (or last if more than 2, take first and last? but user said CJ for Cizz Jun, so first two)
  // If first name Cizz, second J (middle), that's CJ - user wants that
  // So take first char of first part + first char of second part
  const first = parts[0][0] || ''
  const second = parts[1][0] || ''
  if(parts.length>=2){
    // If second part is single letter like J, still use it
    return (first + second).toUpperCase()
  }
  return first.toUpperCase()
}

export default function Navbar(){
  const { isLoggedIn, isAdmin, userName, draftStatus, loginUser, loginAdmin, logout, saveDraft, publishDraft } = useAuth()
  const [showMenu,setShowMenu]=useState(false)
  const [showAdminLogin,setShowAdminLogin]=useState(false)
  const [adminPass,setAdminPass]=useState('')
  const [userNameInput,setUserNameInput]=useState('')
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false)
  const [showPostLogout,setShowPostLogout]=useState(false)
  const [currentPlan,setCurrentPlan]=useState('free')

  useEffect(()=>{
    const plan = localStorage.getItem('bb_plan') || 'free'
    setCurrentPlan(plan)
  },[showMenu])

  const handleAdminLogin = () => {
    if(loginAdmin(adminPass)){
      setShowAdminLogin(false)
      setShowMenu(false)
      setAdminPass('')
      alert('Admin logged in - EDIT MODE ON. You can now: upload photos from computer, move boxes left/right/up/down, edit text/colour/size/font, add/delete boxes. Use SAVE DRAFT to save without publishing, PUBLISH to go live.')
    } else {
      alert('Wrong admin password. Try: buddyadmin2025')
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    setShowMenu(false)
    setShowPostLogout(true)
  }

  const handleSignInAnother = () => {
    logout()
    setShowMenu(false)
    // Go to register/auth flow
    window.location.href = '/auth?redirect=' + window.location.pathname
  }

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
          </div>
          <div className="relative">
            <button onClick={()=>setShowMenu(!showMenu)} className={'w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition hover:scale-105 ' + (isAdmin?'bg-orange-600 text-white': isLoggedIn ? 'bg-white text-black border border-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700')}>
              {initials}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 w-[320px] bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl z-50">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black text-sm">{initials}</div>
                      <div>
                        <div className="text-sm font-bold text-white">{userName}</div>
                        <div className="text-xs text-zinc-400">Logged in - {currentPlan.toUpperCase()} plan</div>
                      </div>
                    </div>
                    {isAdmin && <div className="mt-3 text-xs text-orange-500 font-bold">ADMIN EDIT MODE ON</div>}
                    {draftStatus && <div className="mt-2 text-xs text-green-400">{draftStatus}</div>}
                    <div className="mt-5 space-y-2">
                      {isAdmin ? (
                        <>
                          <button onClick={()=>{saveDraft({});}} className="w-full h-10 rounded-full bg-zinc-800 text-xs text-zinc-300 border border-zinc-700">SAVE DRAFT (no publish)</button>
                          <button onClick={()=>publishDraft()} className="w-full h-10 rounded-full bg-orange-600 text-xs text-white font-bold">PUBLISH - Go Live</button>
                          <button onClick={handleLogoutClick} className="w-full h-10 rounded-full border border-zinc-700 text-xs text-zinc-400">EXIT EDIT MODE & LOGOUT</button>
                        </>
                      ) : (
                        <>
                          <Link href="/profile" onClick={()=>setShowMenu(false)} className="block w-full h-10 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">GO TO PROFILE</Link>
                          <button onClick={handleSignInAnother} className="w-full h-10 rounded-full border border-zinc-600 text-white text-xs font-bold">SIGN IN TO ANOTHER ACCOUNT</button>
                          <button onClick={handleLogoutClick} className="w-full h-10 rounded-full border border-zinc-800 text-zinc-400 text-xs">LOGOUT</button>
                        </>
                      )}
                      <Link href="/admin" onClick={()=>setShowMenu(false)} className="block w-full h-10 rounded-full border border-zinc-800 text-xs text-zinc-500 flex items-center justify-center">FULL CMS ADMIN</Link>
                    </div>
                    <div className="mt-4 text-xs text-zinc-500 leading-relaxed">
                      Initials logic: Alan Lee = AL, Alan = A, Cizz Jun = CJ, {userName} = {initials} - Right top corner - Press initial for logout option
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-white">Browse as Guest</div>
                    <div className="mt-2 text-xs text-zinc-400 leading-relaxed">New user No register before - you can browse website - When you press Invite, Join or Subscription button, then go to register process</div>
                    <input value={userNameInput} onChange={e=>setUserNameInput(e.target.value)} placeholder="Your name e.g. Alan Lee = AL, Alan = A, Cizz Jun = CJ" className="mt-4 w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-xs text-white" />
                    <button onClick={()=>{loginUser(userNameInput||'Guest'); setShowMenu(false)}} className="mt-3 w-full h-10 rounded-full bg-white text-black text-xs font-bold">LOGIN AS USER</button>
                    <Link href="/auth" onClick={()=>setShowMenu(false)} className="mt-2 block w-full h-10 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">REGISTER / LOGIN</Link>
                    <button onClick={()=>setShowAdminLogin(true)} className="mt-2 w-full h-10 rounded-full border border-zinc-700 text-zinc-400 text-xs">ADMIN LOGIN</button>
                    <div className="mt-3 text-xs text-zinc-500">After logout, you can login again or continue browsing without logging in</div>
                  </>
                )}

                {showAdminLogin && (
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <div className="text-xs text-zinc-500">Admin password: buddyadmin2025</div>
                    <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Enter admin password" className="mt-2 w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white" />
                    <div className="mt-2 flex gap-2">
                      <button onClick={handleAdminLogin} className="flex-1 h-8 rounded-full bg-white text-black text-xs font-bold">LOGIN ADMIN</button>
                      <button onClick={()=>setShowAdminLogin(false)} className="flex-1 h-8 rounded-full border border-zinc-800 text-xs text-zinc-500">CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {isAdmin && (
        <div className="sticky top-[64px] z-30 bg-orange-600 text-white text-xs tracking-widest px-6 py-2.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span>ADMIN EDIT MODE - Upload photos from computer, move boxes, edit text/colour/size/font, add/delete boxes.</span>
            {draftStatus && <span className="bg-black px-2 py-0.5 rounded-full text-xs">{draftStatus}</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{const draft=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(draft)}} className="bg-black text-white px-3 py-1 rounded-full text-xs border border-white/20">SAVE DRAFT</button>
            <button onClick={()=>publishDraft()} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PUBLISH</button>
            <button onClick={()=>{logout();}} className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">EXIT</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-serif text-white">Logout?</h2>
              <button onClick={()=>setShowLogoutConfirm(false)} className="px-4 py-2 rounded-full border border-zinc-600 text-white text-xs font-bold">CLOSE</button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black">{initials}</div>
              <div>
                <div className="text-sm font-bold text-white">{userName} - {initials}</div>
                <div className="text-xs text-zinc-400">Alan Lee = AL, Alan = A, Cizz Jun = CJ</div>
              </div>
            </div>
            <p className="mt-6 text-sm text-zinc-300 leading-relaxed">You are about to logout - Confirm logout - After logout you can login again or browse without logging in</p>
            <div className="mt-8 flex gap-3">
              <button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-full border border-zinc-600 text-white font-bold text-xs tracking-widest">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">Confirm Logout</button>
            </div>
            <button onClick={()=>{ setShowLogoutConfirm(false); handleSignInAnother(); }} className="mt-3 w-full h-10 rounded-full border border-zinc-700 text-white text-xs">Sign in to another account</button>
          </div>
        </div>
      )}

      {showPostLogout && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-xl">👋</div>
            <h2 className="mt-4 text-xl font-black text-white">Logged out</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">You logged out - You can login again or leave it and browse website without logging in - New user can browse, when press Invite Join Subscription goes to register</p>
            <div className="mt-6 space-y-3">
              <button onClick={()=>{ setShowPostLogout(false); window.location.href='/auth'; }} className="w-full h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">LOGIN / REGISTER</button>
              <button onClick={()=>setShowPostLogout(false)} className="w-full h-12 rounded-full border border-zinc-600 text-white font-bold text-xs tracking-widest">CONTINUE BROWSING WITHOUT LOGIN</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
