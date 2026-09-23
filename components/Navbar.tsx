
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function Navbar(){
  const { isLoggedIn, isAdmin, userName, draftStatus, loginUser, loginAdmin, logout, saveDraft, publishDraft } = useAuth()
  const [showMenu,setShowMenu]=useState(false)
  const [showAdminLogin,setShowAdminLogin]=useState(false)
  const [adminPass,setAdminPass]=useState('')
  const [userNameInput,setUserNameInput]=useState('')

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

  return(
    <>
      <nav className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur border-b border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f5f2eb] text-black flex items-center justify-center mono text-xs font-bold">BB</div>
            <span className="mono text-xs tracking-[0.15em] text-white">BUDDY BLIND</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 mono text-xs tracking-[0.1em] text-zinc-500">
            <Link href="/venues" className="hover:text-white transition">VENUES</Link>
            <Link href="/private-events" className="hover:text-white transition">PRIVATE EVENTS</Link>
            <Link href="/how-it-works" className="hover:text-white transition">HOW IT WORKS</Link>
            <Link href="/premium" className="hover:text-white transition">PREMIUM</Link>
            <Link href="/profile" className="hover:text-white transition">PROFILE</Link>
          </div>
          <div className="relative">
            <button onClick={()=>setShowMenu(!showMenu)} className={`w-8 h-8 rounded-full flex items-center justify-center mono text-xs transition ${isAdmin?'bg-[#C45A3C] text-white':'bg-[#1a1a1a] text-zinc-300 border border-zinc-800'}`}>
              {isLoggedIn ? userName.slice(0,2).toUpperCase() : '??'}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-[280px] bg-[#0f0f0f] border border-zinc-800 rounded-2xl p-4 shadow-xl z-50">
                {isLoggedIn ? (
                  <>
                    <div className="mono text-xs text-white">Logged in as {userName}</div>
                    {isAdmin && <div className="mono text-xs text-[#C45A3C] mt-1">ADMIN EDIT MODE ON</div>}
                    {draftStatus && <div className="mono text-xs text-green-400 mt-1">{draftStatus}</div>}
                    <div className="mt-4 space-y-2">
                      {isAdmin ? (
                        <>
                          <button onClick={()=>{saveDraft({});}} className="w-full h-9 rounded-full bg-zinc-800 mono text-xs text-zinc-300">SAVE DRAFT (no publish)</button>
                          <button onClick={()=>publishDraft()} className="w-full h-9 rounded-full bg-[#C45A3C] mono text-xs text-white">PUBLISH - Go Live</button>
                          <button onClick={()=>{logout(); setShowMenu(false)}} className="w-full h-9 rounded-full border border-zinc-800 mono text-xs text-zinc-400">EXIT EDIT MODE & LOGOUT</button>
                        </>
                      ) : (
                        <>
                          <button onClick={()=>{setShowAdminLogin(true)}} className="w-full h-9 rounded-full bg-[#C45A3C] mono text-xs text-white">ADMIN LOGIN - EDIT MODE</button>
                          <button onClick={()=>{logout(); setShowMenu(false)}} className="w-full h-9 rounded-full border border-zinc-800 mono text-xs text-zinc-400">LOGOUT</button>
                        </>
                      )}
                      <Link href="/profile" onClick={()=>setShowMenu(false)} className="block w-full h-9 rounded-full border border-zinc-800 mono text-xs text-zinc-400 flex items-center justify-center">GO TO PROFILE</Link>
                      <Link href="/admin" onClick={()=>setShowMenu(false)} className="block w-full h-9 rounded-full border border-zinc-800 mono text-xs text-zinc-400 flex items-center justify-center">FULL CMS ADMIN</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mono text-xs text-white">Login</div>
                    <input value={userNameInput} onChange={e=>setUserNameInput(e.target.value)} placeholder="Your name e.g. CJ" className="mt-3 w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white" />
                    <button onClick={()=>{loginUser(userNameInput||'CJ'); setShowMenu(false)}} className="mt-2 w-full h-9 rounded-full bg-white text-black mono text-xs">LOGIN AS USER</button>
                    <button onClick={()=>setShowAdminLogin(true)} className="mt-2 w-full h-9 rounded-full bg-[#C45A3C] mono text-xs text-white">ADMIN LOGIN</button>
                  </>
                )}

                {showAdminLogin && (
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <div className="mono text-xs text-zinc-500">Admin password: buddyadmin2025</div>
                    <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Enter admin password" className="mt-2 w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-xs text-white" />
                    <div className="mt-2 flex gap-2">
                      <button onClick={handleAdminLogin} className="flex-1 h-8 rounded-full bg-white text-black mono text-xs">LOGIN ADMIN</button>
                      <button onClick={()=>setShowAdminLogin(false)} className="flex-1 h-8 rounded-full border border-zinc-800 mono text-xs text-zinc-500">CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {isAdmin && (
        <div className="sticky top-[64px] z-30 bg-[#C45A3C] text-white mono text-xs tracking-[0.05em] px-6 py-2.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span>ADMIN EDIT MODE - Upload photos from computer, move boxes ←→↑↓, edit text/colour/size/font, add/delete boxes.</span>
            {draftStatus && <span className="bg-black px-2 py-0.5 rounded-full text-xs">{draftStatus}</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{const draft=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(draft)}} className="bg-black text-white px-3 py-1 rounded-full text-xs border border-white/20">SAVE DRAFT</button>
            <button onClick={()=>publishDraft()} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PUBLISH</button>
            <button onClick={()=>{logout();}} className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">EXIT</button>
          </div>
        </div>
      )}
    </>
  )
}
