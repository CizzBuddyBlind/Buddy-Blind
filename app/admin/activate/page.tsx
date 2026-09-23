
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ActivateContent(){
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get('token') || '';
  const [email,setEmail]=useState('');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [status,setStatus]=useState('');
  const [valid,setValid]=useState(false);

  useEffect(()=>{
    if(!token){ setStatus('Invalid activation link - No token'); return; }
    const invites = JSON.parse(localStorage.getItem('bb_admin_invites')||'[]');
    const admins = JSON.parse(localStorage.getItem('bb_admins')||'[]');
    const invite = invites.find((i:any)=>i.token===token);
    const admin = admins.find((a:any)=>a.token===token);
    if(invite || admin){
      const em = invite?.email || admin?.email;
      setEmail(em);
      setValid(true);
      setStatus('Valid invitation for ' + em);
    } else {
      // Check if token is mock - allow for demo
      if(token.startsWith('admin-invite-')){
        setValid(true);
        setStatus('Valid invitation (mock) - Token ' + token.slice(0,20));
      } else {
        setStatus('Invalid or expired token - Ask Founder to re-assign');
      }
    }
  },[token]);

  const handleActivate = () => {
    if(!username){ setStatus('Enter Admin username'); return; }
    if(password.length<6){ setStatus('Password min 6 chars'); return; }
    if(password!==confirm){ setStatus('Passwords do not match'); return; }
    if(!email){ setStatus('Email missing'); return; }

    const creds = JSON.parse(localStorage.getItem('bb_admin_creds')||'{}');
    creds[email.toLowerCase()] = { name: username, password, role: 'admin', activatedAt: new Date().toISOString() };
    localStorage.setItem('bb_admin_creds', JSON.stringify(creds));

    // Update admin status to active
    let admins = JSON.parse(localStorage.getItem('bb_admins')||'[]');
    admins = admins.map((a:any)=> a.email.toLowerCase()===email.toLowerCase() ? {...a, status:'active', name: username, activatedAt: new Date().toISOString()} : a);
    if(!admins.find((a:any)=>a.email.toLowerCase()===email.toLowerCase())){
      admins.push({email: email.toLowerCase(), role:'admin', status:'active', invitedAt: new Date().toISOString(), activatedAt: new Date().toISOString(), name: username, token});
    }
    localStorage.setItem('bb_admins', JSON.stringify(admins));

    // Remove invite
    let invites = JSON.parse(localStorage.getItem('bb_admin_invites')||'[]');
    invites = invites.filter((i:any)=>i.token!==token);
    localStorage.setItem('bb_admin_invites', JSON.stringify(invites));

    setStatus('Admin Account activated! You can now use normal Login button - System will recognise Admin authority and auto turn to Admin Edit Mode. Redirecting to login...');
    setTimeout(()=>{ router.push('/auth?activated=1&email=' + email); }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center">←</Link>
          <span className="mono text-[10px] tracking-[0.14em] text-zinc-500">BACK</span>
        </div>

        <div className="mt-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#C45A3C]/20 border border-[#C45A3C]/30 flex items-center justify-center mx-auto text-[20px]">✉</div>
          <h1 className="mt-4 font-serif text-[22px]">Activate Admin Account</h1>
          <p className="mt-2 mono text-[10px] tracking-[0.14em] text-zinc-500">Founder → Assign → Email → Click → Create Username/Password → Activated</p>
        </div>

        <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-4">
          <div className="mono text-[11px] text-white">Invitation Details</div>
          <div className="mt-2 text-[11px] text-zinc-400">Token: {token.slice(0,30)}...</div>
          <div className="mt-1 text-[11px] text-zinc-400">Email: {email || 'Loading...'}</div>
          <div className="mt-2 mono text-[10px] text-zinc-600">Full process: Founder assigns Admin → Team member receives email → Clicks activation link → Creates Admin username & password → Admin Account activated → Uses normal Login button → System recognises Admin → Auto Admin Edit Mode</div>
        </div>

        {valid ? (
          <div className="mt-6 space-y-3">
            <div className="mono text-[11px] text-zinc-400">Create Admin username & Admin password</div>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Admin username e.g. Alan Admin" className="w-full h-11 rounded-full bg-black border border-zinc-700 px-5 text-[13px] focus:border-orange-500 outline-none" />
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Admin password min 6" className="w-full h-11 rounded-full bg-black border border-zinc-700 px-5 text-[13px] focus:border-orange-500 outline-none" />
            <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" placeholder="Confirm password" className="w-full h-11 rounded-full bg-black border border-zinc-700 px-5 text-[13px] focus:border-orange-500 outline-none" />
            <button onClick={handleActivate} className="w-full h-12 rounded-full bg-[#C45A3C] text-white font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition">Activate Admin Account</button>
            <div className="text-center mono text-[10px] text-zinc-500">After activation, use normal Login button on Buddy Blind - No separate public Admin Login button - System auto recognises Admin authority and turns website into Admin Edit Mode</div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 text-[11px] text-red-400">{status}</div>
            <Link href="/" className="mt-4 block w-full h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] flex items-center justify-center">Back to Website</Link>
          </div>
        )}

        {status && <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-300">{status}</div>}
      </div>
    </div>
  );
}

export default function ActivatePage(){
  return <Suspense fallback={<div className="min-h-screen bg-black"/>}><ActivateContent/></Suspense>;
}
