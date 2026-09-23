
import Link from 'next/link';
export default function CancelPage(){
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-black">Payment Cancelled</h1>
        <p className="mt-2 text-sm text-zinc-500">No charge Test card 4242 4242 4242 4242 Exp 12 34 CVC 123</p>
        <Link href="/venues" className="mt-6 block h-14 rounded-full bg-white text-black font-black text-xs flex items-center justify-center">BACK TO VENUES</Link>
      </div>
    </div>
  );
}
