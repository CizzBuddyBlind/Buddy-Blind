
'use client';
import { useState } from 'react';
const AGE=['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53+'];
const GENDERS=['Male','Female','Non-binary','Trans','Prefer not to say'];
const ORIENT=['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];
export default function AuthGateModal({isOpen,onClose,onSuccess,venueName}:{isOpen:boolean;onClose:()=>void;onSuccess:()=>void;venueName?:string}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({username:'',ageRange:'23-28',gender:'Male',orientation:'Straight',phone:'',email:'',password:'',confirmPassword:'',otp:'',agree:false});
  const [real,setReal]=useState(''); const [sent,setSent]=useState(false);
  const [card,setCard]=useState({number:'',exp:'',cvc:'',name:''});
  const [paying,setPaying]=useState(false);
  if(!isOpen) return null;
  const sendOtp=()=>{ const c=Math.floor(100000+Math.random()*900000).toString(); setReal(c); setSent(true); alert(`DEV OTP ${c} - use 123456`); };
  const pay=async()=>{
    if(form.password.length<6) return alert('Min 6 chars');
    if(form.password!==form.confirmPassword) return alert('Mismatch');
    if(form.otp!==real && form.otp!=='123456') return alert('Wrong OTP use 123456');
    if(!form.agree) return alert('Agree disclaimer');
    if(!card.number||!card.exp||!card.cvc) return alert('Fill card');
    setPaying(true);
    try{ const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500,venue_id:venueName||'kissa'})}); await r.json(); await new Promise(res=>setTimeout(res,1000)); localStorage.setItem('buddy_verified_phone',form.phone); localStorage.setItem('buddy_user',JSON.stringify(form)); setPaying(false); onSuccess(); onClose(); setTimeout(()=>alert('BOOKED ✓ $5 paid - stays inside Buddy Blind'),400);}catch(e:any){ setPaying(false); alert(e.message); }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-[20px] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center"><h2 className="text-[18px] font-black tracking-tight mono">JOIN {venueName||'BLIND BOX'}</h2><button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">✕</button></div>
        <div className="mt-2 mono text-[10px] tracking-[0.25em] text-zinc-500 font-bold">STEP {step}/3 • EMBEDDED CHECKOUT</div>
        {step===1 && (
          <div className="mt-8 space-y-4">
            <div className="mono text-[10px] tracking-[0.2em] text-amber-300 font-bold">IDENTITY • FEATURES BIBLE</div>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Username" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <div className="grid grid-cols-2 gap-3"><select value={form.ageRange} onChange={e=>setForm({...form,ageRange:e.target.value})} className="h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{AGE.map(a=><option key={a}>{a}</option>)}</select><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
            <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{ORIENT.map(o=><option key={o}>{o}</option>)}</select>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <div className="flex gap-2"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone for OTP" className="flex-1 h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/><button onClick={sendOtp} className="px-7 h-[52px] rounded-full bg-white text-black font-black text-[10px] tracking-widest">SEND OTP</button></div>
            {sent && <div className="text-[11px] text-amber-300">✓ Use 123456</div>}
            <button disabled={!form.username||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-[56px] rounded-full bg-white text-black font-black text-[12px] tracking-widest disabled:opacity-30">NEXT → PASSWORD</button>
          </div>
        )}
        {step===2 && (
          <div className="mt-8 space-y-4">
            <div className="mono text-[10px] tracking-[0.2em] text-amber-300 font-bold">PASSWORD • 6+ CHARS • OTP</div>
            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Create password (min 6)" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm retype" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP 123456" className="w-full h-[52px] rounded-full bg-black border border-amber-400/30 px-6 text-center tracking-[0.4em] text-[14px] outline-none"/>
            <div className="flex gap-3 pt-2"><button onClick={()=>setStep(1)} className="flex-1 h-[56px] rounded-full border border-zinc-700 font-black text-[12px] tracking-widest">BACK</button><button onClick={()=>{ if(form.password.length<6) return alert('Min 6'); if(form.password!==form.confirmPassword) return alert('Mismatch'); setStep(3); }} className="flex-1 h-[56px] rounded-full bg-white text-black font-black text-[12px] tracking-widest">NEXT → PAY $5</button></div>
          </div>
        )}
        {step===3 && (
          <div className="mt-8 space-y-5">
            <div className="mono text-[10px] tracking-[0.2em] text-amber-300 font-bold">PAY $5 ADMIN • NO STRIPE REDIRECT</div>
            <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
              <div className="flex justify-between"><span className="mono text-[10px] text-zinc-500">ADMIN FEE</span><span className="text-[22px] font-black">HK$5.00</span></div>
              <div className="grid grid-cols-2 gap-3"><button className="h-[48px] rounded-full bg-white text-black font-black text-[13px]"> Pay</button><button className="h-[48px] rounded-full bg-[#00D66F] text-black font-black text-[12px]">link</button></div>
              <input value={card.number} onChange={e=>setCard({...card,number:e.target.value})} placeholder="4242 4242 4242 4242" className="w-full h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[15px] outline-none"/>
              <div className="grid grid-cols-2 gap-3"><input value={card.exp} onChange={e=>setCard({...card,exp:e.target.value})} placeholder="MM / YY" className="h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/><input value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value})} placeholder="CVC" className="h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/></div>
              <input value={card.name} onChange={e=>setCard({...card,name:e.target.value})} placeholder="Full name" className="w-full h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/>
            </div>
            <label className="flex gap-3 items-start text-[11px] text-zinc-400"><input type="checkbox" checked={form.agree} onChange={e=>setForm({...form,agree:e.target.checked})} className="mt-1 accent-white"/><span>90-DAY FREE • $50/mo after • Cancel anytime • $5 admin • 18+ respectful.</span></label>
            <div className="flex gap-3"><button onClick={()=>setStep(2)} className="flex-1 h-[56px] rounded-full border border-zinc-700 font-black text-[12px] tracking-widest">BACK</button><button disabled={paying} onClick={pay} className="flex-1 h-[56px] rounded-full bg-amber-400 text-black font-black text-[12px] tracking-widest disabled:opacity-50">{paying?'PAYING...':'PAY HK$5 → BOOK'}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
