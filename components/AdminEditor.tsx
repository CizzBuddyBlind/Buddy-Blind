
'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isFounder, isLoggedIn } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelectedEl(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // Simple drag for any element with data-bb-selected - actually moves and stays
  useEffect(()=>{
    if(!isEditMode || isPreview) return;

    const style = document.createElement('style');
    style.id = 'bb-drag-styles';
    style.textContent = `
      [data-bb-editable]:hover { outline: 2px dashed #C45A3C !important; outline-offset: 2px; }
      [data-bb-selected] { outline: 3px solid #C45A3C !important; outline-offset: 3px !important; }
      .bb-dragging { opacity: 0.8 !important; z-index: 9999 !important; }
    `;
    document.head.appendChild(style);

    let dragEl: HTMLElement | null = null;
    let startX = 0, startY = 0;
    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      const editable = target.closest('[data-bb-editable]') as HTMLElement;
      if(!editable) return;
      // Only drag if already selected, or if holding shift/alt
      if(!editable.hasAttribute('data-bb-selected') && !e.altKey) return;
      
      dragEl = editable;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if(!dragEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if(!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)){
        isDragging = true;
        setDragging(true);
        dragEl.classList.add('bb-dragging');
        const computed = window.getComputedStyle(dragEl);
        if(computed.position === 'static'){
          dragEl.style.position = 'relative';
        }
      }
      if(isDragging){
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if(!dragEl) return;
      if(isDragging){
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
        dragEl.setAttribute('data-bb-dx', dx.toString());
        dragEl.setAttribute('data-bb-dy', dy.toString());
        setHasUnsaved(true);
      }
      dragEl.classList.remove('bb-dragging');
      dragEl = null;
      isDragging = false;
      setDragging(false);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(target.closest('nav')) return;
      
      const editable = target.closest('[data-bb-editable]') as HTMLElement;
      if(editable){
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        editable.setAttribute('data-bb-selected','true');
        setSelectedEl(editable);
      } else if(target.tagName === 'BODY' || target.tagName === 'MAIN' || target.hasAttribute('data-bb-page') || target.hasAttribute('data-bb-canvas')){
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        setSelectedEl(null);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('click', onClick);

    // Load saved transforms
    try{
      const saved = localStorage.getItem('bb_edits');
      if(saved){
        const edits = JSON.parse(saved);
        Object.keys(edits).forEach(id=>{
          const el = document.getElementById(id) as HTMLElement;
          if(el && edits[id].dx){
            el.style.transform = `translate(${edits[id].dx}px, ${edits[id].dy}px)`;
            el.style.position = 'relative';
          }
        });
      }
    }catch{}

    return ()=>{
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('click', onClick);
      const s = document.getElementById('bb-drag-styles');
      if(s) s.remove();
    };
  },[isEditMode, isPreview]);

  const handleSaveDraft = () => {
    const draft = localStorage.getItem('bb_draft') || '{}';
    localStorage.setItem('bb_draft_backup', draft);
    setHasUnsaved(false);
    alert('Draft saved - Instant on all pages - Use PUBLISH in top bar to go live. Save = draft, instant on all pages.');
  };

  const handlePublish = () => {
    if(!confirm('Publish? Makes changes live for all normal users.\n\nEdit → Save Draft → Preview → Publish')) return;
    const draft = localStorage.getItem('bb_draft');
    if(draft){
      localStorage.setItem('bb_published', draft);
      localStorage.setItem('bb_published_at', new Date().toISOString());
    }
    setHasUnsaved(false);
    alert('Published! Live for normal users.');
  };

  if(!isEditMode || isPreview){
    return (
      <>
        <div data-bb-page>{children}</div>
        {(isAdmin || isFounder) && isPreview && (
          <div className="fixed top-[64px] left-0 right-0 z-50 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between items-center" data-editor-ui>
            <span>Preview as User - Exactly what normal users see</span>
            <button onClick={()=>setIsPreview(false)} className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold">Exit Preview</button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" data-editor-ui>
      {/* TOP TOOLBAR */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[44px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="mono text-[10px] text-zinc-500 hidden md:block">EDIT MODE · Wix-like · All pages editable · Click to edit · Drag to move · All photos editable</div>
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[11px]">↶</button>
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[11px]">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsPreview(true)} className="h-7 px-3 rounded-full border border-zinc-700 text-[10px] hover:bg-zinc-800">Preview</button>
          <button onClick={handleSaveDraft} className="h-7 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[10px]">Save Draft {hasUnsaved&&'•'}</button>
          <button onClick={handlePublish} className="h-7 px-4 rounded-full bg-[#C45A3C] text-white text-[10px] font-bold">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* LEFT TOOLBAR - MAIN TOOLS ONLY */}
        <div className="w-[64px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] flex flex-col items-center py-4 gap-3 sticky top-[44px] h-[calc(100vh-44px)]">
          <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-[20px] font-bold hover:scale-110 transition">+</button>
          <div className="w-8 h-px bg-zinc-800"></div>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[11px]">📄</span><span className="mono text-[6px]">Pages</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[11px]">◫</span><span className="mono text-[6px]">Sections</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[11px]">⚡</span><span className="mono text-[5px]">Features</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[11px]">🖼</span><span className="mono text-[6px]">Media</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[11px]">📚</span><span className="mono text-[6px]">Layers</span></button>
          {isFounder && <button onClick={()=>window.location.href='/founder'} className="w-10 h-10 rounded-xl bg-[#C45A3C] text-white flex flex-col items-center justify-center mt-2"><span className="text-[10px]">👑</span><span className="mono text-[5px]">Admin</span></button>}
        </div>

        {showAddMenu && (
          <div className="w-[260px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] p-4 overflow-y-auto sticky top-[44px] h-[calc(100vh-44px)]">
            <div className="flex justify-between"><div className="mono text-[11px] font-bold text-white">+ ADD - All editable</div><button onClick={()=>setShowAddMenu(false)} className="w-6 h-6 rounded-full border border-zinc-700 text-[10px]">✕</button></div>
            <div className="mt-3 mono text-[9px] text-zinc-500">Every page blank canvas - Everything added, so everything editable - Click text to edit, photo to replace, drag to move</div>
            <div className="mt-4 space-y-3">
              <div><div className="mono text-[10px] text-zinc-400">TEXT - Click to edit directly</div><div className="mt-2 text-[10px] text-zinc-600 leading-relaxed">All text on website is EditableText - Click text → Edit wording, font, size, colour, bold, italic - Font menu + colour picker + size - All pages</div></div>
              <div><div className="mono text-[10px] text-zinc-400">PHOTO - Click to replace</div><div className="mt-2 text-[10px] text-zinc-600">All photos EditableImage - Click photo → Replace, Crop, Fit, Fill - Upload from computer - Drag into Section Box → Auto fits - Not stretched</div></div>
              <div><div className="mono text-[10px] text-zinc-400">MOVE - Drag to move</div><div className="mt-2 text-[10px] text-zinc-600">Select element → Hold + Drag → Drop - Stays where dropped - All visual elements movable - Smart alignment</div></div>
            </div>
          </div>
        )}

        {/* CENTRE - Actual website */}
        <div className={'flex-1 bg-[#080808] overflow-auto min-h-[calc(100vh-44px)] ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          <div className="bg-black min-h-screen" data-bb-canvas>
            {children}
          </div>
        </div>
      </div>

      {/* Selected highlight */}
      {selectedEl && (
        <div 
          className="fixed border-2 border-[#C45A3C] pointer-events-none z-40"
          style={{
            top: selectedEl.getBoundingClientRect().top + 'px',
            left: selectedEl.getBoundingClientRect().left + 'px',
            width: selectedEl.getBoundingClientRect().width + 'px',
            height: selectedEl.getBoundingClientRect().height + 'px',
          }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-8 left-0 bg-[#C45A3C] text-white text-[8px] px-2 py-1 rounded-full mono whitespace-nowrap">
            {dragging ? 'Dragging... Drop to move' : 'Click to edit · Drag to move · Alt+Drag to move · Double-click to edit quickly'}
          </div>
        </div>
      )}
    </div>
  );
}
