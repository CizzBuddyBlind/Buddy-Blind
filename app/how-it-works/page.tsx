'use client'
import { EditableText } from '@/components/EditableText'
export default function HowItWorksPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <EditableText textKey="hiw_big" defaultValue="See venue, see vibe, join." as="h1" className="text- leading-[0.9] font-serif block" />
        <EditableText textKey="hiw_sub" defaultValue="Three steps to a blind dinner." className="mt-6 text-zinc-400 block" />
      </div>
    </div>
  )
}
