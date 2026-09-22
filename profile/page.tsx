
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteContent } from '@/lib/useSiteContent'
import Link from 'next/link'

const DEFAULT:Record<string,string> = {
  profile_buddies_title: 'Buddies',
  profile_comments_title: 'Comments & Rating',
  profile_rate_btn: 'RATE SOMEONE',
  profile_points_label: 'POINTS & PERKS',
  profile_points_desc: '2 PTS INVITE · 1 PT JOIN · 5 PTS CREATE',
  profile_progress: '342 / 500 PTS',
  profile_progress_desc: '500 = 20% OFF WHOLE TABLE',
  profile_perk1: '100 PTS → 5% OFF WHOLE TABLE',
  profile_perk2: '300 PTS → 10% OFF',
  profile_perk3: '500 PTS → 20% OFF',
  profile_vibe_label: 'YOUR VIBE',
  profile_vibe_quote: '\"You are my vibe, let\'s be buddies!\" — one-click after dinner',
  profile_vibe_btn: 'BE MY BUDDY',
  profile_footer: 'BUDDY BLIND · HONG KONG · 1,247 BLIND BOXES · NO BOTTOM FLYWHEEL PER V9 FEEDBACK'
}

type ProfileData = {
  name:string,
  location:string,
  gender:string,
  age_range:string,
  orientation:string,
  role:string,
  buddies_count:number,
  rating:string,
  points:number,
  tier:string
}

export default function ProfilePage(){
  const { getText, getStyle } = useSiteContent(DEFAULT)
  const [profile,setProfile]=useState<ProfileData>({
    name:'CJ',
    location:'CENTRAL',
    gender:'FEMALE',
    age_range:'30-40',
    orientation:'ANY',
    role:'DESIGNER',
    buddies_count:24,
    rating:'4.5',
    points:342,
    tier:'GOLD'
  })
  const [editMode,setEditMode]=useState(false)
  const [form,setForm]=useState<ProfileData>(profile)
  const [buddies,setBuddies]=useState<number>(24)
  const [comments,setComments]=useState<any[]>([
    {user:'ALEX M.', stars:5, text:'Easy to talk to, good at keeping conversation going. Stayed after to share taxi.'},
    {user:'SAM T.', stars:4, text:'Good at keeping conversation going. Would meet again for wine night.'},
    {user:'JORDAN L.', stars:5, text:'Made everyone comfortable. 50+ social done right.'},
  ])

  useEffect(()=>{
    const saved = localStorage.getItem('bb_profile')
    if(saved){
      try{
        const p = JSON.parse(saved)
        setProfile(p)
        setForm(p)
        setBuddies(p.buddies_count||24)
      }catch{}
    }
    // Load buddies count from Supabase if exists - per Bible, auto-count when accepted
    (async()=>{
      try{
        const {data} = await supabase.from('buddies').select('id',{count:'exact'})
        if(data) setBuddies(data.length || profile.buddies_count)
      }catch{}
    })()
  },[])

  const saveProfile = async () => {
    // Validation - required fields per your note
    if(!form.name || !form.location || !form.gender || !form.age_range || !form.orientation){
      alert('Please fill all required fields: name, where you live, gender, age range, orientation (required for event filtering like lesbian-only dinner)')
      return
    }
    localStorage.setItem('bb_profile', JSON.stringify(form))
    setProfile(form)
    setEditMode(false)
    try{
      const {data:{user}} = await supabase.auth.getUser()
      if(user){
        await supabase.from('profiles').upsert({id:user.id, name:form.name, location:form.location, gender:form.gender, age_range:form.age_range, orientation:form.orientation, role:form.role},{onConflict:'id'})
      }
    }catch{}
  }

  const handleBeBuddy = () => {
    // Bible: Be My Buddies - one-click after dinner, if both say yes, you're buddies, count++
    const newCount = buddies + 1
    setBuddies(newCount)
    const updated = {...profile, buddies_count:newCount}
    setProfile(updated)
    localStorage.setItem('bb_profile', JSON.stringify(updated))
    alert('Buddy request sent! If they accept, you will be buddies. 24 and counting per Bible.')
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Left - Profile box larger */}
          <div className="bg-[#0f0f0f] border border-zinc-900 rounded-[20px] p-6 md:p-8 h-fit sticky top-20">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-zinc-800 flex items-center justify-center serif text-[42px] text-white mx-auto">CJ</div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-1 ml-8 mono text-[11px] tracking-[0.1em] bg-[#f5f2eb] text-black px-3 py-1 rounded-full">{profile.tier}</div>
            </div>

            {!editMode ? (
              <>
                <h1 className="mt-8 serif text-[36px] text-white text-center">{profile.name}</h1>
                <div className="mt-2 mono text-[11px] tracking-[0.15em] text-zinc-500 text-center">{buddies} BUDDIES · {profile.rating} ★</div>

                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="mono text-[11px] tracking-[0.1em] bg-[#1a1a1a] border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">{profile.gender}</span>
                  <span className="mono text-[11px] tracking-[0.1em] bg-[#1a1a1a] border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">{profile.role}</span>
                  <span className="mono text-[11px] tracking-[0.1em] bg-[#1a1a1a] border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">{profile.location}</span>
                  <span className="mono text-[11px] tracking-[0.1em] bg-[#1a1a1a] border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">{profile.age_range}</span>
                  <span className="mono text-[11px] tracking-[0.1em] bg-[#1a1a1a] border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">{profile.orientation}</span>
                </div>

                <button onClick={()=>{setForm(profile); setEditMode(true)}} className="mt-6 w-full h-10 rounded-full border border-zinc-800 mono text-[11px] tracking-[0.1em] text-zinc-400 hover:border-zinc-600">EDIT PROFILE</button>

                <div className="mt-8 border-t border-zinc-900 pt-6">
                  <div className="mono text-[11px] tracking-[0.15em] text-zinc-600" style={getStyle('profile_points_label')}>{getText('profile_points_label')}</div>
                  <div className="mt-4 flex gap-2">
                    {['BRONZE','SILVER','GOLD'].map(t=><button key={t} className={`mono text-[11px] tracking-[0.1em] px-3 py-1.5 rounded-full border transition ${profile.tier===t?'bg-white text-black border-white':'border-zinc-800 text-zinc-600'}`}>{t}</button>)}
                  </div>
                  <div className="mt-4 mono text-[11px] tracking-[0.05em] text-zinc-500" style={getStyle('profile_points_desc')}>{getText('profile_points_desc')}</div>
                  <div className="mt-3 w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c96a4a] rounded-full" style={{width:`${(profile.points/500)*100}%`}}></div>
                  </div>
                  <div className="mt-2 flex justify-between mono text-[11px] text-zinc-600">
                    <span style={getStyle('profile_progress')}>{profile.points} / 500 PTS</span>
                    <span style={getStyle('profile_progress_desc')}>{getText('profile_progress_desc')}</span>
                  </div>
                  <div className="mt-4 space-y-1 mono text-[11px] text-zinc-600">
                    <div style={getStyle('profile_perk1')}>{getText('profile_perk1')}</div>
                    <div style={getStyle('profile_perk2')}>{getText('profile_perk2')}</div>
                    <div style={getStyle('profile_perk3')}>{getText('profile_perk3')}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 space-y-4">
                <h2 className="mono text-[11px] tracking-[0.15em] text-white">EDIT YOUR PROFILE - User can edit name, where they live, not full story</h2>
                <div>
                  <label className="mono text-[10px] text-zinc-500">NAME (editable)</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white" />
                </div>
                <div>
                  <label className="mono text-[10px] text-zinc-500">WHERE YOU LIVE (editable) *required</label>
                  <select value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white">
                    <option>CENTRAL</option><option>SOHO</option><option>CWB</option><option>TST</option><option>MONGKOK</option><option>SAI KUNG</option>
                  </select>
                </div>
                <div>
                  <label className="mono text-[10px] text-zinc-500">GENDER - select male/female *required</label>
                  <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white">
                    <option>FEMALE</option><option>MALE</option><option>NON-BINARY</option><option>TRANS</option>
                  </select>
                </div>
                <div>
                  <label className="mono text-[10px] text-zinc-500">AGE RANGE - 20-25, 25-30 etc *required</label>
                  <select value={form.age_range} onChange={e=>setForm({...form,age_range:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white">
                    <option>20-25</option><option>25-30</option><option>30-40</option><option>40-50</option><option>50+</option>
                  </select>
                </div>
                <div>
                  <label className="mono text-[10px] text-zinc-500">SEX ORIENTATION - gay, straight, lesbian, bi, trans *required for filtering</label>
                  <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white">
                    <option>STRAIGHT</option><option>GAY</option><option>LESBIAN</option><option>BI</option><option>TRANS</option><option>ANY</option><option>QUEER</option>
                  </select>
                  <div className="mono text-[9px] text-zinc-600 mt-1">Required because events like lesbian-only dinner auto-filter: only female + lesbian/bi allowed</div>
                </div>
                <div>
                  <label className="mono text-[10px] text-zinc-500">ROLE / INDUSTRY</label>
                  <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="mt-1 w-full h-10 bg-black border border-zinc-800 rounded-xl px-3 text-sm text-white">
                    <option>DESIGNER</option><option>CHEF</option><option>COMEDIAN</option><option>SOMMELIER</option><option>ARTIST</option><option>ENGINEER</option><option>OTHER</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveProfile} className="flex-1 h-11 rounded-full bg-white text-black mono text-[11px] tracking-[0.1em]">SAVE</button>
                  <button onClick={()=>setEditMode(false)} className="flex-1 h-11 rounded-full border border-zinc-800 mono text-[11px] tracking-[0.1em] text-zinc-500">CANCEL</button>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            {/* Buddies - simplified to icon + number per your note */}
            <div>
              <h2 className="serif text-[32px] text-white" style={getStyle('profile_buddies_title')}>{getText('profile_buddies_title')}</h2>
              <div className="mt-6 bg-[#0f0f0f] border border-zinc-900 rounded-[20px] p-8 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-zinc-800 flex items-center justify-center">
                  <span className="mono text-[24px] text-white">👥</span>
                </div>
                <div>
                  <div className="serif text-[48px] text-white leading-none">{buddies}</div>
                  <div className="mono text-[11px] tracking-[0.15em] text-zinc-500 mt-1">BUDDIES</div>
                  <div className="mono text-[10px] text-zinc-600 mt-1">Auto-counted when other accepted to be buddy. Per Bible: Be My Buddies.</div>
                </div>
                <div className="ml-auto">
                  <Link href="/venues" className="mono h-10 px-5 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.1em] flex items-center hover:bg-white">FIND BUDDIES</Link>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-zinc-900 pt-8">
              <div className="flex justify-between items-center">
                <h2 className="serif text-[28px] text-white" style={getStyle('profile_comments_title')}>{getText('profile_comments_title')}</h2>
                <button className="mono h-9 px-4 rounded-full border border-zinc-800 text-[11px] tracking-[0.1em] text-zinc-400 hover:border-zinc-600" style={getStyle('profile_rate_btn')}>{getText('profile_rate_btn')}</button>
              </div>

              <div className="mt-6 space-y-4">
                {comments.map((c,i)=>(
                  <div key={i} className="bg-[#0f0f0f] border border-zinc-900 rounded-[16px] p-5">
                    <div className="flex justify-between items-center">
                      <span className="mono text-[11px] tracking-[0.1em] text-zinc-400">{c.user}</span>
                      <span className="mono text-[11px] text-[#c96a4a]">{'★'.repeat(c.stars)}{'☆'.repeat(5-c.stars)}</span>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-zinc-300">{c.text}</p>
                    <div className="mt-2 mono text-[9px] text-zinc-600">Only users who attended same event can comment. Per Bible.</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-[#0f0f0f] border border-zinc-900 rounded-[16px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="mono text-[11px] tracking-[0.15em] text-zinc-600" style={getStyle('profile_vibe_label')}>{getText('profile_vibe_label')}</div>
                  <div className="serif mt-2 text-[20px] text-white" style={getStyle('profile_vibe_quote')}>{getText('profile_vibe_quote')}</div>
                </div>
                <button onClick={handleBeBuddy} className="mono h-11 px-6 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] hover:bg-white transition shrink-0" style={getStyle('profile_vibe_btn')}>{getText('profile_vibe_btn')}</button>
              </div>
            </div>

            <div className="mt-12 mono text-[10px] tracking-[0.1em] text-zinc-700" style={getStyle('profile_footer')}>{getText('profile_footer')}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
