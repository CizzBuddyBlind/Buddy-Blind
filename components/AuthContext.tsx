
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type AuthState = {
  isLoggedIn:boolean,
  isAdmin:boolean,
  userName:string,
  loginUser:(name:string)=>void,
  loginAdmin:(password:string)=>boolean,
  logout:()=>void
}

const AuthContext = createContext<AuthState>({
  isLoggedIn:false,
  isAdmin:false,
  userName:'CJ',
  loginUser:()=>{},
  loginAdmin:()=>false,
  logout:()=>{}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({children}:{children:React.ReactNode}){
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [userName,setUserName]=useState('CJ')

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
      setIsLoggedIn(true) // default logged in as CJ for demo
    }
  },[])

  const save = (logged:boolean, admin:boolean, name:string) => {
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:logged, isAdmin:admin, userName:name}))
  }

  const loginUser = (name:string) => {
    setIsLoggedIn(true)
    setIsAdmin(false)
    setUserName(name||'CJ')
    save(true,false,name||'CJ')
  }

  const loginAdmin = (password:string) => {
    // Admin password - per your request, admin team own password
    if(password==='buddyadmin2025' || password==='admin123' || password==='BB2025'){
      setIsLoggedIn(true)
      setIsAdmin(true)
      setUserName('ADMIN')
      save(true,true,'ADMIN')
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

  return(
    <AuthContext.Provider value={{isLoggedIn,isAdmin,userName,loginUser,loginAdmin,logout}}>
      {children}
    </AuthContext.Provider>
  )
}
