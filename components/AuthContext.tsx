
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
const AuthContext = createContext<any>({})
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isFounder, setIsFounder] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(()=>{
    const check = () => {
      try{
        const raw = localStorage.getItem('buddy_user') || localStorage.getItem('buddy_founder') || localStorage.getItem('bb_user')
        const email = localStorage.getItem('buddy_email') || localStorage.getItem('founder_email')
        const isF = localStorage.getItem('buddy_is_founder')==='1' || localStorage.getItem('is_founder')==='1' || email?.includes('founder') || raw?.includes('founder@buddyblind')
        if(isF){ setIsFounder(true); setIsAdmin(true); setUser({email:'founder@buddyblind.com'}) }
        else if(raw){ setUser(JSON.parse(raw)); }
        // Also allow manual toggle for testing
        if(localStorage.getItem('bb_force_edit')==='1'){ setIsFounder(true); setIsAdmin(true) }
      }catch{}
    }
    check()
    window.addEventListener('storage', check)
    const iv = setInterval(check, 1000)
    return ()=>{ window.removeEventListener('storage', check); clearInterval(iv) }
  },[])
  return <AuthContext.Provider value={{ user, isFounder, isAdmin, isEditMode: isFounder||isAdmin }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
