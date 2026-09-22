export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-black">PAYMENT CANCELED</h1>
      <p className="mt-4 text-zinc-500">No charge made. You can try again.</p>
      <a href="/" className="mt-8 px-8 h-12 rounded-full bg-white text-black flex items-center font-black text-xs tracking-widest">BACK TO DROP</a>
    </div>
  );
}
