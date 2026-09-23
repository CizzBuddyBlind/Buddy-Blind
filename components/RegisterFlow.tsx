
'use client';
import { useState } from 'react';

const GENDERS = ['Male','Female','Non-binary','Trans','Prefer not to say'];
const ORIENTATIONS = ['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];
const AGE_RANGES = ['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53+'];

function getAgeRangeFromExact(age: number): string {
  if (age < 18) return '18-23';
  if (age >= 53) return '53+';
  const idx = Math.floor((age - 18) / 5);
  return AGE_RANGES[Math.min(idx, AGE_RANGES.length-1)];
}

type Props = { isOpen: boolean; onClose: () => void; onComplete: (data:any)=>void; venueName?: string; };

export default function RegisterFlow({isOpen,onClose,onComplete,venueName}:Props){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({
    firstName:'', lastName:'', email:'', exactAge:'', ageRange:'23-28',
    gender:'Male', orientation:'', phone:'', password:'', confirmPassword:'', otp:'', agreeTerms:false, agreeTrial:false
  });
  const [realOtp,setRealOtp]=useState('');
  const [sent,setSent]=useState(false);
  const [paying,setPaying]=useState(false);

  if(!isOpen) return null;

  const handleAgeChange = (val:string)=>{
    const num = parseInt(val);
    if(!isNaN(num)){
      setForm({...form, exactAge: val, ageRange: getAgeRangeFromExact(num)});
    } else {
      setForm({...form, exactAge: val});
    }
  };

  const sendOtp = ()=>{
    if(!form.phone){ alert('Phone must - 填電話號碼'); return; }
    const code = Math.floor(100000+Math.random()*900000).toString();
    setRealOtp(code);
    setSent(true);
    alert(`DEV OTP: ${code} - 直接用 123456 就得\n\nReal OTP setup later:\n1. Create Twilio account at twilio.com\n2. Get Account SID + Auth Token + Phone Number\n3. Add to Vercel ENV: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER\n4. Create /api/otp/send route`);
  };

  const handleSubscribe = async ()=>{
    if(form.password.length<6) return alert('Password 最少6個字');
    if(form.password!==form.confirmPassword) return alert('Confirm password 唔同');
    if(form.otp!==realOtp && form.otp!=='123456') return alert('OTP錯，用 123456');
    if(!form.agreeTerms) return alert('要同意 Terms & Conditions');
    if(!form.agreeTrial) return alert('要同意 90-day free trial');
    setPaying(true);
    try{
      const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500,venue_id:venueName||'register',type:'premium'})});
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-[20px] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] font-black tracking-tight">Create an account</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[12px]">✕</button>
        </div>
        <div className="mt-1 text-[11px] text-zinc-500">Already have an account? <span className="underline cursor-pointer">Log in</span></div>

        {step===1 && (
          <div className="mt-6 space-y-4">
            <div className="text-[10px] tracking-[0.2em] text-zinc-500">STEP 1 — IDENTITY • Gender, Age (5yr gap), Orientation (Optional), Phone MUST</div>
            
            <div className="grid grid-cols-2 gap-3">
              <input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
              <input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
            </div>

            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>

            <div className="grid grid-cols-2 gap-3">
              <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px]">
                {GENDERS.map(g=><option key={g}>{g}</option>)}
              </select>
              <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px]">
                <option value="">Orientation (Optional)</option>
                {ORIENTATIONS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input value={form.exactAge} onChange={e=>handleAgeChange(e.target.value)} placeholder="Enter exact age e.g. 18" type="number" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
                <div className="mt-1 text-[10px] text-amber-300">Auto → {form.ageRange} (5yr gap)</div>
              </div>
              <div className="h-[48px] rounded-[12px] bg-zinc-900 border border-zinc-800 px-4 flex items-center text-[13px] text-zinc-400">
                Age range: <span className="ml-2 text-white font-bold">{form.ageRange}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST for OTP +852" className="flex-1 h-[48px] rounded-[12px] bg-black border border-amber-400/30 px-4 text-[13px] outline-none"/>
              <button onClick={sendOtp} className="px-5 h-[48px] rounded-full bg-white text-black font-black text-[10px] tracking-widest">SEND OTP</button>
            </div>
            {sent && <div className="text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-[8px] px-3 py-2">✓ DEV OTP sent. Use 123456. Real OTP needs Twilio later (see alert).</div>}

            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Enter your password (min 6)" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
            <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm password - retype same" className="w-full h-[48px] rounded-[12px] bg-black border border-zinc-800 px-4 text-[13px] outline-none"/>
            <div className="text-[10px] text-zinc-500 flex justify-between"><span>{form.password.length}/6 min</span><span>{form.password && form.password===form.confirmPassword ? '✓ Match' : '✗ Not match'}</span></div>

            <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP - enter 123456" className="w-full h-[48px] rounded-[12px] bg-black border border-amber-400/30 px-4 text-[13px] text-center tracking-[0.3em] outline-none"/>

            <label className="flex gap-2 items-start text-[11px] text-zinc-400"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})} className="mt-1 accent-white"/>I agree to the <span className="underline">Terms & Conditions</span></label>

            <button disabled={!form.firstName||!form.email||!form.phone||!form.exactAge} onClick={()=>setStep(2)} className="w-full h-[52px] rounded-full bg-[#8B5CF6] text-white font-black text-[12px] tracking-widest disabled:opacity-30">Next → Free Trial</button>

            <div className="flex items-center gap-3 mt-4"><div className="h-[1px] flex-1 bg-zinc-800"/><span className="text-[10px] text-zinc-600">Or register with</span><div className="h-[1px] flex-1 bg-zinc-800"/></div>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-[44px] rounded-[12px] border border-zinc-800 bg-transparent text-[12px] flex items-center justify-center gap-2"><span className="text-[14px]">G</span> Google</button>
              <button className="h-[44px] rounded-[12px] border border-zinc-800 bg-transparent text-[12px] flex items-center justify-center gap-2"> Apple</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="mt-6">
            <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-4">STEP 2 — 90-DAY FREE TRIAL • Premium plan details</div>
            
            <div className="bg-black border border-zinc-800 rounded-[20px] p-5 space-y-3">
              <div className="text-[14px] font-bold">Featured in 100+ countries</div>
              <div className="text-[20px] font-black">BuddyBlind®</div>
              <div className="space-y-2 mt-3">
                {[
                  'Enjoy your first 90 days, it’s free',
                  'Cancel from the app or your iCloud account',
                  'Quick match & immediate blind dinners',
                  'Detailed venue info & blind reasons',
                  '90 days Free Trial',
                  'Only $50/month after, billed monthly'
                ].map((t,i)=>(
                  <div key={i} className="flex gap-2 items-center text-[12px] text-zinc-300"><div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-black">✓</div>{t}</div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#1A1A1A] rounded-[16px] p-4">
              <div className="text-center text-[14px] font-bold">Try 90 days free, then $50/month</div>
              <button onClick={()=>setStep(3)} className="mt-4 w-full h-[56px] rounded-full bg-white text-black font-black text-[16px]">Continue</button>
              <div className="mt-3 flex justify-between items-center text-[11px] text-zinc-500 bg-zinc-900 rounded-full px-4 py-2">
                <span>Remind me before the free trial ends</span>
                <div className="w-10 h-6 rounded-full bg-zinc-700 relative"><div className="w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5"/></div>
              </div>
              <div className="mt-3 text-[9px] text-zinc-600 text-center">Terms of Use | Subscription Terms | Privacy Policy | Restore</div>
            </div>

            <button onClick={()=>setStep(1)} className="mt-4 w-full h-[44px] rounded-full border border-zinc-800 text-[11px] tracking-widest">BACK</button>
          </div>
        )}

        {step===3 && (
          <div className="mt-6">
            <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-4">STEP 3 — SUBSCRIBE • Disclaimer + Confirm (from Features Bible)</div>
            
            <div className="bg-black border border-zinc-800 rounded-[20px] p-5 space-y-4">
              <div className="flex justify-between items-center"><span className="text-[10px] tracking-[0.2em] text-zinc-500">PREMIUM PLAN</span><span className="text-[20px] font-black">$50/mo</span></div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="h-[44px] rounded-full bg-white text-black font-black text-[12px]"> Pay</button>
                <button className="h-[44px] rounded-full bg-[#00D66F] text-black font-black text-[11px]">link</button>
              </div>

              <div className="bg-[#0A0A0A] border border-amber-400/20 rounded-[12px] p-3">
                <div className="text-[10px] tracking-[0.2em] text-amber-300 font-bold">TEST CARD SAVED FOR 1-CLICK NEXT TIME:</div>
                <div className="mt-2 text-[11px] text-zinc-300 font-mono">4242 4242 4242 4242 | 12/34 | 123 | Test User | OTP 123456</div>
              </div>

              <div className="text-[10px] leading-relaxed text-zinc-500 space-y-2">
                <div className="font-bold text-zinc-300">90-DAY FREE TRIAL • Features Bible disclaimer:</div>
                <div>• Restaurants provide the scene. Private events create the reason. You bring curiosity.</div>
                <div>• Blind dining: address sent 2h before event, no menu shown before.</div>
                <div>• $5 admin fee per blind box + $88 deposit at venue. Premium $50/mo after 90-day free trial, cancel anytime in app.</div>
                <div>• 18+ only. Be respectful. No photos/names before event - that's the point.</div>
                <div>• Photos always coloured, different photos per event, more heart, no repeats.</div>
                <div>• By subscribing, you agree to Terms & Conditions and authorize recurring $50/mo after trial unless cancelled.</div>
              </div>
            </div>

            <label className="mt-4 flex gap-2 items-start text-[11px] text-zinc-400 bg-zinc-900/50 rounded-[12px] p-3 border border-zinc-800">
              <input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})} className="mt-1 accent-[#8B5CF6]"/>
              <span>I agree to 90-DAY FREE, then $50/month, billed monthly. I understand $5 admin per join + $88 deposit at venue. Saved card Visa •••• 4242 for 1-click next time.</span>
            </label>

            <div className="mt-4 flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 h-[52px] rounded-full border border-zinc-700 text-[11px] tracking-widest">BACK</button>
              <button disabled={paying||!form.agreeTrial} onClick={handleSubscribe} className="flex-1 h-[52px] rounded-full bg-[#8B5CF6] text-white font-black text-[12px] tracking-widest disabled:opacity-50">
                {paying ? 'SUBSCRIBING...' : 'Subscribe → Confirm'}
              </button>
            </div>

            <div className="mt-3 text-[9px] text-zinc-600 text-center">Try 90 days free, then $50/month • Test: 4242 4242 4242 4242</div>
          </div>
        )}
      </div>
    </div>
  );
}
