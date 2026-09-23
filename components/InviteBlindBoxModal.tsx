
'use client';
import { useState, useEffect } from 'react';
type Venue = { id:string; name:string; locations:string[] };
type Props = { isOpen: boolean; onClose: () => void; onConfirm: (data:any)=>void; venue?: Venue | any; };
const DEFAULT_VENUES: Venue[] = [{ id:'kissa-tanaka', name:'Kissa Tanaka', locations:['SOHO'] },{ id:'yardbird', name:'Yardbird', locations:['SHEUNG WAN','CENTRAL'] },{ id:'mcdonalds', name:'McDonalds', locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK'] }];
function getWeekDates(o=0){ const t=new Date(); const s=new Date(t); s.setDate(t.getDate()+o*7); const d=s.getDay(); const mo=d===0?-6:1-d; const m=new Date(s); m.setDate(s.getDate()+mo); const arr=[]; for(let i=0;i<7;i++){ const dd=new Date(m); dd.setDate(m.getDate()+i); arr.push(dd);} return arr; }
export default function InviteBlindBoxModal({isOpen,onClose,onConfirm,venue}:Props){
  const [step,setStep]=useState(1); const [venues,setVenues]=useState(DEFAULT_VENUES);
  const [data,setData]=useState({location:'', venueName:'', dateObj: new Date(), time:'7:30 PM', customTime:'', customAmPm:'PM', type:'BLIND DATE', participants:4, gender:'MALE', orientation:'STRAIGHT', age:'30-40', agree:true});
  const [weekOffset,setWeekOffset]=useState(0); const [weekDates,setWeekDates]=useState<Date[]>(getWeekDates(0));
  useEffect(()=>{ setWeekDates(getWeekDates(weekOffset)); },[weekOffset]);
  useEffect(()=>{ if(isOpen){ const cur=venue||venues[0]; const locs=cur?.locations||['SOHO']; if(locs.length===1){ setData(p=>({...p, location:locs[0], venueName:cur.name||'Kissa Tanaka'})); setStep(2);} else { setData(p=>({...p, location:'', venueName:cur.name||''})); setStep(1);} } },[isOpen, venue]);
  if(!isOpen) return null;
  const cur=venue||venues[0]; const locations=cur?.locations||['SOHO','CENTRAL','CWB','TST','SAI KUNG']; const isSingle=locations.length===1;
  const monthLabel=weekDates[0]?weekDates[0].toLocaleDateString('en-US',{month:'long', year:'numeric'}):''; 
  const getDisplayTime=()=>{ if(data.customTime){ const raw=data.customTime.trim(); const has=raw.toLowerCase().includes('am')||raw.toLowerCase().includes('pm'); if(has) return raw; if(!raw) return data.time; return raw+' '+data.customAmPm; } return data.time; };
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-600 rounded-3xl overflow-hidden max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h2 className="text-xl font-serif text-white">Invite Blind Box</h2>
          <button onClick={onClose} className="px-5 py-2 rounded-full border border-zinc-400 text-white text-xs font-bold">CLOSE</button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-8">{[1,2,3,4,5,6,7].map(i=><div key={i} className={'h-2 rounded-full flex-1 '+(i<=step?'bg-white':'bg-zinc-600')}/>)}</div>
          {step===2 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-black text-white">STEP 2 DATE Mon-Sun with date</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white mr-2">{monthLabel}</span>
                  <button onClick={()=>setWeekOffset(p=>Math.max(0,p-1))} className="w-9 h-9 rounded-full border border-zinc-400 flex items-center justify-center text-white text-sm font-black">{"<<"}</button>
                  <button onClick={()=>setWeekOffset(p=>p+1)} className="w-9 h-9 rounded-full border border-zinc-400 flex items-center justify-center text-white text-sm font-black">{">>"}</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">{weekDates.map((d,i)=>{ const sel=data.dateObj.toDateString()===d.toDateString(); return <button key={i} onClick={()=>{setData({...data,dateObj:d}); setStep(3);}} className={'py-3 rounded-2xl border flex flex-col items-center '+(sel?'bg-white text-black':'border-zinc-500 bg-black text-white')}><span className="text-xs font-bold">{d.toLocaleDateString('en-US',{weekday:'short'})}</span><span className="text-base font-black">{d.getDate()}</span></button>; })}</div>
            </div>
          )}
          {step===3 && (
            <div>
              <div className="text-sm font-black text-white mb-4">STEP 3 TIME plus Custom with AM PM</div>
              <div className="grid grid-cols-3 gap-3">{['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'].map(t=><button key={t} onClick={()=>{setData({...data,time:t,customTime:''}); setStep(4);}} className={'h-14 rounded-full border text-sm font-bold '+(data.time===t && !data.customTime?'bg-white text-black':'border-zinc-400 text-white bg-zinc-800')}>{t}</button>)}</div>
              <div className="mt-6">
                <div className="text-sm font-black text-white mb-3">OR TYPE CUSTOM TIME then choose AM PM</div>
                <div className="flex gap-2 items-center">
                  <input value={data.customTime} onChange={e=>setData({...data,customTime:e.target.value.replace(/am|pm|AM|PM/g,'').trim()})} placeholder="e.g. 8:15 14:30" className="flex-1 h-12 rounded-full bg-black border border-zinc-400 px-5 text-sm text-white outline-none"/>
                  <button onClick={()=>setData({...data,customAmPm:'AM'})} className={'w-12 h-12 rounded-full border text-xs font-black '+(data.customAmPm==='AM'?'bg-white text-black':'border-zinc-400 text-white bg-zinc-800')}>AM</button>
                  <button onClick={()=>setData({...data,customAmPm:'PM'})} className={'w-12 h-12 rounded-full border text-xs font-black '+(data.customAmPm==='PM'?'bg-white text-black':'border-zinc-400 text-white bg-zinc-800')}>PM</button>
                  <button disabled={!data.customTime} onClick={()=>{setData({...data,time:getDisplayTime()}); setStep(4);}} className="px-6 h-12 rounded-full bg-white text-black font-black text-xs disabled:opacity-30">USE</button>
                </div>
                <div className="mt-2 text-xs text-white">Preview {data.customTime?getDisplayTime():'8:15 PM'}</div>
              </div>
            </div>
          )}
          {step===6 && (
            <div>
              <div className="text-sm font-black text-white mb-6">STEP 6 PREFERENCE Boosted contrast plus TRANS</div>
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black text-white">GENDER ANY FEMALE MALE TRANS</span>
                  <div className="flex gap-2 flex-wrap">{['ANY','FEMALE','MALE','TRANS'].map(g=><button key={g} onClick={()=>setData({...data,gender:g})} className={'px-5 h-11 rounded-full border text-sm font-bold '+(data.gender===g?'bg-white text-black':'border-zinc-300 text-white bg-zinc-800')}>{g}</button>)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black text-white">ORIENTATION ANY STRAIGHT LESBIAN GAY BI No queer-friendly</span>
                  <div className="flex gap-2 flex-wrap">{['ANY','STRAIGHT','LESBIAN','GAY','BI'].map(o=><button key={o} onClick={()=>setData({...data,orientation:o})} className={'px-5 h-11 rounded-full border text-sm font-bold '+(data.orientation===o?'bg-white text-black':'border-zinc-300 text-white bg-zinc-800')}>{o}</button>)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black text-white">AGE RANGE</span>
                  <div className="flex gap-2 flex-wrap">{['20-30','30-40','40-50','50plus'].map(a=><button key={a} onClick={()=>setData({...data,age:a})} className={'px-5 h-11 rounded-full border text-sm font-bold '+(data.age===a?'bg-white text-black':'border-zinc-300 text-white bg-zinc-800')}>{a}</button>)}</div>
                </div>
              </div>
              <button onClick={()=>setStep(7)} className="mt-10 w-full h-16 rounded-full bg-white text-black font-black text-sm">CONTINUE SUMMARY</button>
            </div>
          )}
          {step===7 && (
            <div>
              <div className="text-sm font-black text-white mb-4">STEP 7 SUMMARY</div>
              <div className="bg-black border border-zinc-600 rounded-xl p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">RESTAURANT</span><span className="text-white font-bold">{data.venueName||cur?.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">LOCATION</span><span className="text-white font-bold">{isSingle?locations[0]:data.location}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">DATE</span><span className="text-white font-bold">{data.dateObj.toLocaleDateString()} {monthLabel}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">TIME</span><span className="text-white font-bold">{getDisplayTime()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-200 font-bold">PREFERENCE</span><span className="text-white font-bold">{data.gender} {data.orientation} {data.age}</span></div>
              </div>
              <button onClick={()=>onConfirm({...data, time:getDisplayTime()})} className="mt-6 w-full h-14 rounded-full bg-orange-700 text-white font-black text-sm">CONFIRM BLIND BOX</button>
            </div>
          )}
          {step===1 && !isSingle && (
            <div>
              <div className="text-sm font-black text-white mb-3">STEP 1 LOCATION</div>
              <div className="grid grid-cols-2 gap-3">{locations.map((l:string)=><button key={l} onClick={()=>{setData({...data,location:l}); setStep(2);}} className={'h-14 rounded-full border font-bold text-sm '+(data.location===l?'bg-white text-black':'border-zinc-400 text-white bg-zinc-800')}>{l}</button>)}</div>
            </div>
          )}
          {[4,5].includes(step) && (
            <div className="mt-4">
              <button onClick={()=>setStep(step+1)} className="w-full h-12 rounded-full bg-white text-black font-black text-xs">NEXT</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
