'use client'
import { EditableText } from '@/components/EditableText'
import { EditableImage } from '@/components/EditableImage'

const EVENTS = [
  { id:'speakeasy', dinners:'12 DINNERS', name:'Speakeasy Laughs', desc:'Comedian hosts a no-phone real-talk dinner', host:'HOST COMEDIAN STAND-UP CROWD', line:'If you laugh at same dark joke you will stay for dessert', img:'/private/speakeasy.jpg' },
  { id:'flash', dinners:'8 NIGHTS', name:'Flash Night', desc:'Tattoo artists plus blank walls plus shared stories', host:'HOST INK STUDIO ARTISTS', line:'You bring a memory they bring the ink idea', img:'/private/flash.jpg' },
  { id:'plating', dinners:'15 TABLES', name:'Plating Together', desc:'Private kitchen where strangers plate each others dish', host:'HOST CHEF LIN 6 SEATS', line:'You cook for someone you have not met They do same', img:'/private/plating.jpg' },
]

export default function PrivateEventsPage(){
  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <EditableText textKey="private_title" defaultValue="Private Events" as="h1" className="text-5xl font-serif" />
        <EditableText textKey="private_sub" defaultValue="Restaurants provide the scene. Private events create the reason." className="mt-4 text-zinc-400 max-w-2xl block" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {EVENTS.map(e=>(
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3">
              <div className="relative overflow-hidden rounded-2xl h- w-full">
                <EditableImage imageKey={`private_${e.id}_img`} defaultSrc={e.img} alt={e.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-xs"><EditableText textKey={`private_${e.id}_badge`} defaultValue={e.dinners} /></div>
              </div>
              <div className="p-3">
                <EditableText textKey={`private_${e.id}_name`} defaultValue={e.name} as="h3" className="text-2xl font-serif" />
                <EditableText textKey={`private_${e.id}_desc`} defaultValue={e.desc} className="mt-2 text-sm text-zinc-400 block" />
                <EditableText textKey={`private_${e.id}_host`} defaultValue={e.host} className="mt-3 mono text- text-zinc-500 block tracking-widest" />
                <EditableText textKey={`private_${e.id}_line`} defaultValue={e.line} className="mt-3 text-sm italic text-zinc-400 block" />
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 h-11 rounded-full bg-white text-black text-sm"><EditableText textKey={`private_${e.id}_join`} defaultValue="JOIN" /></button>
                  <button className="px-6 h-11 rounded-full border border-zinc-700 text-sm"><EditableText textKey={`private_${e.id}_invite`} defaultValue="INVITE" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
