
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthContent(){
  const sp = useSearchParams();
  const router = useRouter();
  const redirect = sp.get('redirect') || '/venues';
  const action = sp.get('action') || 'join';
  const venue = sp.get('venue') || '';
  const [mode,setMode]=useState('create');
  const [loginForm,setLoginForm]=useState({email:'', password:''});

  const handleLogin = ()=>{
    if(!loginForm.email || !loginForm.password){ alert('Enter email and password'); return; }
    localStorage.setItem('buddy_registered','1');
    localStorage.setItem('buddy_verified_phone','guest');
    localStorage.setItem('buddy_card_saved','1');
    localStorage.setItem('buddy_card_last4','4242');
    router.push(redirect + '?paid=false&auth=1&venue_id=' + venue);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <div className="relative bg-gradient-to-b from-violet-600 to-zinc-900 p-8 flex flex-col justify-between min-h-[600px]">
          <div className="flex justify-between items-center">
            <div className="text-lg font-black tracking-widest">BB</div>
            <button onClick={()=>router.push('/')} className="px-4 py-2 rounded-full bg-white text-black text-xs">Back to website</button>
          </div>
          <div className="mt-auto">
            <h2 className="text-2xl font-serif leading-tight">Capturing Moments, Creating Memories</h2>
            <p className="mt-3 text-xs text-white opacity-70">Buddy Blind - You do not know who you will meet. Browse venues free, join when ready.</p>
          </div>
        </div>
        <div className="bg-zinc-900 p-8">
          <h1 className="text-2xl font-black">Create an account</h1>
          <div className="mt-2 text-xs text-zinc-500">Already have an account? <button onClick={()=>setMode(mode==='create'?'login':'create')} className="underline text-white">{mode==='create'?'Log in':'Create account'}</button></div>
          {mode==='login' ? (
            <div className="mt-8 space-y-4">
              <div className="text-xs tracking-widest text-zinc-500">LOGIN Guest can browse, login only on JOIN or INVITE</div>
              <input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="Email" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="Password" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <button onClick={handleLogin} className="w-full h-12 rounded-full bg-violet-600 text-white font-black text-xs">Log in Continue to {action}</button>
              <div className="text-xs text-zinc-600">DEV Any email password works Test card 4242 4242 4242 4242 Exp 12 34 CVC 123 OTP 123456</div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="text-xs tracking-widest text-zinc-500 mb-2">REGISTER After this, 1-click JOIN or INVITE no retyping card</div>
              <RegisterInline onComplete={()=>{ localStorage.setItem('buddy_registered','1'); router.push(redirect + '?paid=false&auth=1&venue_id=' + venue); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterInline({onComplete}:{onComplete:(data:any)=>void}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',exactAge:'',ageRange:'23-28',gender:'Male',orientation:'',phone:'',password:'',confirmPassword:'',otp:'',agreeTerms:false,agreeTrial:false});
  const [realOtp,setRealOtp]=useState(''); const [sent,setSent]=useState(false); const [paying,setPaying]=useState(false);
  const AGE_RANGES=['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53plus'];
  const GENDERS=['Male','Female','Non-binary','Trans','Prefer not to say'];
  const ORIENTATIONS=['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];
  const getRange=(age:number)=>{ if(age<18) return '18-23'; if(age>=53) return '53plus'; return AGE_RANGES[Math.min(Math.floor((age-18)/5), AGE_RANGES.length-1)]; };
  const sendOtp=()=>{ if(!form.phone){alert('Phone MUST'); return;} const c=Math.floor(100000+Math.random()*900000).toString(); setRealOtp(c); setSent(true); alert('DEV OTP ' + c + ' Use 123456'); };
  const subscribe=async()=>{
    if(form.password.length<6) return alert('Password min 6');
    if(form.password!==form.confirmPassword) return alert('Confirm not match');
    if(form.otp!==realOtp && form.otp!=='123456') return alert('OTP wrong use 123456');
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
          <div className="grid grid-cols-2 gap-3"><input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/><input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/></div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <div className="grid grid-cols-2 gap-3"><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs">{GENDERS.map(g=><option key={g}>{g}</option>)}</select><select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs"><option value="">Orientation Optional</option>{ORIENTATIONS.map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><input value={form.exactAge} onChange={e=>{ const v=e.target.value; const n=parseInt(v); setForm({...form,exactAge:v,ageRange:isNaN(n)?form.ageRange:getRange(n)}); }} placeholder="Age e.g. 18" type="number" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/><div className="h-11 rounded-xl bg-zinc-800 border border-zinc-700 px-3 flex items-center text-xs">Auto <span className="ml-2 font-bold text-white">{form.ageRange}</span></div></div>
          <div className="flex gap-2"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST for OTP" className="flex-1 h-11 rounded-xl bg-black border border-amber-400 px-3 text-xs outline-none"/><button onClick={sendOtp} className="px-4 h-11 rounded-full bg-white text-black font-black text-xs">SEND OTP</button></div>
          {sent && <div className="text-xs text-green-400">Use 123456</div>}
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password min 6" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm retype same" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP 123456" className="w-full h-11 rounded-xl bg-black border border-amber-400 px-3 text-xs text-center outline-none"/>
          <label className="flex gap-2 text-xs text-zinc-400"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})} className="accent-white"/>I agree to Terms and Conditions</label>
          <button disabled={!form.firstName||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-30">Next 90-Day Free Trial</button>
        </>
      )}
      {step===2 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold">BuddyBlind Featured in 100plus countries</div>
            {['Enjoy first 90 days free','Cancel from app or iCloud','Quick match and blind dinners','Detailed venue info','90 days Free Trial','Only 50 per month after'].map((t,i)=><div key={i} className="flex gap-2"><div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs text-black">v</div>{t}</div>)}
          </div>
          <div className="mt-4 text-center text-sm font-bold">Try 90 days free then 50 per month</div>
          <button onClick={()=>setStep(3)} className="mt-3 w-full h-12 rounded-full bg-white text-black font-black text-sm">Continue</button>
          <button onClick={()=>setStep(1)} className="mt-2 w-full h-10 rounded-full border border-zinc-800 text-xs">BACK</button>
        </div>
      )}
      {step===3 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between"><span className="text-xs tracking-widest text-zinc-500">PREMIUM</span><span className="font-black">50 per mo</span></div>
            <div className="bg-zinc-900 border border-amber-400 rounded-lg p-2 text-xs font-mono">4242 4242 4242 4242 Exp 12 34 CVC 123 Test User OTP 123456</div>
            <div className="text-xs text-zinc-500 leading-relaxed">90-DAY FREE 5 admin per join plus 88 deposit at venue Blind dining address 2h before 18plus respectful Photos coloured different per event</div>
          </div>
          <label className="mt-3 flex gap-2 text-xs text-zinc-400 bg-zinc-900 rounded-lg p-2 border border-zinc-800"><input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})} className="accent-violet-600"/>I agree 90-DAY FREE then 50 per mo saved Visa 4242 for 1-click</label>
          <div className="mt-3 flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 h-12 rounded-full border border-zinc-700 text-xs">BACK</button><button disabled={paying||!form.agreeTrial} onClick={subscribe} className="flex-1 h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-50">{paying?'...':'Subscribe Confirm'}</button></div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage(){ return <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading auth...</div>}><AuthContent/></Suspense>; }
