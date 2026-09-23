'use client'
import { EditableText } from '@/components/EditableText'
export default function FounderPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <EditableText textKey="founder_title" defaultValue="Founder Dashboard" as="h1" className="text-5xl font-serif block" />
      </div>
    </div>
  )
}
