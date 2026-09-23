'use client'
import { useEffect } from 'react'
export default function EnableEdit(){
  useEffect(()=>{
    localStorage.setItem('bb_force_edit','1')
    localStorage.setItem('buddy_is_founder','1')
    localStorage.setItem('buddy_email','founder@buddyblind.com')
    setTimeout(()=>{ window.location.href='/' }, 500)
  },[])
  return <div style={{background:'black',color:'white',padding:40}}>Enabling edit mode...</div>
}
