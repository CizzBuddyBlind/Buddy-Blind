'use client'
import { EditableText } from '@/components/EditableText'
export default function HowItWorksPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6">
      <div className="max-w-5xl mx-auto">
        <EditableText textKey="hiw_big" defaultValue="See venue, see vibe, join." as="h1" className="text- leading-[0.9] font-serif" />
        <EditableText textKey="hiw_sub" defaultValue="Three steps to a blind dinner." className="mt-6 text-zinc-400 block" />
        {/* keep rest of your page, but wrap any text with EditableText */}
      </div>
    </div>
  )
}
