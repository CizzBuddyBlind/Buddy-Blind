
'use client'
import { useSiteContent } from '@/lib/useSiteContent'
import { EditableText } from '@/components/EditableText'
import Link from 'next/link'

const DEFAULT:Record<string,string> = {
  label: 'HOW IT WORKS · NO META WORDING',
  headline_1: 'See venue,',
  headline_2: 'see vibe, join.',
  step1_num: '01',
  step1_title: 'See venue / private event',
  step1_desc: 'Photo is the filter. If you like the light, you will like the people.',
  step2_num: '02',
  step2_title: 'See neighborhood / vibe / time / places left',
  step2_desc: 'Soho tonight? Central tomorrow? How many seats left — real numbers.',
  step3_num: '03',
  step3_title: 'Join',
  step3_desc: 'One tap. HK$5 admin only after confirmation. No pre-pay anxiety.',
  step4_num: '04',
  step4_title: 'Meet',
  step4_desc: 'No names before. No photos before. Just show up. Restaurants provide the scene.',
  step5_num: '05',
  step5_title: 'Rate & Comment',
  step5_desc: '4.5 stars is not about looks. Easy to talk to, keeps conversation going.',
  step6_num: '06',
  step6_title: "Add as buddy — Hey! You are my vibe, let's be buddies!",
  step6_desc: 'One-click after. If both say yes, you are buddies. 24 and counting.',
  step7_num: '07',
  step7_title: 'Create your own',
  step7_desc: 'Premium unlocks private up to 20. Wine, industry, 50+ social, hike — host creates attraction and download reasons.',
  cta_join: 'JOIN A BLIND DINNER →',
  cta_private: 'PRIVATE EVENTS'
}

export default function HowItWorksPage(){
  const { getText, getStyle } = useSiteContent(DEFAULT)

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[800px] mx-auto px-6 pt-16 pb-20">
        <EditableText textKey="how_label" defaultValue={getText('label')} as="div" className="mono text-[11px] tracking-[0.15em] text-[#c96a4a]" style={getStyle('label')} />
        <h1 className="serif mt-6 text-[64px] md:text-[84px] leading-[0.85] tracking-[-0.02em] text-white">
          <EditableText textKey="how_headline_1" defaultValue={getText('headline_1')} as="span" className="block" style={getStyle('headline_1')} />
          <EditableText textKey="how_headline_2" defaultValue={getText('headline_2')} as="span" className="block" style={getStyle('headline_2')} />
        </h1>

        <div className="mt-16 bg-[#0f0f0f] border border-zinc-900 rounded-[20px] overflow-hidden">
          {[
            {num:'step1_num', title:'step1_title', desc:'step1_desc'},
            {num:'step2_num', title:'step2_title', desc:'step2_desc'},
            {num:'step3_num', title:'step3_title', desc:'step3_desc'},
            {num:'step4_num', title:'step4_title', desc:'step4_desc'},
            {num:'step5_num', title:'step5_title', desc:'step5_desc'},
            {num:'step6_num', title:'step6_title', desc:'step6_desc'},
            {num:'step7_num', title:'step7_title', desc:'step7_desc'},
          ].map((s,i)=>(
            <div key={i} className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 px-6 md:px-10 py-8 border-b border-zinc-900 last:border-b-0 hover:bg-[#111] transition">
              <EditableText textKey={`how_${s.num}`} defaultValue={getText(s.num)} as="div" className="mono text-[12px] text-zinc-700 pt-1" style={getStyle(s.num)} />
              <div>
                <EditableText textKey={`how_${s.title}`} defaultValue={getText(s.title)} as="h3" className="serif text-[22px] md:text-[26px] leading-tight text-white" style={getStyle(s.title)} />
                <EditableText textKey={`how_${s.desc}`} defaultValue={getText(s.desc)} as="p" className="mt-3 text-[15px] leading-relaxed text-zinc-500 max-w-[560px]" style={getStyle(s.desc)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-3 justify-center">
          <EditableText textKey="how_cta_join" defaultValue={getText('cta_join')} as="div" className="mono h-12 px-8 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center hover:bg-white transition" style={getStyle('cta_join')}>
            <Link href="/venues" className="w-full h-full flex items-center justify-center">{getText('cta_join')}</Link>
          </EditableText>
          <EditableText textKey="how_cta_private" defaultValue={getText('cta_private')} as="div" className="mono h-12 px-8 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition" style={getStyle('cta_private')}>
            <Link href="/private-events" className="w-full h-full flex items-center justify-center">{getText('cta_private')}</Link>
          </EditableText>
        </div>
      </div>
    </main>
  )
}
