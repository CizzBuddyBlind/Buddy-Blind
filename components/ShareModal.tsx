
'use client';
import { useState } from 'react';

type Props = { isOpen: boolean; onClose: () => void; title?: string; url?: string; };

export default function ShareModal({isOpen,onClose,title,url}:Props){
  const [copied,setCopied]=useState(false);
  if(!isOpen) return null;
  const shareUrl = url || (typeof window!=='undefined' ? window.location.href : 'https://buddy-blind.vercel.app');
  const shareTitle = title || 'Buddy Blind - You dont know who you will meet';

  const copyLink = async ()=>{
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  const shareVia = (platform:string)=>{
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    let link = '';
    switch(platform){
      case 'whatsapp': link = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`; break;
      case 'messages': link = `sms:?&body=${encodedTitle}%20${encodedUrl}`; break;
      case 'facebook': link = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
      case 'messenger': link = `fb-messenger://share/?link=${encodedUrl}`; break;
      case 'twitter': link = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`; break;
      default: 
        if(navigator.share){ navigator.share({title:shareTitle, url:shareUrl}); return; }
        link = shareUrl;
    }
    if(link) window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[12px] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="w-full md:max-w-[420px] bg-[#111] border border-zinc-800 rounded-t-[28px] md:rounded-[28px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-black tracking-tight">Share</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[12px]">✕</button>
        </div>

        {/* Top row - Copy Link, Bookmark, Share via */}
        <div className="flex gap-6 mb-6 border-b border-zinc-800 pb-6">
          <button onClick={copyLink} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <span className="text-[20px]">🔗</span>
            </div>
            <span className="text-[11px] tracking-widest text-zinc-400">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button onClick={()=>{ alert('Bookmarked ✓ - Saved to your profile'); }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <span className="text-[20px]">🔖</span>
            </div>
            <span className="text-[11px] tracking-widest text-zinc-400">Bookmark</span>
          </button>
          <button onClick={()=>shareVia('system')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <span className="text-[20px]">↗️</span>
            </div>
            <span className="text-[11px] tracking-widest text-zinc-400">Share via...</span>
          </button>
        </div>

        {/* Second row - WhatsApp, Messages, News Feed, Your groups, Chats */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            {name:'WhatsApp', icon:'W', color:'bg-[#25D366]', action:'whatsapp'},
            {name:'Messages', icon:'M', color:'bg-[#0084FF]', action:'messages'},
            {name:'News Feed', icon:'f', color:'bg-[#1877F2]', action:'facebook'},
            {name:'Your groups', icon:'f', color:'bg-[#1877F2]', action:'facebook'},
            {name:'Chats', icon:'M', color:'bg-gradient-to-br from-purple-500 to-blue-500', action:'messenger'},
            {name:'Twitter', icon:'X', color:'bg-black border border-zinc-700', action:'twitter'},
          ].map(item=>(
            <button key={item.name} onClick={()=>shareVia(item.action)} className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className={`w-14 h-14 rounded-[16px] ${item.color} flex items-center justify-center text-white font-bold text-[20px]`}>{item.icon}</div>
              <span className="text-[10px] tracking-widest text-zinc-500 text-center">{item.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-black border border-zinc-800 rounded-[12px] p-3">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500">SHARE LINK</div>
          <div className="mt-1 text-[11px] text-zinc-400 font-mono truncate">{shareUrl}</div>
          <div className="mt-1 text-[10px] text-zinc-600">V9 Heart • Different photos per event • More heart • No repeats • Test card 4242</div>
        </div>
      </div>
    </div>
  );
}
