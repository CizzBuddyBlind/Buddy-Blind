
'use client';
import { useState, useEffect } from 'react';
type Venue = { id:string; name:string; locations:string[] };
type Props = { isOpen: boolean; onClose: () => void; onConfirm: (data:any)=>void; venue?: Venue | any; };
const DEFAULT_VENUES: Venue[] = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', locations:['SOHO'] },
  { id:'yardbird', name:'Yardbird', locations:['SHEUNG WAN','CENTRAL'] },
  { id:'mcdonalds', name:'McDonalds', locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK'] },
];
function getWeekDates(o=0){
  const t=new Date(); const s=new Date(t); s.setDate(t.getDate()+o*7); const d=s.getDay(); const mo=d===0?-6:1-d; const m=new Date(s); m.setDate(s.getDate()+mo); const arr=[]; for(let i=0;i<7;i++){ const dd=new Date(m); dd.setDate(m.getDate()+i); arr.push(dd);} return arr;
}
export default function InviteBlindBoxModal({isOpen,onClose,onConfirm,venue}:Props){
  const [step,setStep]=useState(1);
  const [venues,setVenues]=useState<Venue[]>(DEFAULT_VENUES);
  const [data,setData]=useState({location:'', venueName:'', dateObj: new Date(), time:'7:30 PM', customTime:'', customAmPm:'PM', type:'BLIND DATE', participants:4, gender:'MALE', orientation:'STRAIGHT', age:'30-40', agree:true});
  const [weekOffset,setWeekOffset]=useState(0);
  const [weekDates,setWeekDates]=useState<Date[]>(getWeekDates(0));
  useEffect(()=>{ setWeekDates(getWeekDates(weekOffset)); },[weekOffset]);
  useEffect(()=>{
    if(isOpen){
      const cur = venue || venues[0];
      const locs = cur?.locations || (cur?.area ? [cur.area] : ['SOHO']);
      if(locs.length===1){ setData(p=>({...p, location:locs[0], venueName:cur.name||cur.title||'Kissa Tanaka'})); setStep(2);} else { setData(p=>({...p, location:'', venueName:cur.name||cur.title||''})); setStep(1); }
      setWeekOffset(0);
    }
  },[isOpen, venue]);
  if(!isOpen) return null;
  const cur=venue||venues[0];
  const locations=cur?.locations||(cur?.area?[cur.area]:['SOHO','CENTRAL','CWB','TST','SAI KUNG']);
  const isSingle=locations.length===1;
  const monthLabel=weekDates[0]?weekDates[0].toLocaleDateString('en-US',{month:'long', year:'numeric'}):'';
  const getDisplayTime=()=>{ if(data.customTime){ const raw=data.customTime.trim(); const has=raw.toLowerCase().includes('am')||raw.toLowerCase().includes('pm'); if(has) return raw; if(!raw) return data.time; return raw+' '+data.customAmPm; } return data.time; };
  const goBack=()=>{ if(step>1) setStep(step-1); else onClose(); };
  const totalSteps=7;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[520px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        {/* Header - Impeccable: same for all popups */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-200">
              <span className="text-[14px]">←</span>
            </button>
            <div>
              <h2 className="font-serif text-[22px] leading-none text-white tracking-tight">Invite Blind Box</h2>
              <div className="mt-1 mono text-[10px] tracking-[0.14em] text-zinc-500">STEP {step} / {totalSteps} · {monthLabel || 'BOOKING FLOW'}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-200">
            <span className="text-[12px]">✕</span>
          </button>
        </div>

        {/* Progress - same height for all */}
        <div className="mt-6 flex gap-[6px]">
          {Array.from({length:totalSteps}).map((_,i)=><div key={i} className={'h-[3px] rounded-full flex-1 transition-all duration-300 ' + (i+1<=step?'bg-white':'bg-zinc-800')}/>)}
        </div>

        <div className="mt-7">
          {step===1 && !isSingle && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div>
                <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">LOCATION · DYNAMIC FOR FUTURE ADMIN</div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{cur?.name} has {locations.length} locations · {locations.join(', ')} · If 1 location auto skip · If many like McDonalds show all</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {locations.map((l:string)=>(
                  <button key={l} onClick={()=>{setData({...data,location:l}); setStep(2);}} className={'h-12 rounded-full border text-[11px] font-bold tracking-[0.12em] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ' + (data.location===l?'bg-white text-black border-white shadow-lg':'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white bg-zinc-900')}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="flex items-center justify-between">
                <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">DATE · MON-SUN WITH DATE</div>
                <div className="flex items-center gap-2">
                  <span className="mono text-[11px] text-white font-bold">{monthLabel}</span>
                  <button onClick={()=>setWeekOffset(p=>Math.max(0,p-1))} className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition">{"<<"}</button>
                  <button onClick={()=>setWeekOffset(p=>p+1)} className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition">{">>"}</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((d,i)=>{
                  const sel=data.dateObj.toDateString()===d.toDateString();
                  const isToday=d.toDateString()===new Date().toDateString();
                  return (
                    <button key={i} onClick={()=>{setData({...data,dateObj:d}); setStep(3);}} className={'h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] ' + (sel?'bg-white text-black border-white shadow-lg':'bg-black border-zinc-800 text-white hover:border-zinc-600') + (isToday?' ring-1 ring-orange-600':'' )}>
                      <span className="mono text-[10px] tracking-[0.1em]">{d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</span>
                      <span className="text-[16px] font-black leading-none">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mono text-[11px] text-zinc-500">{data.dateObj.toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'})}</div>
            </div>
          )}

          {step===3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">TIME · CUSTOM WITH AM PM</div>
              <div className="grid grid-cols-3 gap-2.5">
                {['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'].map(t=>(
                  <button key={t} onClick={()=>{setData({...data,time:t,customTime:''}); setStep(4);}} className={'h-12 rounded-full border text-[11px] font-bold tracking-[0.1em] transition-all hover:scale-[1.02] active:scale-[0.98] ' + (data.time===t && !data.customTime?'bg-white text-black border-white':'border-zinc-700 text-zinc-300 hover:border-zinc-500 bg-zinc-900')}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">OR TYPE CUSTOM TIME THEN AM PM</div>
                <div className="flex gap-2">
                  <input value={data.customTime} onChange={e=>setData({...data,customTime:e.target.value.replace(/am|pm|AM|PM/gi,'').trim()})} placeholder="8:15  14:30" className="flex-1 h-12 rounded-full bg-black border border-zinc-700 px-5 text-[13px] text-white placeholder:text-zinc-600 focus:border-orange-500 outline-none transition-colors"/>
                  <button onClick={()=>setData({...data,customAmPm:'AM'})} className={'w-12 h-12 rounded-full border text-[11px] font-black transition ' + (data.customAmPm==='AM'?'bg-white text-black border-white':'border-zinc-700 text-zinc-400 hover:text-white bg-zinc-900')}>AM</button>
                  <button onClick={()=>setData({...data,customAmPm:'PM'})} className={'w-12 h-12 rounded-full border text-[11px] font-black transition ' + (data.customAmPm==='PM'?'bg-white text-black border-white':'border-zinc-700 text-zinc-400 hover:text-white bg-zinc-900')}>PM</button>
                  <button disabled={!data.customTime} onClick={()=>{setData({...data,time:getDisplayTime()}); setStep(4);}} className="px-5 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.12em] disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition">USE</button>
                </div>
                <div className="mono text-[11px] text-zinc-500">Preview → {data.customTime?getDisplayTime():'8:15 PM'}</div>
              </div>
            </div>
          )}

          {step===4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">TYPE · BLIND DATE OR MEET FRIENDS</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {id:'BLIND DATE', desc:'One-on-one blind dinner no photos before'},
                  {id:'MEET FRIENDS', desc:'Group blind box 2-6 people meet new friends'}
                ].map(tp=>(
                  <button key={tp.id} onClick={()=>{setData({...data,type:tp.id}); setStep(5);}} className={'p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ' + (data.type===tp.id?'bg-white text-black border-white shadow-lg':'border-zinc-800 bg-black text-white hover:border-zinc-700')}>
                    <div className="mono text-[11px] tracking-[0.14em] font-black">{tp.id}</div>
                    <div className="mt-2 text-[12px] leading-relaxed opacity-80">{tp.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">PARTICIPANTS · MAX 6</div>
              <div className="flex gap-2.5">
                {[2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>{setData({...data,participants:n}); setStep(6);}} className={'w-12 h-12 rounded-full border text-[14px] font-black transition-all hover:scale-105 active:scale-95 ' + (data.participants===n?'bg-white text-black border-white shadow-lg':'border-zinc-700 text-zinc-300 bg-zinc-900 hover:border-zinc-500')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">PREFERENCE · BOOSTED CONTRAST + TRANS</div>
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <div className="mono text-[11px] tracking-[0.14em] text-white">GENDER · ANY FEMALE MALE TRANS</div>
                  <div className="flex gap-2 flex-wrap">
                    {['ANY','FEMALE','MALE','TRANS'].map(g=><button key={g} onClick={()=>setData({...data,gender:g})} className={'h-10 px-5 rounded-full border text-[11px] font-bold tracking-[0.12em] transition-all hover:scale-[1.02] active:scale-[0.98] ' + (data.gender===g?'bg-white text-black border-white shadow':'border-zinc-700 text-white bg-zinc-900 hover:border-zinc-500')}>{g}</button>)}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="mono text-[11px] tracking-[0.14em] text-white">ORIENTATION · ANY STRAIGHT LESBIAN GAY BI</div>
                  <div className="flex gap-2 flex-wrap">
                    {['ANY','STRAIGHT','LESBIAN','GAY','BI'].map(o=><button key={o} onClick={()=>setData({...data,orientation:o})} className={'h-10 px-5 rounded-full border text-[11px] font-bold tracking-[0.12em] transition-all hover:scale-[1.02] active:scale-[0.98] ' + (data.orientation===o?'bg-white text-black border-white shadow':'border-zinc-700 text-white bg-zinc-900 hover:border-zinc-500')}>{o}</button>)}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="mono text-[11px] tracking-[0.14em] text-white">AGE RANGE</div>
                  <div className="flex gap-2 flex-wrap">
                    {['20-30','30-40','40-50','50plus'].map(a=><button key={a} onClick={()=>setData({...data,age:a})} className={'h-10 px-5 rounded-full border text-[11px] font-bold tracking-[0.12em] transition-all hover:scale-[1.02] active:scale-[0.98] ' + (data.age===a?'bg-white text-black border-white shadow':'border-zinc-700 text-white bg-zinc-900 hover:border-zinc-500')}>{a}</button>)}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 h-12 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em] hover:bg-zinc-800 transition">BACK</button>
                <button onClick={()=>setStep(7)} className="flex-1 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition">CONTINUE</button>
              </div>
            </div>
          )}

          {step===7 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="mono text-[11px] tracking-[0.14em] text-zinc-400">SUMMARY · PAYMENT</div>
              <div className="bg-black border border-zinc-800 rounded-2xl p-5 space-y-3">
                {[
                  ['RESTAURANT', data.venueName || cur?.name],
                  ['LOCATION', isSingle ? locations[0] : data.location],
                  ['DATE', data.dateObj.toLocaleDateString('en-US',{weekday:'short', month:'long', day:'numeric'}) + ' ' + monthLabel],
                  ['TIME', getDisplayTime()],
                  ['TYPE', data.type],
                  ['PEOPLE', data.participants + ' PEOPLE'],
                  ['PREF', data.gender + ' ' + data.orientation + ' ' + data.age],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between gap-4">
                    <span className="mono text-[10px] tracking-[0.12em] text-zinc-500">{k}</span>
                    <span className="text-[13px] font-medium text-white text-right truncate">{v as string}</span>
                  </div>
                ))}
              </div>
              <label className="flex gap-2.5 items-start">
                <input type="checkbox" checked={data.agree} onChange={e=>setData({...data,agree:e.target.checked})} className="mt-0.5 accent-orange-600 w-4 h-4"/>
                <span className="text-[11px] leading-relaxed text-zinc-400">PAY HK$5 ADMIN FEE AFTER CONFIRMATION · HOST CREATES ATTRACTION</span>
              </label>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 h-12 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em]">BACK</button>
                <button disabled={!data.agree} onClick={()=>onConfirm({...data, time:getDisplayTime()})} className="flex-1 h-12 rounded-full bg-[#C45A3C] text-white font-black text-[11px] tracking-[0.14em] disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition">CONFIRM BLIND BOX</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
