'use client'
import { EditableText } from '@/components/EditableText'
export default function PremiumPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <EditableText textKey="premium_big" defaultValue="Why Premium unlocks Private up to 20." as="h1" className="text- leading-[0.9] font-serif block" />
        <EditableText textKey="premium_sub" defaultValue="Premium members get first access to private tables, host dinners, and up to 20 guests." className="mt-6 text-zinc-400 block max-w-2xl" />
      </div>
    </div>
  )
}
