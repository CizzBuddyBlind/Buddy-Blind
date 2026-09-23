
'use client';
import { useState, useEffect } from 'react';
type Venue = { id:string; name:string; locations:string[] };
type Props = { isOpen: boolean; onClose: () => void; onConfirm: (data:any)=>void; venue?: Venue | any; };
const DEFAULT_VENUES: Venue[] = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', locations:['SOHO'] },
  { id:'yardbird', name:'Yardbird', locations:['SHEUNG WAN','CENTRAL'] },
  { id:'mcdonalds', name:'McDonalds', locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK'] },
];
function getWeekDates(startOffset=0){
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + startOffset*7);
  const day = start.getDay();
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
  const [data,setData]=useState({location:'', venueName:'', dateObj: new Date(), time:'7:30 PM', customTime:'', customAmPm:'PM', type:'BLIND DATE', participants:4, gender:'MALE', orientation:'STRAIGHT', age:'30-40', agree:true});
  const [weekOffset,setWeekOffset]=useState(0);
  const [weekDates,setWeekDates]=useState<Date[]>(getWeekDates(0));
  useEffect(()=>{
    if(typeof window!=='undefined'){
      const saved = localStorage.getItem('buddy_venues');
      if(saved){ try{ setVenues(JSON.parse(saved)); }catch{} }
    }
    setWeekDates(getWeekDates(weekOffset));
  },[weekOffset]);
  useEffect(()=>{
    if(isOpen){
      const currentVenue = venue || venues[0];
      const locs = currentVenue?.locations || (currentVenue?.area ? [currentVenue.area] : ['SOHO']);
      if(locs.length===1){
        setData(prev=>({...prev, location: locs[0], venueName: currentVenue.name || currentVenue.title || 'Kissa Tanaka'}));
        setStep(2);
      } else {
        setData(prev=>({...prev, location: '', venueName: currentVenue.name || currentVenue.title || ''}));
        setStep(1);
      }
      setWeekOffset(0);
    }
  },[isOpen, venue]);
  if(!isOpen) return null;
  const currentVenue = venue || venues[0];
  const locations = currentVenue?.locations || (currentVenue?.area ? [currentVenue.area] : ['SOHO','CENTRAL','CWB','TST','SAI KUNG']);
  const isSingle = locations.length===1;
  const monthLabel = weekDates[0] ? weekDates[0].toLocaleDateString('en-US',{month:'long', year:'numeric'}) : '';
  const getDisplayTime = ()=>{
    if(data.customTime){
      const raw = data.customTime.trim();
      const hasAmPm = raw.toLowerCase().includes('am') || raw.toLowerCase().includes('pm');
      if(hasAmPm) return raw;
      if(!raw) return data.time;
      return raw + ' ' + data.customAmPm;
    }
    return data.time;
  };
  const goBack = ()=>{ if(step>1){ setStep(step-1); } else { onClose(); } };
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-600 rounded-3xl overflow-hidden max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="w-9 h-9 rounded-full border border-zinc-400 flex items-center justify-center text-white text-sm font-black">{"<"}</button>
            <h2 className="text-xl font-serif text-white tracking-tight">Invite Blind Box</h2>
          </div>
          <button onClick={onClose} className="px-5 py-2 rounded-full border border-zinc-400 text-white text-xs font-bold tracking-widest">CLOSE</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-8">
            {[1,2,3,4,5,6,7].map(i=><div key={i} className={'h-2 rounded-full flex-1 ' + (i<=step?'bg-white':'bg-zinc-600')}/>)}
          </div>
          {step===1 && !isSingle && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-3">STEP 1 LOCATION Dynamic ready for future admin update</div>
              <div className="text-sm text-white mb-4 leading-relaxed">{currentVenue?.name} has {locations.length} locations {locations.join(', ')} If 1 location auto skip If many like McDonalds show all</div>
              <div className="grid grid-cols-2 gap-3">
                {locations.map((l:string)=>(
                  <button key={l} onClick={()=>{setData({...data,location:l}); setTimeout(()=>setStep(2),200);}} className={'h-14 rounded-full border text-sm font-bold tracking-widest ' + (data.location===l?'bg-white text-black border-white':'border-zinc-400 text-white bg-zinc-800')}>{l}</button>
                ))}
              </div>
              <button onClick={goBack} className="mt-6 text-xs tracking-widest text-zinc-400 font-bold">BACK</button>
            </div>
          )}
          {step===2 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-black tracking-widest text-white">STEP 2 DATE Mon-Sun with date</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white mr-2">{monthLabel}</span>
                  <button onClick={()=>setWeekOffset(prev=>Math.max(0,prev-1))} className="w-9 h-9 rounded-full border border-zinc-400 flex items-center justify-center text-white text-sm font-black">{"<<"}</button>
                  <button onClick={()=>setWeekOffset(prev=>prev+1)} className="w-9 h-9 rounded-full border border-zinc-400 flex items-center justify-center text-white text-sm font-black">{">>"}</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((d,i)=>{
                  const isSelected = data.dateObj.toDateString()===d.toDateString();
                  const isToday = d.toDateString()===new Date().toDateString();
                  return (
                    <button key={i} onClick={()=>{setData({...data,dateObj:d}); setStep(3);}} className={'py-3 rounded-2xl border flex flex-col items-center ' + (isSelected?'bg-white text-black border-white':'border-zinc-500 bg-black text-white') + (isToday ? ' ring-1 ring-amber-400' : '')}>
                      <span className="text-xs font-bold">{d.toLocaleDateString('en-US',{weekday:'short'})}</span>
                      <span className="text-base font-black mt-1">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={goBack} className="mt-6 text-xs tracking-widest text-zinc-400 font-bold">BACK to Location</button>
            </div>
          )}
          {step===3 && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-4">STEP 3 TIME plus Custom time box with AM PM</div>
              <div className="grid grid-cols-3 gap-3">
                {['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'].map(t=>(
                  <button key={t} onClick={()=>{setData({...data,time:t, customTime:''}); setStep(4);}} className={'h-14 rounded-full border text-sm font-bold ' + (data.time===t && !data.customTime?'bg-white text-black border-white':'border-zinc-400 text-white bg-zinc-800')}>{t}</button>
                ))}
              </div>
              <div className="mt-6">
                <div className="text-sm font-black tracking-widest text-white mb-3">OR TYPE CUSTOM TIME then choose AM or PM</div>
                <div className="flex gap-2 items-center">
                  <input value={data.customTime} onChange={e=>setData({...data,customTime:e.target.value.replace(/am|pm|AM|PM/g,'').trim()})} placeholder="e.g. 8:15 14:30" className="flex-1 h-12 rounded-full bg-black border border-zinc-400 px-5 text-sm text-white outline-none placeholder:text-zinc-400"/>
                  <div className="flex gap-1">
                    <button onClick={()=>setData({...data,customAmPm:'AM'})} className={'w-12 h-12 rounded-full border text-xs font-black ' + (data.customAmPm==='AM'?'bg-white text-black border-white':'border-zinc-400 text-white bg-zinc-800')}>AM</button>
                    <button onClick={()=>setData({...data,customAmPm:'PM'})} className={'w-12 h-12 rounded-full border text-xs font-black ' + (data.customAmPm==='PM'?'bg-white text-black border-white':'border-zinc-400 text-white bg-zinc-800')}>PM</button>
                  </div>
                  <button disabled={!data.customTime} onClick={()=>{setData({...data,time:getDisplayTime()}); setStep(4);}} className="px-6 h-12 rounded-full bg-white text-black font-black text-xs disabled:opacity-30">USE</button>
                </div>
                <div className="mt-2 text-xs text-white">Preview will become {data.customTime ? getDisplayTime() : '8:15 PM'} - type time then choose AM or PM</div>
              </div>
              <button onClick={goBack} className="mt-6 text-xs tracking-widest text-zinc-400 font-bold">BACK to Date</button>
            </div>
          )}
          {step===4 && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-4">STEP 4 TYPE</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {id:'BLIND DATE', desc:'One-on-one blind dinner no photos before'},
                  {id:'MEET FRIENDS', desc:'Group blind box 2-6 people meet new friends'}
                ].map(tp=>(
                  <button key={tp.id} onClick={()=>{setData({...data,type:tp.id}); setStep(5);}} className={'p-5 rounded-2xl border text-left ' + (data.type===tp.id?'bg-white text-black border-white':'border-zinc-500 bg-black text-white')}>
                    <div className="text-sm font-black tracking-widest">{tp.id}</div>
                    <div className="mt-2 text-xs leading-relaxed">{tp.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={goBack} className="mt-6 text-xs tracking-widest text-zinc-400 font-bold">BACK to Time</button>
            </div>
          )}
          {step===5 && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-4">STEP 5 PARTICIPANTS MAX 6</div>
              <div className="flex gap-3">
                {[2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>{setData({...data,participants:n}); setStep(6);}} className={'w-14 h-14 rounded-full border text-base font-black ' + (data.participants===n?'bg-white text-black border-white':'border-zinc-400 text-white bg-zinc-800')}>{n}</button>
                ))}
              </div>
              <button onClick={goBack} className="mt-6 text-xs tracking-widest text-zinc-400 font-bold">BACK to Type</button>
            </div>
          )}
          {step===6 && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-6">STEP 6 PREFERENCE Boosted contrast plus TRANS</div>
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black tracking-widest text-white">GENDER ANY FEMALE MALE TRANS</span>
                  <div className="flex gap-2 flex-wrap">
                    {['ANY','FEMALE','MALE','TRANS'].map(g=><button key={g} onClick={()=>setData({...data,gender:g})} className={'px-5 h-11 rounded-full border text-sm font-bold tracking-widest ' + (data.gender===g?'bg-white text-black border-white':'border-zinc-300 text-white bg-zinc-800')}>{g}</button>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black tracking-widest text-white">ORIENTATION ANY STRAIGHT LESBIAN GAY BI No queer-friendly</span>
                  <div className="flex gap-2 flex-wrap">
                    {['ANY','STRAIGHT','LESBIAN','GAY','BI'].map(o=>(
                      <button key={o} onClick={()=>setData({...data,orientation:o})} className={'px-5 h-11 rounded-full border text-sm font-bold tracking-widest ' + (data.orientation===o?'bg-white text-black border-white':'border-zinc-300 text-white bg-zinc-800')}>{o}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black tracking-widest text-white">AGE RANGE</span>
                  <div className="flex gap-2 flex-wrap">
                    {['20-30','30-40','40-50','50plus'].map(a=><button key={a} onClick={()=>setData({...data,age:a})} className={'px-5 h-11 rounded-full border text-sm font-bold tracking-widest ' + (data.age===a?'bg-white text-black border-white':'border-zinc-300 text-white bg-zinc-800')}>{a}</button>)}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-10">
                <button onClick={goBack} className="flex-1 h-16 rounded-full border border-zinc-400 text-white font-black text-sm tracking-widest">BACK</button>
                <button onClick={()=>setStep(7)} className="flex-1 h-16 rounded-full bg-white text-black font-black text-sm tracking-widest">CONTINUE SUMMARY</button>
              </div>
            </div>
          )}
          {step===7 && (
            <div>
              <div className="text-sm font-black tracking-widest text-white mb-4">STEP 7 SUMMARY and PAYMENT</div>
              <div className="bg-black border border-zinc-600 rounded-xl p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">RESTAURANT</span><span className="text-white font-bold">{data.venueName || currentVenue?.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">LOCATION</span><span className="text-white font-bold">{isSingle ? locations[0] + ' auto single' : data.location}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">DATE</span><span className="text-white font-bold">{data.dateObj.toLocaleDateString('en-US',{weekday:'short', month:'long', day:'numeric', year:'numeric'})} {monthLabel}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">TIME</span><span className="text-white font-bold">{getDisplayTime()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">TYPE</span><span className="text-white font-bold">{data.type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">PARTICIPANTS</span><span className="text-white font-bold">{data.participants} PEOPLE</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">PREFERENCE</span><span className="text-white font-bold">{data.gender} {data.orientation} {data.age}</span></div>
              </div>
              <label className="mt-4 flex gap-2 items-start text-sm text-white leading-relaxed"><input type="checkbox" checked={data.agree} onChange={e=>setData({...data,agree:e.target.checked})} className="mt-1"/>PAY HK 5 ADMIN FEE AFTER CONFIRMATION</label>
              <div className="flex gap-3 mt-6">
                <button onClick={goBack} className="flex-1 h-14 rounded-full border border-zinc-400 text-white font-black text-sm tracking-widest">BACK</button>
                <button disabled={!data.agree} onClick={()=>onConfirm({...data, time:getDisplayTime()})} className="flex-1 h-14 rounded-full bg-orange-700 text-white font-black text-sm tracking-widest disabled:opacity-50">CONFIRM BLIND BOX</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
