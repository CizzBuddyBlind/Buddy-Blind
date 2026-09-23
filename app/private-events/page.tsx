'use client'
import { EditableText } from '@/components/EditableText'
import { EditableImage } from '@/components/EditableImage'
export default function PrivateEventsPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <EditableText textKey="private_title" defaultValue="Private Events" as="h1" className="text-5xl font-serif" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{id:'speakeasy',name:'Speakeasy Laughs',img:'/private/speakeasy.jpg'},{id:'flash',name:'Flash Night',img:'/private/flash.jpg'},{id:'plating',name:'Plating Together',img:'/private/plating.jpg'}].map(e=>(
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3">
              <div className="h- rounded-2xl overflow-hidden">
                <EditableImage imageKey={`private_${e.id}_img`} defaultSrc={e.img} alt={e.name} className="w-full h-full object-cover" />
              </div>
              <EditableText textKey={`private_${e.id}_name`} defaultValue={e.name} as="h3" className="mt-3 text-2xl font-serif block" />
              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-11 rounded-full bg-white text-black text-sm">JOIN</button>
                <button className="flex-1 h-11 rounded-full border border-zinc-700 text-sm">INVITE</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
