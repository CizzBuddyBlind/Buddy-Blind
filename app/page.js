'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './globals.css'

export default function Home() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('venues').select('*').order('created_at', {ascending:false})
      if (!error) setVenues(data || [])
      setLoading(false)
    }
    load()
    const ch = supabase.channel('venues-live').on('postgres_changes',{event:'*',schema:'public',table:'venues'}, (p)=> {
      load()
    }).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [])

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:'24px'}}>
      <h1 style={{fontSize:32}}>Buddy Blind 🍜</h1>
      <p>今晚唔知同邊個食，但一定好玩。香港盲盒交友飯局</p>
      <a href="/admin" style={{fontSize:12, color:'#888'}}>Admin 加餐廳入口 → /admin</a>
      
      {loading ? <p>Load 緊餐廳...</p> : venues.length===0 ? 
        <div style={{marginTop:40, padding:40, background:'white', borderRadius:20, textAlign:'center'}}>
          <p>未有餐廳，你去 /admin 加第一間，亂打 Test 都得</p>
          <p style={{fontSize:12,color:'#999'}}>如果一直空，即係你 Policy 未開，返 Supabase 開返 4 條 read/insert/update/delete for all users</p>
        </div> 
        :
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16, marginTop:24}}>
          {venues.map(v=>(
            <div key={v.id} className="card">
              <div style={{height:160, background:'#eee', backgroundImage:`url(${v.photo_url})`, backgroundSize:'cover', backgroundPosition:'center'}}></div>
              <div style={{padding:16}}>
                <div style={{fontWeight:700, fontSize:18}}>{v.name}</div>
                <div style={{color:'#666', fontSize:14, marginTop:4}}>📍 {v.location}</div>
                <div style={{marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{background:'#FFF0E0', padding:'6px 10px', borderRadius:20, fontSize:13}}>剩 {v.places_left} 位</span>
                  <button className="btn" onClick={()=>alert(`已報名 ${v.name}！(之後接付款)`)}>Join</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
