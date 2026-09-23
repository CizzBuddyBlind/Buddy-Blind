'use client';
import EditableText from '@/components/EditableText';

const venues = [
  { name: "Cafe 001 — Grey Lynn", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800" },
  { name: "Wine Bar — Ponsonby", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800" },
  { name: "Rooftop — CBD", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" },
  { name: "Bakery — Mt Eden", img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800" },
  { name: "Studio — K Road", img: "https://images.unsplash.com/photo-1497366811353-26cc3f4fa5fa?w=800" },
  { name: "House — Herne Bay", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#FFFEF9]">
      <header className="flex justify-between items-center px-6 md:px-10 py-6 text-[11px] tracking-[0.2em] uppercase">
        <div className="font-medium">Buddy Blind</div>
        <div className="opacity-60">Auckland — Est 2024</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[72vh] border-y border-black/10">
        <div className="flex items-center justify-center p-10 md:p-16 bg-[#FFFEF9] border-b md:border-b-0 md:border-r border-black/10">
          <h1 className="text-[12vw] md:text-[8vw] leading-[0.9] tracking-tight">
            <EditableText field="heroLeft" as="span" className="text-[#C45A3C] font-[700] block" />
          </h1>
        </div>
        <div className="flex flex-col justify-center p-10 md:p-16 gap-8">
          <div>
            <EditableText field="heroRightTitle" as="h2" className="text-3xl font-medium tracking-tight" />
            <EditableText field="heroRightDesc" as="p" className="mt-3 text-[15px] leading-6 opacity-70 max-w-[32ch]" />
          </div>
          <div className="pt-8 border-t border-black/10">
            <div className="text-[10px] tracking-[0.2em] uppercase opacity-40 mb-3">Next Gathering</div>
            <EditableText field="heroRightEvent" as="div" className="inline-block border border-black px-4 py-2 rounded-full text-sm" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-16">
        <div className="flex justify-between items-end mb-8">
          <EditableText field="venuesTitle" as="h3" className="text-[11px] tracking-[0.2em] uppercase opacity-60" />
          <span className="text-[11px] opacity-40">6 places, 6 nights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-black/10 border border-black/10">
          {venues.map((v,i) => (
            <div key={i} className="bg-[#FFFEF9] group">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" />
              </div>
              <div className="p-4 text-[12px] tracking-wide">{v.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 border-y border-black/10">
        <div className="p-10 md:p-16">
          <EditableText field="privateTitle" as="h3" className="text-[11px] tracking-[0.2em] uppercase opacity-60 mb-6" />
          <div className="group cursor-pointer">
            <EditableText field="privateDesc" as="p" className="text-[5vw] md:text-[3.5vw] leading-[0.95] tracking-tight group-hover:text-[#C45A3C] transition-colors duration-300" />
            <div className="mt-6 text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 group-hover:text-[#C45A3C] transition-colors">Enquire →</div>
          </div>
        </div>
        <div className="p-10 md:p-16 bg-black text-white flex flex-col justify-between">
          <div>
            <EditableText field="quickTitle" as="h4" className="text-[11px] tracking-[0.2em] uppercase opacity-50 mb-6" />
            <ul className="space-y-3">
              {['How it works','FAQ','Contact'].map(link => (<li key={link} className="text-2xl hover:text-[#C45A3C] transition-colors cursor-pointer">{link}</li>))}
            </ul>
          </div>
          <div className="mt-16 flex gap-4 text-[11px] opacity-50">
            <span>© {new Date().getFullYear()} Buddy Blind</span><span>·</span><EditableText field="profileName" as="span" /> <span className="opacity-40">—</span> <EditableText field="profileRole" as="span" className="opacity-40" />
          </div>
        </div>
      </section>
      <div className="h-24" />
    </main>
  );
}
