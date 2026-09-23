
'use client';
import { useState } from 'react';

type Props = { isOpen: boolean; onClose: () => void; onConfirm: (data:any)=>void; };

export default function InviteBlindBoxModal({isOpen,onClose,onConfirm}:Props){
  const [step,setStep]=useState(1);
  const [data,setData]=useState({location:'SOHO', venue:'KISSA TANAKA', date:'TONIGHT', time:'7:30PM', type:'CREATIVE MINDS', participants:4, gender:'ANY', orientation:'ANY', age:'30-40', agree:true});
  if(!isOpen) return null;
  const locations=['SOHO','CENTRAL','CWB','TST','SAI KUNG'];
  const times=['12:00 PM','3:00 PM','7:00 PM','7:30 PM','9:00 PM'];
  const types=['BLIND DINNER','WINE NIGHT','TEA & MAHJONG','HIKE','CHEF TABLE','COMEDY NIGHT'];

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-[16px] flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] bg-[#111] border border-zinc-800 rounded-[28px] overflow-hidden">
        <div className="flex justify-between items-center p-7 border-b border-zinc-800">
          <h2 className="text-[24px] font-serif tracking-tight">Invite — Blind Box</h2>
          <button onClick={onClose} className="px-4 py-1.5 rounded-full border border-zinc-800 text-[12px] tracking-widest">CLOSE</button>
        </div>
        <div className="p-7">
          {/* Progress dots */}
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7].map(i=><div key={i} className={`h-2 rounded-full flex-1 ${i<=step?'bg-white':'bg-zinc-800'}`}/>)}
          </div>

          {step===1 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 1 — LOCATION</div>
              <div className="grid grid-cols-2 gap-3">
                {locations.map(l=>(
                  <button key={l} onClick={()=>{setData({...data,location:l}); setTimeout(()=>setStep(2),200);}} className={`h-[56px] rounded-full border text-[14px] tracking-widest font-medium ${data.location===l?'bg-white text-black border-white':'border-zinc-800 bg-transparent'}`}>{l}</button>
                ))}
              </div>
            </div>
          )}

          {step===2 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 2 — DATE</div>
              <div className="grid grid-cols-2 gap-3">
                {['TONIGHT','TOMORROW','THIS WEEKEND','NEXT WEEK'].map(d=>(
                  <button key={d} onClick={()=>{setData({...data,date:d}); setStep(3);}} className={`h-[56px] rounded-full border text-[13px] tracking-widest ${data.date===d?'bg-white text-black':'border-zinc-800'}`}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 3 — TIME</div>
              <div className="grid grid-cols-3 gap-3">
                {times.map(t=>(
                  <button key={t} onClick={()=>{setData({...data,time:t}); setStep(4);}} className={`h-[56px] rounded-full border text-[13px] tracking-widest ${data.time===t?'bg-white text-black border-white':'border-zinc-800'}`}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {step===4 && (
            <div>
              <div className="text-[12px] tracking-[0.2em] text-zinc-500 mb-4">STEP 4 — TYPE</div>
              <div className="grid grid-cols-2 gap-3">
                {types.map(tp=>(
                  <button key={tp} onClick={()=>{setData({...data,type:tp}); setStep(5);}} className={`h-[56px] rounded-full border text-[13px] tracking-widest ${data.type===tp?'bg-white text-black':'border-zinc-800'}`}>{tp}</button>
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
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">LOCATION</span><span className="tracking-widest">{data.location} · {data.venue}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">DATE & TIME</span><span className="tracking-widest">{data.date} {data.time}</span></div>
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
