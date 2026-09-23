
'use client';
import Link from 'next/link';
export default function CancelPage(){
  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 text-center">
        <h1 className="text-[24px] font-black">Payment Cancelled</h1>
        <p className="mt-2 text-[13px] text-zinc-500">No charge. Test card: 4242 4242 4242 4242 Exp 12/34 CVC 123</p>
        <Link href="/venues" className="mt-6 block h-[56px] rounded-full bg-white text-black font-black text-[12px] flex items-center justify-center">BACK TO VENUES →</Link>
      </div>
    </div>
  );
}
