'use client'
import { EditableText } from '@/components/EditableText'
export default function PremiumPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6">
      <div className="max-w-5xl mx-auto">
        <EditableText textKey="premium_big" defaultValue="Why Premium unlocks Private up to 20." as="h1" className="text- leading-[0.9] font-serif" />
        <EditableText textKey="premium_sub" defaultValue="Premium members get first access to private tables, host dinners, and up to 20 guests." className="mt-6 text-zinc-400 block max-w-2xl" />
        <div className="mt-8 flex gap-3">
          <button className="h-11 px-8 rounded-full bg-white text-black"><EditableText textKey="premium_btn_join" defaultValue="JOIN PREMIUM" /></button>
          <button className="h-11 px-8 rounded-full border border-zinc-700"><EditableText textKey="premium_btn_learn" defaultValue="LEARN MORE" /></button>
        </div>
      </div>
    </div>
  )
}
