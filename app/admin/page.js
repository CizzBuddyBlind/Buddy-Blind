'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import '../globals.css'

export default function Admin(){
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({name:'', location:'Central', photo_url:'', places_left:6})

  async function load(){ const {data}=await supabase.from('venues').select('*').order('id'); setVenues(data||[]) }
  useEffect(()=>{load()},[])

  async function add(){
    if(!form.name) return alert('打個名先，求其 Test 都得')
    const {error}=await supabase.from('venues').insert([form])
    if(error) alert('Error: '+error.message+' (多數係 Policy 未開)')
    else { setForm({name:'', location:'Central', photo_url:'', places_left:6}); load() }
  }
  async function del(id){ if(confirm('Delete?')){ await supabase.from('venues').delete().eq('id',id); load() } }
  async function edit(v){
    const name=prompt('改名', v.name); if(name===null) return
    await supabase.from('venues').update({name}).eq('id',v.id); load()
  }

  return (
    <div style={{maxWidth:700, margin:'0 auto', padding:24}}>
      <h2>Admin - 加餐廳 (求其打都得，之後改得返)</h2>
      <div style={{background:'white', padding:16, borderRadius:16, marginTop:16}}>
        <label>餐廳名 (name)</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="例如 Kissa Tanaka / Test Test 都得"/>
        <label style={{marginTop:12, display:'block'}}>地區 (location)</label><input className="input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Central / TST"/>
        <label style={{marginTop:12, display:'block'}}>相片 Link (photo_url) - 求其貼 IG link 都得，遲啲先改做上傳</label><input className="input" value={form.photo_url} onChange={e=>setForm({...form,photo_url:e.target.value})} placeholder="https://..."/>
        <label style={{marginTop:12, display:'block'}}>剩幾多位 (places_left)</label><input className="input" type="number" value={form.places_left} onChange={e=>setForm({...form,places_left:parseInt(e.target.value)||0})}/>
        <button className="btn" style={{marginTop:16, width:'100%'}} onClick={add}>+ 加餐廳</button>
      </div>

      <div style={{marginTop:24}}>
        <h3>而家有 {venues.length} 間</h3>
        {venues.map(v=>(
          <div key={v.id} style={{background:'white', padding:12, borderRadius:12, marginTop:8, display:'flex', justifyContent:'space-between'}}>
            <span>{v.id}. {v.name} - {v.location} - 剩{v.places_left}</span>
            <span><button onClick={()=>edit(v)} style={{marginRight:8}}>改名</button><button onClick={()=>del(v.id)}>Delete</button></span>
          </div>
        ))}
      </div>
      <p style={{marginTop:24}}><a href="/">← 返首頁</a></p>
    </div>
  )
}
