
'use client';
import { useState, useEffect } from 'react';

type Venue = { id:string; name:string; locations:string[] };

type Props = { isOpen: boolean; onClose: () => void; onConfirm: (data:any)=>void; venue?: Venue | any; };

const DEFAULT_VENUES: Venue[] = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', locations:['SOHO'] },
  { id:'yardbird', name:'Yardbird', locations:['SHEUNG WAN','CENTRAL'] },
  { id:'mcdonalds', name:"McDonald's", locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK','SHAM SHUI PO'] },
  { id:'la-cabane', name:'La Cabane', locations:['CWB','SOHO'] },
  { id:'mott32', name:'Mott 32', locations:['CENTRAL'] },
];

function getWeekDates(startOffset=0){
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + startOffset*7);
  // get Monday of that week
  const day = start.getDay(); // 0 Sun - 6 Sat
  const mondayOffset = day===0 ? -6 : 1 - day;
  const monday = new Date(start);
  monday.setDate(start.getDate() + mondayOffset);
  const days = [];
  for(let i=0;i<7;i++){
    const d = new Date(monday);
    d.setDate(monday.getDate()+i);
    days.push(d);
  }
  return days;
}

export default function InviteBlindBoxModal({isOpen,onClose,onConfirm,venue}:Props){
  const [step,setStep]=useState(1);
  const [venues,setVenues]=useState<Venue[]>(DEFAULT_VENUES);
  const [data,setData]=useState({location:'', venueName:'', dateLabel:'', dateObj: new Date(), time:'7:30 PM', customTime:'', type:'BLIND DATE', participants:4, gender:'ANY', orientation:'ANY', age:'30-40', agree:true});
  const [weekOffset,setWeekOffset]=useState(0);
  const [weekDates,setWeekDates]=useState<Date[]>(getWeekDates(0));

  useEffect(()=>{
    // Load venues from localStorage (admin added)
    if(typeof window!=='undefined'){
      const saved = localStorage.getItem('buddy_venues');
      if(saved){
        try{ setVenues(JSON.parse(saved)); }catch{}
      }
      const adminVenues = localStorage.getItem('admin_venues');
      if(adminVenues){
        try{ 
          const parsed = JSON.parse(adminVenues);
          if(Array.isArray(parsed) && parsed.length>0){
            setVenues(parsed);
          }
        }catch{}
      }
    }
    setWeekDates(getWeekDates(weekOffset));
  },[weekOffset]);

  useEffect(()=>{
    if(isOpen){
      // Determine initial venue and locations
      const currentVenue = venue || venues[0];
      const locs = currentVenue?.locations || (currentVenue?.area ? [currentVenue.area] : ['SOHO']);
      const singleLocation = locs.length===1;
      // If single location, auto-set and skip step 1
      if(singleLocation){
        setData(prev=>({...prev, location: locs[0], venueName: currentVenue.name || currentVenue.title || 'Kissa Tanaka'}));
        setStep(2); // skip location
      } else {
        setData(prev=>({...prev, location: '', venueName: currentVenue.name || currentVenue.title || ''}));
        setStep(1);
      }
      setWeekOffset(0);
    }
  },[isOpen, venue]);

  if(!isOpen) return null;

  const currentVenue = venue || venues[0];
  const locations = currentVenue?.locations || (currentVenue?.area ? [currentVenue.area] : venues.find(v=>v.name===data.venueName)?.locations || ['SOHO','CENTRAL','CWB','TST','SAI KUNG']);
  const isSingleLocation = locations.length===1;

  const nextWeek = ()=> setWeekOffset(prev=>prev+1);
  const prevWeek = ()=> setWeekOffset(prev=>Math.max(0,prev-1));

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-[16px] flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] bg-[#111] border border-zinc-800 rounded-[28px] overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-7 border-b border-zinc-800">
          <h2 className="text-[24px] font-serif tracking-tight">Invite — Blind Box</h2>
          <button onClick={onClose} className="px-4 py-1.5 rounded-full border border-zinc-800 text-[12px] tracking-widest">CLOSE</button>
        </div>
        <div className="p-7">
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7].map(i=><div key={i} className={`h-2 rounded-full flex-1 ${i<=step?'bg-white':'bg-zinc-800'}`}/>)}
          </div>

          {step===1 && !isSingleLocation && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-2">STEP 1 — LOCATION (Dynamic from admin)</div>
              <div className="text-[11px] text-zinc-600 mb-4">{currentVenue?.name || data.venueName} has {locations.length} locations: {locations.join(', ')}. {locations.length===1 ? 'Single location → auto skip.' : 'Choose one.'} Example McDonald's everywhere.</div>
              <div className="grid grid-cols-2 gap-3">
                {locations.map((l:string)=>(
                  <button key={l} onClick={()=>{setData({...data,location:l}); setTimeout(()=>setStep(2),200);}} className={`h-[56px] rounded-full border text-[14px] tracking-widest font-medium ${data.location===l?'bg-white text-black border-white':'border-zinc-800 bg-transparent'}`}>{l}</button>
                ))}
              </div>
              <div className="mt-4 text-[10px] text-zinc-600">Admin can add restaurant with few locations → this list auto updates. If only 1 location, user no need to choose.</div>
            </div>
          )}

          {step===2 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-[12px] tracking-[0.2em] text-zinc-500">STEP 2 — DATE (Mon-Sun + date)</div>
                <div className="flex gap-2">
                  <button onClick={prevWeek} className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-[12px]">&lt;</button>
                  <button onClick={nextWeek} className="px-3 h-8 rounded-full border border-zinc-800 text-[11px] tracking-widest">NEXT WEEK &gt;&gt;</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((d,i)=>{
                  const isToday = d.toDateString()===new Date().toDateString();
                  const isSelected = data.dateObj.toDateString()===d.toDateString();
                  return (
                    <button key={i} onClick={()=>{setData({...data,dateObj:d, dateLabel: d.toLocaleDateString('en-US',{weekday:'short', month:'short', day:'numeric'})}); setStep(3);}} className={`py-3 rounded-[16px] border flex flex-col items-center ${isSelected?'bg-white text-black border-white':'border-zinc-800 bg-[#0A0A0A]'} ${isToday?'ring-1 ring-amber-400':''}`}>
                      <span className="text-[10px] tracking-widest">{d.toLocaleDateString('en-US',{weekday:'short'})}</span>
                      <span className="text-[16px] font-bold mt-1">{d.getDate()}</span>
                      <span className="text-[9px] mt-1">{d.toLocaleDateString('en-US',{month:'short'})}</span>
                      {isToday && <span className="text-[8px] mt-1 text-amber-400">TODAY</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-zinc-500">Selected: {data.dateObj.toLocaleDateString('en-US',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
            </div>
          )}

          {step===3 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 3 — TIME + Custom time box</div>
              <div className="grid grid-cols-3 gap-3">
                {['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'].map(t=>(
                  <button key={t} onClick={()=>{setData({...data,time:t, customTime:''}); setStep(4);}} className={`h-[56px] rounded-full border text-[13px] tracking-widest ${data.time===t && !data.customTime?'bg-white text-black border-white':'border-zinc-800'}`}>{t}</button>
                ))}
              </div>
              <div className="mt-6">
                <div className="text-[11px] tracking-widest text-zinc-500 mb-2">OR TYPE CUSTOM TIME</div>
                <div className="flex gap-2">
                  <input value={data.customTime} onChange={e=>setData({...data,customTime:e.target.value})} placeholder="e.g. 8:15 PM, 14:30, midnight" className="flex-1 h-[48px] rounded-full bg-black border border-zinc-800 px-5 text-[13px] outline-none"/>
                  <button disabled={!data.customTime} onClick={()=>{setData({...data,time:data.customTime}); setStep(4);}} className="px-6 h-[48px] rounded-full bg-white text-black font-black text-[11px] disabled:opacity-30">USE</button>
                </div>
                <div className="mt-2 text-[10px] text-zinc-600">Type any time, e.g. 6:45 PM, 8pm, 14:00, etc.</div>
              </div>
            </div>
          )}

          {step===4 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 4 — TYPE</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {id:'BLIND DATE', desc:'One-on-one blind dinner, no photos before'},
                  {id:'MEET FRIENDS', desc:'Group blind box, 2-6 people, meet new friends'}
                ].map(tp=>(
                  <button key={tp.id} onClick={()=>{setData({...data,type:tp.id}); setStep(5);}} className={`p-5 rounded-[20px] border text-left ${data.type===tp.id?'bg-white text-black border-white':'border-zinc-800 bg-[#0A0A0A]'}`}>
                    <div className="text-[14px] font-black tracking-widest">{tp.id}</div>
                    <div className="mt-2 text-[11px] opacity-70 leading-relaxed">{tp.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===5 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 5 — PARTICIPANTS MAX 6</div>
              <div className="flex gap-3">
                {[2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>{setData({...data,participants:n}); setStep(6);}} className={`w-[56px] h-[56px] rounded-full border text-[16px] ${data.participants===n?'bg-white text-black':'border-zinc-800'}`}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {step===6 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 6 — PREFERENCE</div>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><span className="text-[11px] text-zinc-600 w-[90px] tracking-widest">GENDER</span><div className="flex gap-2">{['ANY','FEMALE','MALE'].map(g=><button key={g} onClick={()=>setData({...data,gender:g})} className={`px-4 h-[40px] rounded-full border text-[13px] tracking-widest ${data.gender===g?'bg-white text-black':'border-zinc-800'}`}>{g}</button>)}</div></div>
                <div className="flex items-center gap-3"><span className="text-[11px] text-zinc-600 w-[90px] tracking-widest">ORIENTATION</span><div className="flex gap-2">{['ANY','STRAIGHT','QUEER-FRIENDLY'].map(o=><button key={o} onClick={()=>setData({...data,orientation:o})} className={`px-4 h-[40px] rounded-full border text-[12px] tracking-widest ${data.orientation===o?'bg-white text-black':'border-zinc-800'}`}>{o}</button>)}</div></div>
                <div className="flex items-center gap-3"><span className="text-[11px] text-zinc-600 w-[90px] tracking-widest">AGE RANGE</span><div className="flex gap-2">{['20-30','30-40','40-50','50+'].map(a=><button key={a} onClick={()=>setData({...data,age:a})} className={`px-4 h-[40px] rounded-full border text-[13px] tracking-widest ${data.age===a?'bg-white text-black':'border-zinc-800'}`}>{a}</button>)}</div></div>
              </div>
              <button onClick={()=>setStep(7)} className="mt-8 w-full h-[56px] rounded-full bg-[#EDEBE8] text-black font-bold text-[13px] tracking-widest">CONTINUE → SUMMARY</button>
            </div>
          )}

          {step===7 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 7 — SUMMARY & PAYMENT</div>
              <div className="bg-[#0A0A0A] border border-zinc-800 rounded-[16px] p-5 space-y-3 text-[12px]">
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">RESTAURANT</span><span className="tracking-widest">{data.venueName || currentVenue?.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">LOCATION</span><span className="tracking-widest">{isSingleLocation ? `${locations[0]} (auto - single)` : data.location}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">DATE</span><span className="tracking-widest">{data.dateObj.toLocaleDateString('en-US',{weekday:'short', month:'short', day:'numeric', year:'numeric'})}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">TIME</span><span className="tracking-widest">{data.customTime || data.time}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">TYPE</span><span className="tracking-widest">{data.type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">PARTICIPANTS</span><span className="tracking-widest">{data.participants} PEOPLE</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">PREFERENCE</span><span className="tracking-widest">{data.gender} · {data.age}</span></div>
              </div>
              <label className="mt-4 flex gap-2 items-start text-[11px] text-zinc-500 leading-relaxed"><input type="checkbox" checked={data.agree} onChange={e=>setData({...data,agree:e.target.checked})} className="mt-1 accent-[#C46A4A]"/>PAY HK$5 ADMIN FEE AFTER CONFIRMATION — HOST CREATES ATTRACTION AND DOWNLOAD REASONS</label>
              <button disabled={!data.agree} onClick={()=>onConfirm(data)} className="mt-6 w-full h-[56px] rounded-full bg-[#C46A4A] text-white font-bold text-[13px] tracking-widest disabled:opacity-50">CONFIRM BLIND BOX</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
