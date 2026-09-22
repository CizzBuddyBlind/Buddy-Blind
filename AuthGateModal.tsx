'use client';
import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (data: any) => void;
  trigger: 'invite' | 'join' | 'premium' | 'host';
};

const AGE_RANGES = ['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53+'];
const GENDERS = ['Male','Female','Non-binary','Trans','Prefer not to say'];
const ORIENTATIONS = ['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say'];

export default function AuthGateModal({ isOpen, onClose, onVerified, trigger }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '', ageRange: '23-28', gender: 'Male', orientation: 'Straight',
    phone: '', email: '', password: '', confirmPassword: '', otp: '', paymentMethod: 'card', agree: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [realOtp, setRealOtp] = useState('');

  if (!isOpen) return null;

  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random()*900000).toString();
    setRealOtp(code);
    setOtpSent(true);
    alert(`[DEV] OTP code for ${form.phone}: ${code} - In prod this sends via SMS. Use 123456 also works.`);
    console.log('OTP:', code);
  };

  const verifyAndContinue = () => {
    if (form.otp !== realOtp && form.otp !== '123456') return alert('Wrong OTP - try 123456');
    if (!form.agree) return alert('Please agree to disclaimer');
    if (form.password !== form.confirmPassword) return alert('Passwords do not match');
    if (form.password.length < 6) return alert('Password min 6 chars');
    localStorage.setItem('buddy_verified_phone', form.phone);
    localStorage.setItem('buddy_user', JSON.stringify(form));
    onVerified(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111] border border-zinc-800 rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">JOIN BUDDY BLIND</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">✕</button>
        </div>
        <div className="mt-2 text-[11px] tracking-widest text-zinc-500">STEP {step} OF 4 • {trigger.toUpperCase()} FLOW</div>
        
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div className="text-[11px] tracking-widest text-amber-300">BASIC INFO</div>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Username (public, can be nickname)" className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.ageRange} onChange={e=>setForm({...form,ageRange:e.target.value})} className="h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm">
                {AGE_RANGES.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
              <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm">
                {GENDERS.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <select value={form.orientation} onChange={e=>setForm({...form,orientation:e.target.value})} className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm">
              {ORIENTATIONS.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address" type="email" className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm" />
            <div className="flex gap-2">
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone for OTP (e.g. +852 9xxx xxxx)" className="flex-1 h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm" />
              <button onClick={sendOtp} className="px-6 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-widest">SEND OTP</button>
            </div>
            {otpSent && <div className="text-[11px] text-amber-300">OTP sent to {form.phone} - check alert / console</div>}
            <button disabled={!form.username||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-12 rounded-full bg-white text-black font-black text-xs tracking-widest disabled:opacity-30">NEXT → PASSWORD</button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <div className="text-[11px] tracking-widest text-amber-300">CREATE PASSWORD</div>
            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Create password (min 6 chars)" type="password" className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm" />
            <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Confirm password - retype" type="password" className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm" />
            <div className="flex gap-3">
              <button onClick={()=>setStep(1)} className="flex-1 h-12 rounded-full border border-zinc-700 text-white font-black text-xs tracking-widest">BACK</button>
              <button onClick={()=>{ if(form.password!==form.confirmPassword) return alert('Passwords mismatch'); if(form.password.length<6) return alert('Min 6'); setStep(3); }} className="flex-1 h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">NEXT → VERIFY OTP</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="text-[11px] tracking-widest text-amber-300">VERIFY PHONE • FREE TRIAL</div>
            <p className="text-sm text-zinc-500">Enter OTP sent to {form.phone}. Then choose payment for 90-day free trial.</p>
            <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="Enter 6-digit OTP (123456 works for test)" className="w-full h-12 rounded-full bg-black border border-zinc-800 px-6 text-sm tracking-[0.3em] text-center" />
            <div className="text-[11px] tracking-widest text-zinc-600 mt-4">PAYMENT METHOD FOR FREE TRIAL (no charge today)</div>
            <div className="grid grid-cols-3 gap-2">
              {['card','apple_pay','google_pay'].map(m=>(
                <button key={m} onClick={()=>setForm({...form,paymentMethod:m})} className={`h-12 rounded-full border text-[11px] font-bold tracking-widest ${form.paymentMethod===m?'bg-white text-black border-white':'bg-black text-zinc-500 border-zinc-800'}`}>{m.toUpperCase()}</button>
              ))}
            </div>
            <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-500 leading-relaxed">
              <b className="text-white">HEART PREMIUM - 90 DAY FREE TRIAL:</b> No charge today. After trial, $50/mo. Cancel anytime in settings. 1 invite = $5 admin fee. Blind dining: you agree that venue address revealed 2h before, no menu disclosed, photos optional, respectful behavior required. See full Features Bible disclaimer.
            </div>
            <label className="flex gap-3 items-start text-[11px] text-zinc-400">
              <input type="checkbox" checked={form.agree} onChange={e=>setForm({...form,agree:e.target.checked})} className="mt-1" />
              <span>I agree to disclaimer, 18+ only, respectful community, no harassment, OTP verified identity. I understand $5 admin fee per booking, $88 deposit at venue.</span>
            </label>
            <div className="flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 h-12 rounded-full border border-zinc-700 text-white font-black text-xs tracking-widest">BACK</button>
              <button onClick={verifyAndContinue} className="flex-1 h-12 rounded-full bg-amber-400 text-black font-black text-xs tracking-widest">VERIFY & START TRIAL →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
