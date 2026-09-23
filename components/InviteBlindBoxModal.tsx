
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
  const [data,setData]=useState({location:'', venueName:'', dateObj: new Date(), time:'7:30 PM', customTime:'', type:'BLIND DATE', participants:4, gender:'ANY', orientation:'ANY', age:'30-40', agree:true});
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
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-serif">Invite Blind Box</h2>
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-zinc-700 text-xs">CLOSE</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7].map(i=><div key={i} className={'h-2 rounded-full flex-1 ' + (i<=step?'bg-white':'bg-zinc-800')}/>)}
          </div>
          {step===1 && !isSingle && (
            <div>
              <div className="text-xs text-zinc-500 mb-2">STEP 1 LOCATION Dynamic from admin</div>
              <div className="text-xs text-zinc-600 mb-4">{currentVenue?.name} has {locations.length} locations {locations.join(', ')} Example McDonalds everywhere</div>
              <div className="grid grid-cols-2 gap-3">
                {locations.map((l:string)=>(
                  <button key={l} onClick={()=>{setData({...data,location:l}); setTimeout(()=>setStep(2),200);}} className={'h-14 rounded-full border text-sm ' + (data.location===l?'bg-white text-black':'border-zinc-700')}>{l}</button>
                ))}
              </div>
            </div>
          )}
          {step===2 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs text-zinc-500">STEP 2 DATE Mon-Sun with date</div>
                <div className="flex gap-2">
                  <button onClick={()=>setWeekOffset(prev=>Math.max(0,prev-1))} className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-xs">L</button>
                  <button onClick={()=>setWeekOffset(prev=>prev+1)} className="px-3 h-8 rounded-full border border-zinc-700 text-xs">NEXT WEEK</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((d,i)=>{
                  const isSelected = data.dateObj.toDateString()===d.toDateString();
                  return (
                    <button key={i} onClick={()=>{setData({...data,dateObj:d}); setStep(3);}} className={'py-3 rounded-2xl border flex flex-col items-center ' + (isSelected?'bg-white text-black':'border-zinc-700 bg-black')}>
                      <span className="text-xs">{d.toLocaleDateString('en-US',{weekday:'short'})}</span>
                      <span className="text-base font-bold mt-1">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step===3 && (
            <div>
              <div className="text-xs text-zinc-500 mb-4">STEP 3 TIME plus Custom time box</div>
              <div className="grid grid-cols-3 gap-3">
                {['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'].map(t=>(
                  <button key={t} onClick={()=>{setData({...data,time:t, customTime:''}); setStep(4);}} className={'h-14 rounded-full border text-sm ' + (data.time===t && !data.customTime?'bg-white text-black':'border-zinc-700')}>{t}</button>
                ))}
              </div>
              <div className="mt-6">
                <div className="text-xs text-zinc-500 mb-2">OR TYPE CUSTOM TIME</div>
                <div className="flex gap-2">
                  <input value={data.customTime} onChange={e=>setData({...data,customTime:e.target.value})} placeholder="e.g. 8:15 PM 14:30 midnight" className="flex-1 h-12 rounded-full bg-black border border-zinc-700 px-5 text-sm outline-none"/>
                  <button disabled={!data.customTime} onClick={()=>{setData({...data,time:data.customTime}); setStep(4);}} className="px-6 h-12 rounded-full bg-white text-black font-black text-xs disabled:opacity-30">USE</button>
                </div>
              </div>
            </div>
          )}
          {step===4 && (
            <div>
              <div className="text-xs text-zinc-500 mb-4">STEP 4 TYPE</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {id:'BLIND DATE', desc:'One-on-one blind dinner no photos before'},
                  {id:'MEET FRIENDS', desc:'Group blind box 2-6 people meet new friends'}
                ].map(tp=>(
                  <button key={tp.id} onClick={()=>{setData({...data,type:tp.id}); setStep(5);}} className={'p-5 rounded-2xl border text-left ' + (data.type===tp.id?'bg-white text-black':'border-zinc-700 bg-black')}>
                    <div className="text-sm font-black">{tp.id}</div>
                    <div className="mt-2 text-xs opacity-70">{tp.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step===5 && (
            <div>
              <div className="text-xs text-zinc-500 mb-4">STEP 5 PARTICIPANTS MAX 6</div>
              <div className="flex gap-3">
                {[2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>{setData({...data,participants:n}); setStep(6);}} className={'w-14 h-14 rounded-full border text-base ' + (data.participants===n?'bg-white text-black':'border-zinc-700')}>{n}</button>
                ))}
              </div>
            </div>
          )}
          {step===6 && (
            <div>
              <div className="text-xs text-zinc-500 mb-4">STEP 6 PREFERENCE</div>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><span className="text-xs text-zinc-600 w-20">GENDER</span><div className="flex gap-2">{['ANY','FEMALE','MALE'].map(g=><button key={g} onClick={()=>setData({...data,gender:g})} className={'px-4 h-10 rounded-full border text-xs ' + (data.gender===g?'bg-white text-black':'border-zinc-700')}>{g}</button>)}</div></div>
                <div className="flex items-center gap-3"><span className="text-xs text-zinc-600 w-20">ORIENTATION</span><div className="flex gap-2">{['ANY','STRAIGHT','QUEER-FRIENDLY'].map(o=><button key={o} onClick={()=>setData({...data,orientation:o})} className={'px-4 h-10 rounded-full border text-xs ' + (data.orientation===o?'bg-white text-black':'border-zinc-700')}>{o}</button>)}</div></div>
                <div className="flex items-center gap-3"><span className="text-xs text-zinc-600 w-20">AGE RANGE</span><div className="flex gap-2">{['20-30','30-40','40-50','50plus'].map(a=><button key={a} onClick={()=>setData({...data,age:a})} className={'px-4 h-10 rounded-full border text-xs ' + (data.age===a?'bg-white text-black':'border-zinc-700')}>{a}</button>)}</div></div>
              </div>
              <button onClick={()=>setStep(7)} className="mt-8 w-full h-14 rounded-full bg-white text-black font-bold text-sm">CONTINUE SUMMARY</button>
            </div>
          )}
          {step===7 && (
            <div>
              <div className="text-xs text-zinc-500 mb-4">STEP 7 SUMMARY and PAYMENT</div>
              <div className="bg-black border border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">RESTAURANT</span><span>{data.venueName || currentVenue?.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">LOCATION</span><span>{isSingle ? locations[0] + ' auto single' : data.location}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">DATE</span><span>{data.dateObj.toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">TIME</span><span>{data.customTime || data.time}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">TYPE</span><span>{data.type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">PARTICIPANTS</span><span>{data.participants} PEOPLE</span></div>
              </div>
              <label className="mt-4 flex gap-2 items-start text-xs text-zinc-500"><input type="checkbox" checked={data.agree} onChange={e=>setData({...data,agree:e.target.checked})}/>PAY HK 5 ADMIN FEE AFTER CONFIRMATION</label>
              <button disabled={!data.agree} onClick={()=>onConfirm(data)} className="mt-6 w-full h-14 rounded-full bg-orange-700 text-white font-bold text-sm disabled:opacity-50">CONFIRM BLIND BOX</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
