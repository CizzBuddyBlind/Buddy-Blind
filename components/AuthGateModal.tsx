
'use client';
import { useState } from 'react';
const AGE=['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53+'];
const GENDERS=['Male','Female','Non-binary','Trans','Prefer not to say'];
const ORIENT=['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];

type Props = { isOpen: boolean; onClose: () => void; onSuccess?: () => void; onComplete?: () => void; onVerified?: (data:any) => void; venueName?: string; trigger?: string; };

export default function AuthGateModal({isOpen,onClose,onSuccess,onComplete,onVerified,venueName,trigger}:Props){
  const done = (d?:any)=>{ if(onVerified) onVerified(d||{}); if(onSuccess) onSuccess(); if(onComplete) onComplete(); };
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({username:'',ageRange:'23-28',gender:'Male',orientation:'Straight',phone:'',email:'',password:'',confirmPassword:'',otp:'',agree:false});
  const [real,setReal]=useState(''); const [sent,setSent]=useState(false);
  const [card,setCard]=useState({number:'4242 4242 4242 4242',exp:'12 / 34',cvc:'123',name:'Test User'});
  const [paying,setPaying]=useState(false);
  if(!isOpen) return null;
  const sendOtp=()=>{ const c=Math.floor(100000+Math.random()*900000).toString(); setReal(c); setSent(true); alert(`DEV OTP 已發送: ${c} - 你可以用 123456 直接過`); };
  const pay=async()=>{
    if(form.password.length<6) return alert('Password 最少6個字，你而家打咗 '+form.password.length);
    if(form.password!==form.confirmPassword) return alert('兩個Password唔同，Retype要打返一樣');
    if(form.otp!==real && form.otp!=='123456') return alert('OTP錯，用 123456 就得');
    if(!form.agree) return alert('要剔同意條款');
    if(!card.number||!card.exp||!card.cvc) return alert('填齊卡資料');
    setPaying(true);
    try{
      const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500,venue_id:venueName||trigger||'kissa'})});
      const j=await r.json();
      if(j.error) throw new Error(j.error);
      await new Promise(res=>setTimeout(res,900));
      if(typeof window!=='undefined'){ localStorage.setItem('buddy_verified_phone',form.phone); localStorage.setItem('buddy_user',JSON.stringify(form)); }
      setPaying(false); done(form); onClose(); setTimeout(()=>alert('BOOKED ✓ $5 已付，留喺 Buddy Blind 黑色 modal 入面，冇跳去白色 Stripe 網'),400);
    }catch(e:any){ setPaying(false); alert('Payment Error: '+e.message+' - 請檢查 Vercel 有冇 set STRIPE_SECRET_KEY'); }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-[20px] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center"><h2 className="text-[18px] font-black tracking-tight">JOIN {venueName||trigger||'BLIND BOX'}</h2><button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">✕</button></div>
        <div className="mt-2 text-[10px] tracking-[0.25em] text-zinc-500 font-bold">STEP {step}/3 • 黑色內置 • TEST CARD 已填好</div>

        {step===1 && (
          <div className="mt-8 space-y-4">
            <div className="text-[10px] tracking-[0.2em] text-amber-300 font-bold">IDENTITY • Username, Age, Gender, Orientation, Phone, Email</div>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Username (花名得)" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <div className="grid grid-cols-2 gap-3"><select value={form.ageRange} onChange={e=>setForm({...form,ageRange:e.target.value})} className="h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{AGE.map(a=><option key={a}>{a}</option>)}</select><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
            <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-5 text-[14px]">{ORIENT.map(o=><option key={o}>{o}</option>)}</select>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <div className="flex gap-2"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone +852 用嚟收 OTP" className="flex-1 h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/><button onClick={sendOtp} className="px-7 h-[52px] rounded-full bg-white text-black font-black text-[10px] tracking-widest">SEND OTP</button></div>
            {sent && <div className="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">✓ TEST OTP: 用 123456 就得，唔使等 SMS</div>}
            <button disabled={!form.username||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-[56px] rounded-full bg-white text-black font-black text-[12px] tracking-widest disabled:opacity-30">NEXT → PASSWORD</button>
          </div>
        )}

        {step===2 && (
          <div className="mt-8 space-y-4">
            <div className="text-[10px] tracking-[0.2em] text-amber-300 font-bold">PASSWORD • 最少6個字 + Confirm Retype + OTP</div>
            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Create password (最少6個字)" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm - 再打一次一樣嘅Password" className="w-full h-[52px] rounded-full bg-black border border-zinc-800 px-6 text-[14px] outline-none"/>
            <div className="text-[11px] text-zinc-500 flex justify-between"><span>{form.password.length}/6 min</span><span>Match: {form.password && form.password===form.confirmPassword?'✓ 啱':'✗ 唔啱'}</span></div>
            <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP - 打 123456" className="w-full h-[52px] rounded-full bg-black border border-amber-400/30 px-6 text-center tracking-[0.4em] text-[14px] outline-none"/>
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-[12px] p-3 text-[11px] text-amber-300">TEST OTP: 123456 (任何時候都得)</div>
            <div className="flex gap-3 pt-2"><button onClick={()=>setStep(1)} className="flex-1 h-[56px] rounded-full border border-zinc-700 font-black text-[12px] tracking-widest">BACK</button><button onClick={()=>{ if(form.password.length<6) return alert('最少6個字'); if(form.password!==form.confirmPassword) return alert('兩個Password唔同'); setStep(3); }} className="flex-1 h-[56px] rounded-full bg-white text-black font-black text-[12px] tracking-widest">NEXT → PAY $5</button></div>
          </div>
        )}

        {step===3 && (
          <div className="mt-8 space-y-5">
            <div className="text-[10px] tracking-[0.2em] text-amber-300 font-bold">PAY $5 ADMIN FEE • 黑色內置 • 唔會跳去白色 Stripe 頁</div>
            <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
              <div className="flex justify-between items-center"><span className="text-[10px] tracking-[0.2em] text-zinc-500">ADMIN FEE 一次性</span><span className="text-[22px] font-black">HK$5.00</span></div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="h-[48px] rounded-full bg-white text-black font-black text-[13px] flex items-center justify-center gap-1"> Pay</button>
                <button className="h-[48px] rounded-full bg-[#00D66F] text-black font-black text-[12px]">link</button>
              </div>

              <div className="flex items-center gap-3"><div className="h-[1px] flex-1 bg-zinc-800"/><span className="text-[10px] text-zinc-600">OR PAY WITH CARD</span><div className="h-[1px] flex-1 bg-zinc-800"/></div>

              <div className="bg-[#0A0A0A] border border-amber-400/20 rounded-[12px] p-3">
                <div className="text-[10px] tracking-[0.2em] text-amber-300 font-bold">TEST CARD 資料已填好 - 直接用得：</div>
                <div className="mt-2 text-[11px] text-zinc-300 space-y-1 font-mono">
                  <div>Card: 4242 4242 4242 4242 (Visa Test)</div>
                  <div>Exp: 12 / 34 (任何將來日期都得)</div>
                  <div>CVC: 123 (任何3位數都得)</div>
                  <div>Name: Test User (任何名都得)</div>
                  <div>OTP: 123456</div>
                </div>
              </div>

              <input value={card.number} onChange={e=>setCard({...card,number:e.target.value})} placeholder="4242 4242 4242 4242" className="w-full h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[15px] outline-none tracking-widest"/>
              <div className="grid grid-cols-2 gap-3"><input value={card.exp} onChange={e=>setCard({...card,exp:e.target.value})} placeholder="MM / YY - 例如 12 / 34" className="h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/><input value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value})} placeholder="CVC - 例如 123" className="h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/></div>
              <input value={card.name} onChange={e=>setCard({...card,name:e.target.value})} placeholder="Full name - 例如 Test User" className="w-full h-[52px] rounded-[16px] bg-[#0A0A0A] border border-zinc-800 px-5 text-[14px] outline-none"/>

              <div className="text-[10px] text-zinc-500 leading-relaxed">其他可用 Test Cards: 4000 0000 0000 9995 (insufficient funds 測試失敗), 4000 0025 0000 3155 (3D Secure 測試)</div>
            </div>

            <label className="flex gap-3 items-start text-[11px] text-zinc-400 bg-zinc-900/50 rounded-[12px] p-3 border border-zinc-800"><input type="checkbox" checked={form.agree} onChange={e=>setForm({...form,agree:e.target.checked})} className="mt-1 accent-white"/><span>90-DAY FREE TRIAL • $50/mo 之後先收 • $5 admin 一次性 • $88 deposit 到場先收 • Blind dining: 地址活動前2小時先話你知，冇餐牌 • 18+ 要尊重 • 撳 Pay 即代表同意。</span></label>

            <div className="flex gap-3"><button onClick={()=>setStep(2)} className="flex-1 h-[56px] rounded-full border border-zinc-700 font-black text-[12px] tracking-widest">BACK</button><button disabled={paying||!form.agree} onClick={pay} className="flex-1 h-[56px] rounded-full bg-amber-400 text-black font-black text-[12px] tracking-widest disabled:opacity-50">{paying?'PAYING...':'PAY HK$5 → BOOK'}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
