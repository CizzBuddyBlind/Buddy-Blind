
'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
function InviteContent(){
  const sp = useSearchParams();
  const paid = sp.get('paid');
  const ref = sp.get('ref');
  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 text-center">
        {paid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto text-[28px]">✓</div>
            <h1 className="mt-6 text-[24px] font-black">INVITE PAID ✓</h1>
            <p className="mt-2 text-[14px] text-zinc-400">Private event link ready.</p>
            <div className="mt-6 bg-black border border-zinc-800 rounded-[16px] p-4 text-left text-[12px] font-mono">
              <div>Ref: {ref || 'cizz-HEART'}</div>
              <div>Test Card: 4242 4242 4242 4242 | 12/34 | 123</div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/private-events" className="h-[48px] rounded-full bg-white text-black font-black text-[12px] flex items-center justify-center">PRIVATE EVENTS</Link>
              <Link href="/profile" className="h-[48px] rounded-full border border-zinc-700 font-black text-[12px] flex items-center justify-center">MY EVENTS</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[24px] font-black">CREATE INVITE</h1>
            <p className="mt-2 text-[13px] text-zinc-500">Host private blind dinner. $5 admin.</p>
            <Link href="/private-events" className="mt-6 block h-[56px] rounded-full bg-white text-black font-black text-[12px] flex items-center justify-center">SEE PRIVATE EVENTS →</Link>
          </>
        )}
      </div>
    </div>
  );
}
export default function InvitePage(){ return <Suspense><InviteContent/></Suspense>; }
