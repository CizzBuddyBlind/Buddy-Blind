
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import RegisterFlow from '@/components/RegisterFlow';

function AuthContent(){
  const sp = useSearchParams();
  const router = useRouter();
  const redirect = sp.get('redirect') || '/venues';
  const action = sp.get('action') || 'join';
  const venue = sp.get('venue') || '';
  const [mode,setMode]=useState<'create'|'login'>('create');
  const [showRegister,setShowRegister]=useState(true);
  const [loginForm,setLoginForm]=useState({email:'', password:''});

  const handleLogin = ()=>{
    if(!loginForm.email || !loginForm.password){ alert('Enter email & password'); return; }
    // DEV login - accept any, save
    localStorage.setItem('buddy_registered','1');
    localStorage.setItem('buddy_verified_phone','+852 guest');
    localStorage.setItem('buddy_user',JSON.stringify({email:loginForm.email}));
    localStorage.setItem('buddy_card_saved','1');
    localStorage.setItem('buddy_card_last4','4242');
    router.push(`${redirect}?paid=false&auth=1&venue_id=${venue}`);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pt-[72px]">
      <div className="max-w-[1100px] mx-auto px-6 py-8 grid md:grid-cols-2 gap-0 rounded-[32px] overflow-hidden border border-zinc-800 bg-[#111]">
        {/* Left - AMU style image */}
        <div className="relative bg-gradient-to-b from-[#6B5BFF] to-[#1A1A1A] p-8 flex flex-col justify-between min-h-[600px]">
          <div className="flex justify-between items-center">
            <div className="text-[18px] font-black tracking-widest">BB</div>
            <button onClick={()=>router.push('/')} className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-[11px] tracking-widest">Back to website -></button>
          </div>
          <div className="mt-auto">
            <h2 className="text-[28px] font-serif leading-tight">Capturing Moments,<br/>Creating Memories</h2>
            <p className="mt-3 text-[12px] text-white/70">Buddy Blind — You don't know who you'll meet. Browse venues free, join when ready.</p>
            <div className="mt-6 flex gap-2"><div className="w-8 h-1 rounded-full bg-white/30"/><div className="w-8 h-1 rounded-full bg-white/30"/><div className="w-8 h-1 rounded-full bg-white"/></div>
          </div>
        </div>

        {/* Right - Auth form */}
        <div className="bg-[#1A1A1A] p-8">
          <h1 className="text-[28px] font-black">Create an account</h1>
          <div className="mt-2 text-[12px] text-zinc-500">Already have an account? <button onClick={()=>setMode(mode==='create'?'login':'create')} className="underline text-white">{mode==='create'?'Log in':'Create account'}</button></div>

          {mode==='login' ? (
            <div className="mt-8 space-y-4">
              <div className="text-[10px] tracking-[0.2em] text-zinc-500">LOGIN — Guest can browse, login only on JOIN/INVITE</div>
              <input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="Email" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
              <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="Password" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
              <button onClick={handleLogin} className="w-full h-[52px] rounded-full bg-[#8B5CF6] text-white font-black text-[12px] tracking-widest">Log in -> Continue to {action}</button>
              <div className="text-[10px] text-zinc-600">DEV: Any email/password works. Test: 4242 4242 4242 4242 Exp 12/34 CVC 123 OTP 123456</div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">REGISTER — After this, 1-click JOIN/INVITE, no retyping card</div>
              {/* Embed RegisterFlow inline but without outer modal wrapper */}
              <RegisterFlowInline onComplete={()=>{
                localStorage.setItem('buddy_registered','1');
                router.push(`${redirect}?paid=false&auth=1&venue_id=${venue}`);
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterFlowInline({onComplete}:{onComplete:(data:any)=>void}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',exactAge:'',ageRange:'23-28',gender:'Male',orientation:'',phone:'',password:'',confirmPassword:'',otp:'',agreeTerms:false,agreeTrial:false});
  const [realOtp,setRealOtp]=useState(''); const [sent,setSent]=useState(false); const [paying,setPaying]=useState(false);
  const AGE_RANGES=['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53+'];
  const GENDERS=['Male','Female','Non-binary','Trans','Prefer not to say'];
  const ORIENTATIONS=['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];
  const getRange=(age:number)=>{ if(age<18) return '18-23'; if(age>=53) return '53+'; return AGE_RANGES[Math.min(Math.floor((age-18)/5), AGE_RANGES.length-1)]; };

  const sendOtp=()=>{ if(!form.phone){alert('Phone MUST'); return;} const c=Math.floor(100000+Math.random()*900000).toString(); setRealOtp(c); setSent(true); alert(`DEV OTP: ${c} - Use 123456`); };

  const subscribe=async()=>{
    if(form.password.length<6) return alert('Password min 6');
    if(form.password!==form.confirmPassword) return alert('Confirm not match');
    if(form.otp!==realOtp && form.otp!=='123456') return alert('OTP wrong, use 123456');
    if(!form.agreeTerms) return alert('Agree Terms');
    if(!form.agreeTrial) return alert('Agree Trial');
    setPaying(true);
    try{
      const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500})});
      await r.json();
      localStorage.setItem('buddy_verified_phone',form.phone);
      localStorage.setItem('buddy_user',JSON.stringify(form));
      localStorage.setItem('buddy_card_saved','1'); localStorage.setItem('buddy_card_last4','4242');
      setPaying(false); onComplete(form);
    }catch(e:any){ setPaying(false); alert(e.message); }
  };

  return (
    <div className="space-y-4">
      {step===1 && (
        <>
          <div className="grid grid-cols-2 gap-3"><input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/><input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/></div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/>
          <div className="grid grid-cols-2 gap-3"><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px]">{GENDERS.map(g=><option key={g}>{g}</option>)}</select><select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px]"><option value="">Orientation (Optional)</option>{ORIENTATIONS.map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><input value={form.exactAge} onChange={e=>{ const v=e.target.value; const n=parseInt(v); setForm({...form,exactAge:v,ageRange:isNaN(n)?form.ageRange:getRange(n)}); }} placeholder="Age e.g. 18" type="number" className="h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/><div className="h-[44px] rounded-[10px] bg-zinc-900 border border-zinc-800 px-3 flex items-center text-[11px]">Auto -> <span className="ml-2 font-bold text-white">{form.ageRange}</span></div></div>
          <div className="flex gap-2"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST +852 for OTP" className="flex-1 h-[44px] rounded-[10px] bg-black border border-amber-400/30 px-3 text-[12px] outline-none"/><button onClick={sendOtp} className="px-4 h-[44px] rounded-full bg-white text-black font-black text-[10px]">SEND OTP</button></div>
          {sent && <div className="text-[10px] text-green-400">✓ Use 123456</div>}
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password min 6" className="w-full h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/>
          <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm retype same" className="w-full h-[44px] rounded-[10px] bg-black border border-zinc-800 px-3 text-[12px] outline-none"/>
          <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP 123456" className="w-full h-[44px] rounded-[10px] bg-black border border-amber-400/30 px-3 text-[12px] text-center tracking-[0.3em] outline-none"/>
          <label className="flex gap-2 text-[10px] text-zinc-400"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})} className="accent-white"/>I agree to Terms & Conditions</label>
          <button disabled={!form.firstName||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-[48px] rounded-full bg-[#8B5CF6] text-white font-black text-[11px] disabled:opacity-30">Next -> 90-Day Free Trial</button>
        </>
      )}
      {step===2 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-[16px] p-4 space-y-2 text-[11px]">
            <div className="font-bold">BuddyBlind® - Featured in 100+ countries</div>
            {['Enjoy first 90 days free','Cancel from app or iCloud','Quick match & blind dinners','Detailed venue info','90 days Free Trial','Only $50/month after'].map((t,i)=><div key={i} className="flex gap-2"><div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-black">✓</div>{t}</div>)}
          </div>
          <div className="mt-4 text-center text-[13px] font-bold">Try 90 days free, then $50/month</div>
          <button onClick={()=>setStep(3)} className="mt-3 w-full h-[52px] rounded-full bg-white text-black font-black text-[14px]">Continue</button>
          <button onClick={()=>setStep(1)} className="mt-2 w-full h-[40px] rounded-full border border-zinc-800 text-[10px]">BACK</button>
        </div>
      )}
      {step===3 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-[16px] p-4 space-y-3">
            <div className="flex justify-between"><span className="text-[10px] tracking-widest text-zinc-500">PREMIUM</span><span className="font-black">$50/mo</span></div>
            <div className="bg-[#0A0A0A] border border-amber-400/20 rounded-[10px] p-2 text-[10px] font-mono">4242 4242 4242 4242 | 12/34 | 123 | Test User | OTP 123456</div>
            <div className="text-[10px] text-zinc-500 leading-relaxed">90-DAY FREE - $5 admin per join + $88 deposit at venue - Blind dining address 2h before - 18+ respectful - Photos coloured, different per event</div>
          </div>
          <label className="mt-3 flex gap-2 text-[10px] text-zinc-400 bg-zinc-900/50 rounded-[10px] p-2 border border-zinc-800"><input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})} className="accent-[#8B5CF6]"/>I agree 90-DAY FREE then $50/mo, saved Visa ---- 4242 for 1-click</label>
          <div className="mt-3 flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 h-[48px] rounded-full border border-zinc-700 text-[10px]">BACK</button><button disabled={paying||!form.agreeTrial} onClick={subscribe} className="flex-1 h-[48px] rounded-full bg-[#8B5CF6] text-white font-black text-[11px] disabled:opacity-50">{paying?'...':'Subscribe -> Confirm'}</button></div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage(){ return <Suspense><AuthContent/></Suspense>; }
