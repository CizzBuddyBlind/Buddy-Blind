
'use client';
import { useState } from 'react';

type Props = { isOpen: boolean; onClose: () => void; onComplete: (data:any)=>void; venueName?: string; };

export default function RegisterFlow({isOpen,onClose,onComplete,venueName}:Props){
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
      const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500, venue_id:venueName||'register'})});
      const j=await r.json();
      if(j.error) throw new Error(j.error);
      await new Promise(res=>setTimeout(res,800));
      if(typeof window!=='undefined'){
        localStorage.setItem('buddy_verified_phone',form.phone);
        localStorage.setItem('buddy_user',JSON.stringify(form));
        localStorage.setItem('buddy_card_saved','1');
        localStorage.setItem('buddy_card_last4','4242');
        localStorage.setItem('buddy_registered','1');
      }
      setPaying(false);
      onComplete(form);
    }catch(e:any){ setPaying(false); alert(e.message); }
  };
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-zinc-800 rounded-3xl p-8 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black">Create an account</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">X</button>
        </div>
        <div className="mt-1 text-xs text-zinc-500">Already have an account? <span className="underline">Log in</span></div>
        {step===1 && (
          <div className="mt-6 space-y-4">
            <div className="text-xs tracking-widest text-zinc-500">STEP 1 IDENTITY Gender Age 5yr gap Orientation Optional Phone MUST</div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
            </div>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm">
                {GENDERS.map(g=><option key={g}>{g}</option>)}
              </select>
              <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm">
                <option value="">Orientation Optional</option>
                {ORIENTATIONS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.exactAge} onChange={e=>{ const v=e.target.value; const n=parseInt(v); setForm({...form,exactAge:v,ageRange:isNaN(n)?form.ageRange:getRange(n)}); }} placeholder="Enter exact age e.g. 18" type="number" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <div className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 px-4 flex items-center text-sm text-zinc-400">Age range <span className="ml-2 text-white font-bold">{form.ageRange}</span></div>
            </div>
            <div className="flex gap-2">
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST for OTP" className="flex-1 h-12 rounded-xl bg-black border border-amber-400 px-4 text-sm outline-none"/>
              <button onClick={sendOtp} className="px-5 h-12 rounded-full bg-white text-black font-black text-xs">SEND OTP</button>
            </div>
            {sent && <div className="text-xs text-green-400 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg px-3 py-2">DEV OTP sent Use 123456 Real OTP needs Twilio later</div>}
            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Enter password min 6" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
            <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm password retype same" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
            <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP enter 123456" className="w-full h-12 rounded-xl bg-black border border-amber-400 px-4 text-sm text-center outline-none"/>
            <label className="flex gap-2 items-start text-xs text-zinc-400"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})} className="mt-1"/>I agree to Terms and Conditions</label>
            <button disabled={!form.firstName||!form.email||!form.phone||!form.exactAge} onClick={()=>setStep(2)} className="w-full h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-30">Next Free Trial</button>
          </div>
        )}
        {step===2 && (
          <div className="mt-6">
            <div className="text-xs tracking-widest text-zinc-500 mb-4">STEP 2 90-DAY FREE TRIAL Premium plan details</div>
            <div className="bg-black border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="text-sm font-bold">Featured in 100plus countries</div>
              <div className="text-xl font-black">BuddyBlind</div>
              <div className="space-y-2 mt-3">
                {['Enjoy your first 90 days free','Cancel from the app or your iCloud account','Quick match and immediate blind dinners','Detailed venue info and blind reasons','90 days Free Trial','Only 50 per month after billed monthly'].map((t,i)=>(
                  <div key={i} className="flex gap-2 items-center text-xs text-zinc-300"><div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs text-black">v</div>{t}</div>
                ))}
              </div>
            </div>
            <div className="mt-6 bg-neutral-800 rounded-2xl p-4">
              <div className="text-center text-sm font-bold">Try 90 days free then 50 per month</div>
              <button onClick={()=>setStep(3)} className="mt-4 w-full h-14 rounded-full bg-white text-black font-black text-base">Continue</button>
              <div className="mt-3 text-xs text-zinc-600 text-center">Terms of Use Subscription Terms Privacy Policy Restore</div>
            </div>
            <button onClick={()=>setStep(1)} className="mt-4 w-full h-11 rounded-full border border-zinc-800 text-xs">BACK</button>
          </div>
        )}
        {step===3 && (
          <div className="mt-6">
            <div className="text-xs tracking-widest text-zinc-500 mb-4">STEP 3 SUBSCRIBE Disclaimer Confirm from Features Bible</div>
            <div className="bg-black border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs tracking-widest text-zinc-500">PREMIUM PLAN</span><span className="text-xl font-black">50 per mo</span></div>
              <div className="bg-neutral-900 border border-amber-400 rounded-xl p-3">
                <div className="text-xs tracking-widest text-amber-300 font-bold">TEST CARD SAVED FOR 1-CLICK NEXT TIME</div>
                <div className="mt-2 text-xs text-zinc-300 font-mono">4242 4242 4242 4242 Exp 12 34 CVC 123 Test User OTP 123456</div>
              </div>
              <div className="text-xs leading-relaxed text-zinc-500 space-y-2">
                <div className="font-bold text-zinc-300">90-DAY FREE TRIAL Features Bible disclaimer</div>
                <div>Restaurants provide the scene Private events create the reason You bring curiosity</div>
                <div>Blind dining address sent 2h before event no menu shown before</div>
                <div>5 admin fee per blind box plus 88 deposit at venue Premium 50 per mo after 90-day free trial cancel anytime</div>
                <div>18plus only Be respectful No photos names before event</div>
              </div>
            </div>
            <label className="mt-4 flex gap-2 items-start text-xs text-zinc-400 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
              <input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})} className="mt-1"/>
              <span>I agree to 90-DAY FREE then 50 per month billed monthly Saved card Visa 4242 for 1-click next time</span>
            </label>
            <div className="mt-4 flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 h-12 rounded-full border border-zinc-700 text-xs">BACK</button>
              <button disabled={paying||!form.agreeTrial} onClick={subscribe} className="flex-1 h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-50">{paying ? 'SUBSCRIBING' : 'Subscribe Confirm'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
