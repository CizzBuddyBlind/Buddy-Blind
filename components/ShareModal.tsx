
'use client';
import { useState } from 'react';
type Props = { isOpen: boolean; onClose: () => void; title?: string; url?: string; };
export default function ShareModal({isOpen,onClose,title,url}:Props){
  const [copied,setCopied]=useState(false);
  if(!isOpen) return null;
  const shareUrl = url || (typeof window!=='undefined' ? window.location.href : 'https://buddy-blind.vercel.app');
  const shareTitle = title || 'Buddy Blind';
  const copyLink = async ()=>{
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };
  const shareVia = (platform:string)=>{
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    let link = '';
    if(platform==='whatsapp') link = 'https://wa.me/?text=' + encodedTitle + '%20' + encodedUrl;
    if(platform==='facebook') link = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
    if(platform==='twitter') link = 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl;
    if(link) window.open(link, '_blank');
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black">Share</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">X</button>
        </div>
        <div className="flex gap-6 mb-6 border-b border-zinc-800 pb-6">
          <button onClick={copyLink} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">Link</div>
            <span className="text-xs text-zinc-400">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <button onClick={()=>alert('Bookmarked Saved to your profile')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">Save</div>
            <span className="text-xs text-zinc-400">Bookmark</span>
          </button>
          <button onClick={()=>{ if(navigator.share){ navigator.share({title:shareTitle, url:shareUrl}); } }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">Share</div>
            <span className="text-xs text-zinc-400">Share via</span>
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            {name:'WhatsApp', color:'bg-green-500', action:'whatsapp'},
            {name:'Messages', color:'bg-blue-500', action:'messages'},
            {name:'News Feed', color:'bg-blue-600', action:'facebook'},
            {name:'Twitter', color:'bg-black border border-zinc-700', action:'twitter'},
          ].map(item=>(
            <button key={item.name} onClick={()=>shareVia(item.action)} className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className={'w-14 h-14 rounded-2xl ' + item.color + ' flex items-center justify-center text-white font-bold'}>{item.name[0]}</div>
              <span className="text-xs text-zinc-500 text-center">{item.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 bg-black border border-zinc-800 rounded-xl p-3">
          <div className="text-xs text-zinc-500">SHARE LINK</div>
          <div className="mt-1 text-xs text-zinc-400 truncate">{shareUrl}</div>
        </div>
      </div>
    </div>
  );
}
