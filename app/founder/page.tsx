
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function FounderPage(){
  const { isFounder, userEmail, assignAdmin, removeAdmin, getAdmins, getPendingInvites } = useAuth();
  const [emailInput,setEmailInput]=useState('');
  const [message,setMessage]=useState('');
  const [admins,setAdmins]=useState<any[]>([]);
  const [invites,setInvites]=useState<any[]>([]);
  const [lastToken,setLastToken]=useState('');

  useEffect(()=>{
    setAdmins(getAdmins());
    setInvites(getPendingInvites());
  },[]);

  const refresh = () => { setAdmins(getAdmins()); setInvites(getPendingInvites()); };

  const handleAssign = () => {
    if(!emailInput){ setMessage('Enter team member email e.g. alanmmm@gmail.com'); return; }
    const res = assignAdmin(emailInput);
    setMessage(res.message);
    if(res.success && res.token){
      setLastToken(res.token);
    }
    setEmailInput('');
    refresh();
  };

  const handleRemove = (email:string) => {
    if(!confirm(`Remove Admin authority from ${email}? They will no longer access Admin Edit Mode.`)) return;
    const res = removeAdmin(email);
    setMessage(res.message);
    refresh();
  };

  if(!isFounder){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 text-center">
          <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-800 flex items-center justify-center mx-auto">!</div>
          <h2 className="mt-4 font-serif text-[20px]">Founder Only</h2>
          <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">This page is only for Founder account controlled by founder (you). Founder can assign/remove Admin authority. Admin can access Admin Edit Mode. Normal user normal access. Login as founder@buddyblind.com / founder2025</p>
          <Link href="/" className="mt-6 block h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] flex items-center justify-center">Back to Website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center">←</Link>
          <span className="mono text-[10px] tracking-[0.14em] text-zinc-500">BACK</span>
          <span className="ml-2 text-[11px] bg-[#C45A3C] px-3 py-1 rounded-full">FOUNDER MODE</span>
        </div>

        <h1 className="mt-8 font-serif text-[32px] leading-tight">Founder → Assign Admin</h1>
        <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">Founder controlled by founder (you). Authority: Founder → Can assign/remove Admin → Admin → Can access Admin Edit Mode → Normal User → Normal website. No separate public Admin Login button. Same login button auto recognises role.</p>

        <div className="mt-8 bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7">
          <div className="mono text-[11px] tracking-[0.14em] text-white">ADMIN MANAGEMENT · Enter Team Member Email → Assign Admin</div>
          <div className="mt-1 mono text-[10px] text-zinc-500">Example: Alan joins team alanmmm@gmail.com → Founder enters email → Assign Admin → System sends Admin Invitation Email → Team member clicks Activate Admin Account → Creates username/password → Admin activated</div>
          
          <div className="mt-6 flex gap-3">
            <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="Team member email e.g. alanmmm@gmail.com" className="flex-1 h-12 rounded-full bg-black border border-zinc-700 px-5 text-[13px] focus:border-orange-500 outline-none" />
            <button onClick={handleAssign} className="px-6 h-12 rounded-full bg-[#C45A3C] text-white font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition">Assign Admin</button>
          </div>

          {message && <div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-300">{message}</div>}

          {lastToken && (
            <div className="mt-4 bg-orange-900/20 border border-orange-700/30 rounded-2xl p-4">
              <div className="mono text-[11px] text-orange-400">Admin Invitation Email (Mock - In production real email sent)</div>
              <div className="mt-2 text-[11px] text-zinc-400">To: {admins[admins.length-1]?.email} · From: Buddy Blind Founder · Subject: You have been invited as Admin</div>
              <div className="mt-3 bg-black border border-zinc-800 rounded-xl p-3">
                <div className="text-[12px] text-white">You have been assigned Admin authority by Founder. Click to activate:</div>
                <Link href={'/admin/activate?token=' + lastToken} className="mt-2 inline-block h-9 px-4 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">Activate Admin Account</Link>
                <div className="mt-2 mono text-[10px] text-zinc-600 break-all">Link: {typeof window!=='undefined' ? window.location.origin : ''}/admin/activate?token={lastToken}</div>
              </div>
              <div className="mt-2 text-[10px] text-zinc-500">Full process: Founder assigns → Team member receives email → Clicks activation link → Creates Admin username & password → Admin Account activated → Uses normal Login button → System recognises Admin authority → Auto Admin Edit Mode</div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7">
          <div className="flex justify-between items-center">
            <div className="mono text-[11px] tracking-[0.14em] text-white">CURRENT ADMINS · Founder can remove at any time</div>
            <button onClick={refresh} className="text-[10px] text-zinc-500 hover:text-white">Refresh</button>
          </div>
          <div className="mt-4 space-y-2">
            {admins.map((a:any)=>(
              <div key={a.email} className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl p-3">
                <div>
                  <div className="text-[13px] font-medium text-white flex items-center gap-2">{a.email} {a.role==='founder' && <span className="text-[9px] bg-[#C45A3C] px-2 py-0.5 rounded-full">FOUNDER</span>} {a.role==='admin' && <span className="text-[9px] bg-orange-600 px-2 py-0.5 rounded-full">ADMIN</span>} <span className={'text-[9px] px-2 py-0.5 rounded-full ' + (a.status==='active'?'bg-green-900/30 text-green-400':'bg-orange-900/30 text-orange-400')}>{a.status}</span></div>
                  <div className="mono text-[10px] text-zinc-500">{a.name} · Invited {new Date(a.invitedAt).toLocaleString()}</div>
                </div>
                {a.role!=='founder' && <button onClick={()=>handleRemove(a.email)} className="h-8 px-3 rounded-full border border-red-900/50 bg-red-900/20 text-red-400 text-[10px] hover:bg-red-900/30">Remove Admin Authority</button>}
              </div>
            ))}
          </div>
          <div className="mt-4 mono text-[10px] text-zinc-600">Basic authority: Founder → Can assign/remove Admin authority · Admin → Can access Admin Edit Mode · Normal User → Normal website access · Once removed, person can no longer access Admin Edit Mode</div>
        </div>

        <div className="mt-6 bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7">
          <div className="mono text-[11px] tracking-[0.14em] text-white">PENDING INVITES · Admin Invitation Email sent</div>
          <div className="mt-3 space-y-2">
            {invites.length===0 ? <div className="text-[11px] text-zinc-600">No pending invites</div> : invites.map((inv:any)=>(
              <div key={inv.token} className="bg-black border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                <div><div className="text-[11px] text-white">{inv.email}</div><div className="mono text-[9px] text-zinc-500">Token {inv.token.slice(0,20)}... · Invited by {inv.invitedBy} · {new Date(inv.createdAt).toLocaleString()}</div></div>
                <Link href={'/admin/activate?token=' + inv.token} className="h-8 px-3 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">View Activation Link</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
