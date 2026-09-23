
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

type SelectedType = 'text' | 'image' | 'button' | 'section' | 'event' | 'restaurant' | 'feature' | 'container' | 'empty';
type SelectedEl = {
  id: string;
  type: SelectedType;
  element: HTMLElement | null;
  rect: DOMRect | null;
  content: string;
};

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isFounder, isLoggedIn } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selected, setSelected] = useState<SelectedEl | null>(null);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState('18px');
  const [textFont, setTextFont] = useState('Default');
  const [textWeight, setTextWeight] = useState('Default');
  const [showPages, setShowPages] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelected(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // BLANK CANVAS PRINCIPLE - Every page is blank white canvas, everything visible is added element, so everything editable
  // Make ALL pages editable - not just home - scan all elements
  useEffect(()=>{
    if(!isEditMode || isPreview) return;

    const style = document.createElement('style');
    style.textContent = `
      [data-editable] { outline: 1px dashed rgba(196,90,60,0.3); outline-offset: 2px; cursor: pointer; }
      [data-editable]:hover { outline: 1px solid #C45A3C; background: rgba(196,90,60,0.05); }
      [data-editable-selected] { outline: 2px solid #C45A3C !important; background: rgba(196,90,60,0.08) !important; }
    `;
    document.head.appendChild(style);

    const makeAllEditable = () => {
      // Select ALL visible elements across ALL pages
      const selectors = 'h1,h2,h3,h4,h5,h6,p,span,a,button,img,div,section,header,footer,nav';
      const allElements = document.querySelectorAll('main ' + selectors + ', [data-bb-canvas] ' + selectors);
      
      // Also make direct body children editable for full canvas
      const bodyElements = document.body.querySelectorAll('*:not([data-editor-ui]):not(style):not(script)');
      
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(!target) return;
        if(target.closest('[data-editor-ui]')) return;
        if(target.closest('input, textarea, select')) return;
        
        // Prevent navigation in edit mode
        e.preventDefault();
        e.stopPropagation();
        
        // Determine type
        let type: SelectedType = 'text';
        const tag = target.tagName.toLowerCase();
        const text = target.textContent || '';
        
        if(tag === 'img' || target.querySelector('img') || target.style.backgroundImage){
          type = 'image';
        } else if(tag === 'button' || target.getAttribute('role') === 'button' || (target.className.includes('rounded-full') && (text.includes('JOIN') || text.includes('INVITE') || text.includes('SHARE') || text.includes('Quick') || text.includes('Private')))){
          type = 'button';
        } else if(target.className.includes('rounded-2xl') || target.className.includes('rounded-3xl') || target.getAttribute('data-section') || (target.children.length > 2 && target.clientHeight > 100)){
          if(text.includes('Kissa') || text.includes('Yardbird') || text.includes('SOHO') || text.includes('Restaurant')) type = 'restaurant';
          else if(text.includes('Blind Box') || text.includes('FEATURED') || text.includes('Hosts') || text.includes('Scenes')) type = 'event';
          else type = 'section';
        } else if(text.includes('Quick Meet') || text.includes('Upcoming') || text.includes('Filters')){
          type = 'feature';
        } else {
          type = 'text';
        }

        // Remove previous selection
        document.querySelectorAll('[data-editable-selected]').forEach(el=>el.removeAttribute('data-editable-selected'));
        target.setAttribute('data-editable-selected','true');
        target.setAttribute('data-editable','true');

        const rect = target.getBoundingClientRect();
        const id = target.id || 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2,4);
        if(!target.id) target.id = id;

        setSelected({
          id,
          type,
          element: target,
          rect,
          content: text.slice(0,200)
        });

        // If text, prepare editor values
        if(type === 'text' || type === 'button'){
          setTextValue(target.textContent || '');
          const computed = window.getComputedStyle(target);
          setTextColor(computed.color || '#ffffff');
          setTextSize(computed.fontSize || '18px');
        }
      };

      const handleDoubleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(target.closest('[data-editor-ui]')) return;
        e.preventDefault();
        e.stopPropagation();
        const tag = target.tagName.toLowerCase();
        if(tag !== 'img' && !target.querySelector('img')){
          // Double-click text → start typing
          setTextValue(target.textContent || '');
          setShowTextEditor(true);
          setSelected({
            id: target.id || 'el-' + Date.now(),
            type: 'text',
            element: target,
            rect: target.getBoundingClientRect(),
            content: target.textContent || ''
          });
        } else {
          // Double-click photo → replace
          fileInputRef.current?.click();
        }
      };

      // Add editable attribute to all visible elements
      document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,button,img,a').forEach(el=>{
        if((el as HTMLElement).closest('[data-editor-ui]')) return;
        if(el.textContent && el.textContent.trim().length > 0){
          (el as HTMLElement).setAttribute('data-editable','true');
        }
      });

      document.addEventListener('click', handleClick, true);
      document.addEventListener('dblclick', handleDoubleClick, true);

      // Drag and drop - Click → Hold → Drag → Drop - Everything can move
      let isDragging = false;
      let startX = 0, startY = 0;
      let currentEl: HTMLElement | null = null;

      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(target.closest('[data-editor-ui]')) return;
        if(!target.hasAttribute('data-editable-selected')) return;
        if((target as any).isContentEditable) return;
        
        isDragging = true;
        currentEl = target;
        startX = e.clientX;
        startY = e.clientY;
        target.style.cursor = 'grabbing';
        setDragging(target.id);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if(!isDragging || !currentEl) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        currentEl.style.transform = `translate(${dx}px, ${dy}px)`;
        currentEl.style.zIndex = '1000';
        // Smart alignment lines
        const centerX = window.innerWidth / 2;
        if(Math.abs(e.clientX - centerX) < 10){
          document.querySelectorAll('[data-alignment]').forEach(el=>{(el as HTMLElement).style.display='block';});
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        if(!isDragging || !currentEl) return;
        isDragging = false;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        // Apply position
        const currentLeft = parseInt(currentEl.style.left || '0');
        const currentTop = parseInt(currentEl.style.top || '0');
        currentEl.style.left = (currentLeft + dx) + 'px';
        currentEl.style.top = (currentTop + dy) + 'px';
        currentEl.style.position = 'relative';
        currentEl.style.transform = '';
        currentEl.style.cursor = 'pointer';
        currentEl = null;
        setDragging(null);
        setHasUnsaved(true);
        document.querySelectorAll('[data-alignment]').forEach(el=>{(el as HTMLElement).style.display='none';});
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return ()=>{
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('dblclick', handleDoubleClick, true);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        style.remove();
        document.querySelectorAll('[data-editable]').forEach(el=>el.removeAttribute('data-editable'));
        document.querySelectorAll('[data-editable-selected]').forEach(el=>el.removeAttribute('data-editable-selected'));
      };
    };

    const cleanup = makeAllEditable();
    return cleanup;
  },[isEditMode, isPreview]);

  // Click empty area → toolbar disappears - clean canvas
  useEffect(()=>{
    if(!isEditMode) return;
    const handleEmpty = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(target === document.body || target.tagName === 'MAIN' || target.hasAttribute('data-bb-canvas')){
        document.querySelectorAll('[data-editable-selected]').forEach(el=>el.removeAttribute('data-editable-selected'));
        setSelected(null);
      }
    };
    document.addEventListener('click', handleEmpty);
    return ()=>document.removeEventListener('click', handleEmpty);
  },[isEditMode]);

  const handleSaveText = () => {
    if(selected?.element){
      selected.element.textContent = textValue;
      selected.element.style.color = textColor;
      selected.element.style.fontSize = textSize;
      if(textFont !== 'Default') selected.element.style.fontFamily = textFont;
      if(textWeight === 'Bold') selected.element.style.fontWeight = 'bold';
      if(textWeight === 'Thin') selected.element.style.fontWeight = '300';
      if(textWeight === 'Black') selected.element.style.fontWeight = '900';
      setHasUnsaved(true);
    }
    setShowTextEditor(false);
  };

  const handleImageReplace = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file || !selected?.element) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const el = selected.element!;
      if(el.tagName === 'IMG'){
        (el as HTMLImageElement).src = src;
      } else {
        const img = el.querySelector('img') as HTMLImageElement;
        if(img) img.src = src;
        else el.style.backgroundImage = `url(${src})`;
        // Photo automatically fits box - keep correct proportion not stretched
        el.style.objectFit = 'cover';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
      setHasUnsaved(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if(!selected?.element) return;
    if(!confirm('Remove from Page (not delete actual data)?\n\nRemove Restaurant Section from Home Page does not mean Delete Restaurant from Buddy Blind. Edit Mode controls page and how info displayed, while actual system data remains protected. Confirm remove from this page/layout?')) return;
    selected.element.remove();
    setHasUnsaved(true);
    setSelected(null);
  };

  const handleDuplicate = () => {
    if(!selected?.element) return;
    const clone = selected.element.cloneNode(true) as HTMLElement;
    clone.id = 'el-' + Date.now();
    clone.setAttribute('data-editable','true');
    selected.element.parentNode?.insertBefore(clone, selected.element.nextSibling);
    setHasUnsaved(true);
  };

  const handleSaveDraft = () => {
    const html = document.documentElement.innerHTML;
    localStorage.setItem('bb_draft_html', html);
    localStorage.setItem('bb_draft', JSON.stringify({savedAt: new Date().toISOString()}));
    setHasUnsaved(false);
    alert('Draft saved - Instant on all pages - Use PUBLISH in top bar to go live');
  };

  const handlePublish = () => {
    if(!confirm('Publish? Makes changes live for all normal users.')) return;
    const html = document.documentElement.innerHTML;
    localStorage.setItem('bb_published_html', html);
    setHasUnsaved(false);
    alert('Published! Live for normal users.');
  };

  if(!isEditMode || isPreview){
    return (
      <>
        <div ref={canvasRef} data-bb-canvas className="min-h-screen bg-white">
          {children}
        </div>
        {(isAdmin || isFounder) && isPreview && (
          <div className="fixed top-[64px] left-0 right-0 z-40 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between" data-editor-ui>
            <span>Preview as User - Exactly what normal users see</span>
            <button onClick={()=>setIsPreview(false)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Exit Preview</button>
          </div>
        )}
      </>
    );
  }

  const popupStyle = selected?.rect ? {
    top: Math.max(70, selected.rect.top - 50) + 'px',
    left: Math.min(window.innerWidth - 420, Math.max(10, selected.rect.left)) + 'px',
  } : {};

  return (
    <div className="min-h-screen bg-black text-white" data-editor-ui>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      
      {/* TOP TOOLBAR - Page | Undo | Redo | Desktop | Tablet | Mobile | Preview | Save | Publish */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[44px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-zinc-500 hidden md:block">Page</span>
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]">↶</button>
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          <span className="hidden lg:block ml-3 mono text-[10px] text-zinc-600">Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish · If visible, editable · Blank canvas principle</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsPreview(true)} className="h-7 px-3 rounded-full border border-zinc-700 text-[10px] hover:bg-zinc-800">Preview</button>
          <button onClick={handleSaveDraft} className="h-7 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[10px]">Save {hasUnsaved&&'•'}</button>
          <button onClick={handlePublish} className="h-7 px-4 rounded-full bg-[#C45A3C] text-white text-[10px] font-bold">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* LEFT TOOLBAR - MAIN TOOLS ONLY - + Add, Pages, Sections, Buddy Blind Features, Media, Layers, Admin Management */}
        <div className="w-[64px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] flex flex-col items-center py-4 gap-3 sticky top-[44px] h-[calc(100vh-44px)]">
          <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-[18px] font-bold hover:scale-105 transition" title="+ Add">+</button>
          <div className="w-8 h-px bg-zinc-800"></div>
          <button onClick={()=>setShowPages(!showPages)} className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Pages"><span className="text-[12px]">📄</span><span className="mono text-[7px]">Pages</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Sections"><span className="text-[12px]">◫</span><span className="mono text-[7px]">Sections</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Buddy Blind Features"><span className="text-[12px]">⚡</span><span className="mono text-[6px]">Features</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Media"><span className="text-[12px]">🖼</span><span className="mono text-[7px]">Media</span></button>
          <button onClick={()=>setShowLayers(!showLayers)} className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Layers"><span className="text-[12px]">📚</span><span className="mono text-[7px]">Layers</span></button>
          {isFounder && <button onClick={()=>window.location.href='/founder'} className="w-10 h-10 rounded-xl bg-[#C45A3C] text-white flex flex-col items-center justify-center gap-0.5 mt-2" title="Admin Management Founder only"><span className="text-[10px]">👑</span><span className="mono text-[6px]">Admin</span></button>}
        </div>

        {showAddMenu && (
          <div className="w-[280px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] p-4 overflow-y-auto sticky top-[44px] h-[calc(100vh-44px)]">
            <div className="flex justify-between items-center"><div className="mono text-[11px] font-bold text-white">+ ADD - Blank Canvas</div><button onClick={()=>setShowAddMenu(false)} className="w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center text-[10px]">✕</button></div>
            <div className="mt-1 mono text-[9px] text-zinc-500">Every page is blank white canvas. Everything visible added onto it, so everything editable. Add → Choose → Place on canvas → Click → Edit → Move → Resize → Duplicate → Delete</div>
            
            <div className="mt-4 space-y-4">
              <div><div className="mono text-[10px] text-zinc-400">TEXT - Heading, Paragraph, Text Box</div><div className="mt-2 grid grid-cols-2 gap-2">{['Heading','Paragraph','Text Box'].map(t=><button key={t} onClick={()=>{ const el=document.createElement('div'); el.textContent=t+' - Click to edit'; el.style.padding='12px'; el.style.background='#18181b'; el.style.borderRadius='12px'; el.setAttribute('data-editable','true'); document.body.appendChild(el); setHasUnsaved(true); }} className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px] hover:border-orange-500">{t}</button>)}</div></div>
              <div><div className="mono text-[10px] text-zinc-400">MEDIA - Photo, Video, Icon</div><div className="mt-2 grid grid-cols-2 gap-2">{['Photo','Video','Icon'].map(m=><button key={m} className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px] hover:border-orange-500">{m}</button>)}</div></div>
              <div><div className="mono text-[10px] text-zinc-400">LAYOUT - Section Box, Container, Banner, Divider, Spacer</div><div className="mt-2 grid grid-cols-2 gap-2">{['Section Box','Container Box','Banner','Divider','Spacer'].map(l=><button key={l} className="h-10 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-orange-500">{l}</button>)}</div><div className="mt-1 mono text-[8px] text-zinc-600">Section Box like piece of paper on paper - Inside: Photo, Event Name, Location, Time, Places Left, JOIN Button - Each inside editable, whole section moves together</div></div>
              <div><div className="mono text-[10px] text-zinc-400">BUDDY BLIND - Event, Restaurant, Private Event, Quick Meet, Upcoming, Filters, JOIN, INVITE, SHARE, Profile, Comments & Rating</div><div className="mt-2 grid grid-cols-2 gap-2">{['Event Section','Restaurant Section','Private Event Section','Quick Meet','Upcoming Events','Filters','JOIN','INVITE','SHARE','Profile'].map(b=><button key={b} className="h-10 rounded-xl bg-black border border-zinc-800 text-[8px] hover:border-orange-500 px-1">{b}</button>)}</div><div className="mt-1 mono text-[8px] text-zinc-600">Features are also elements - Quick Meet is real function but visually element placed onto page - Control where appears and how looks, underlying function works normally</div></div>
            </div>
          </div>
        )}

        {/* CENTRE - Actual Buddy Blind website - show as much as website, editor can see editing and design clearly - blank canvas */}
        <div ref={canvasRef} className={'flex-1 bg-white overflow-auto min-h-[calc(100vh-44px)] relative ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          {/* Smart alignment lines */}
          <div data-alignment="center-v" className="hidden absolute left-1/2 top-0 bottom-0 w-px bg-[#C45A3C]/50 pointer-events-none z-50"></div>
          <div data-alignment="center-h" className="hidden absolute top-1/2 left-0 right-0 h-px bg-[#C45A3C]/50 pointer-events-none z-50"></div>
          <div data-alignment="left" className="hidden absolute left-1/3 top-0 bottom-0 w-px bg-orange-500/20 pointer-events-none z-50"></div>
          <div data-alignment="right" className="hidden absolute right-1/3 top-0 bottom-0 w-px bg-orange-500/20 pointer-events-none z-50"></div>

          <div data-bb-canvas className="bg-black min-h-screen text-white">
            {children}
          </div>

          {/* Section Box container visualization */}
          {selected && (selected.type==='section' || selected.type==='event' || selected.type==='restaurant') && (
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#C45A3C]/50 m-4 rounded-2xl"></div>
          )}
        </div>
      </div>

      {/* POP-UP TOOL - appears beside selected element - changes automatically depending on what was selected - clean */}
      {selected && selected.rect && !showTextEditor && (
        <div 
          className="fixed z-50 bg-[#0f0f0f] border border-zinc-700 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl"
          style={popupStyle as any}
        >
          {selected.type==='text' && (
            <>
              <span className="mono text-[9px] text-zinc-500 px-1">Text</span>
              <button onClick={()=>setShowTextEditor(true)} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold">Edit Text</button>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 border border-red-800 text-[10px]">✕</button>
              <span className="mono text-[8px] text-zinc-600 ml-1">Click text and type - Change wording, font, size, colour, style - Move, resize - Double-click to edit</span>
            </>
          )}
          {selected.type==='image' && (
            <>
              <span className="mono text-[9px] text-zinc-500 px-1">Photo</span>
              <button onClick={handleImageReplace} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold">Replace</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Crop</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Fit</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Fill</button>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 border border-red-800 text-[10px]">✕</button>
              <span className="mono text-[8px] text-zinc-600 ml-1">Replace, crop, resize, move, delete - Drag into box → Auto fits - Keep proportion not stretched - Fit/Fill/Crop/Reposition</span>
            </>
          )}
          {selected.type==='button' && (
            <>
              <span className="mono text-[9px] text-zinc-500 px-1">Button</span>
              <button onClick={()=>setShowTextEditor(true)} className="px-2 h-7 rounded-full bg-white text-black text-[10px] font-bold">Edit Text</button>
              <select className="h-7 bg-black border border-zinc-700 rounded-full px-2 text-[10px]"><option>JOIN Event</option><option>INVITE</option><option>SHARE</option><option>Go Back</option><option>Open Restaurant</option><option>Open Profile</option></select>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Design</button>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 text-[10px]">✕</button>
            </>
          )}
          {(selected.type==='section' || selected.type==='event' || selected.type==='restaurant' || selected.type==='feature') && (
            <>
              <span className="mono text-[9px] text-zinc-500 px-1">{selected.type}</span>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Background</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Layout</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Display Info</button>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 text-[10px]">✕</button>
              <span className="mono text-[8px] text-zinc-600 ml-1">{selected.type==='section'?'Section Box container - Inside: Photo, Heading, Description, Button - If section moved, elements inside move together': selected.type==='event'?'Event: Photo, Name, Venue, Date, Time, Places Left, Type, JOIN - Choose info displayed - Data from system': 'Restaurant: Photo, Name, Location, Cuisine, INVITE/JOIN - Choose display'}</span>
            </>
          )}
          <button onClick={()=>{ document.querySelectorAll('[data-editable-selected]').forEach(el=>el.removeAttribute('data-editable-selected')); setSelected(null); }} className="w-7 h-7 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-[10px] ml-1">✕</button>
        </div>
      )}

      {/* Selected highlight with resize handles */}
      {selected && selected.rect && !showTextEditor && (
        <div 
          className="fixed border-2 border-[#C45A3C] pointer-events-none z-40"
          style={{
            top: selected.rect.top + 'px',
            left: selected.rect.left + 'px',
            width: selected.rect.width + 'px',
            height: selected.rect.height + 'px',
          }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black pointer-events-auto cursor-nw-resize"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black pointer-events-auto cursor-ne-resize"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black pointer-events-auto cursor-sw-resize"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black pointer-events-auto cursor-se-resize"></div>
          <div className="absolute -bottom-6 left-0 bg-[#C45A3C] text-white text-[8px] px-1.5 py-0.5 rounded mono">{selected.type} · Click it → Edit it · Drag → Move · Corner → Resize · {dragging?'Dragging...':''}</div>
        </div>
      )}

      {/* FIXED TEXT EDITOR - readable - not distorted */}
      {showTextEditor && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-editor-ui>
          <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-[14px]">Edit Text: headline_3</h2>
              <span className="mono text-[10px] text-zinc-500">All pages - font, colour, size, bold/thin</span>
            </div>
            
            <div className="mt-6">
              <div className="mono text-[11px] text-zinc-400 mb-2">TEXT</div>
              <textarea 
                value={textValue}
                onChange={e=>setTextValue(e.target.value)}
                className="w-full min-h-[80px] bg-black border border-zinc-700 rounded-2xl p-4 text-white text-[14px] leading-relaxed focus:border-orange-500 outline-none resize-none"
                placeholder="That's the point."
                style={{fontFamily:'Inter, sans-serif', letterSpacing:'0.02em'}}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">COLOR - pick any</div>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-lg border border-zinc-700 flex-shrink-0" style={{backgroundColor: textColor}}></div>
                  <input value={textColor} onChange={e=>setTextColor(e.target.value)} className="flex-1 h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] font-mono" placeholder="#ffffff" />
                </div>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {[
                    {c:'#ffffff', name:'White'},
                    {c:'#000000', name:'Black'},
                    {c:'#C45A3C', name:'Orange'},
                    {c:'#CC7357', name:'Light Orange'},
                    {c:'#E8E6E1', name:'Cream'},
                    {c:'#8B8B8B', name:'Gray'},
                    {c:'#FF0000', name:'Red'},
                    {c:'#00FF00', name:'Green'},
                    {c:'#0000FF', name:'Blue'},
                    {c:'#FFFF00', name:'Yellow'},
                  ].map(color=>(
                    <button key={color.c} onClick={()=>setTextColor(color.c)} className="w-8 h-8 rounded-full border-2 hover:scale-110 transition" style={{backgroundColor: color.c, borderColor: textColor===color.c ? '#ffffff' : 'rgba(255,255,255,0.2)'}} title={color.name}></button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">SIZE - e.g. 14px, 24px, 2rem</div>
                <input value={textSize} onChange={e=>setTextSize(e.target.value)} placeholder="e.g. 18px" className="w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px]" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['12px','14px','16px','20px','24px','32px','48px','64px'].map(s=>(
                    <button key={s} onClick={()=>setTextSize(s)} className={'px-2.5 py-1 rounded-full text-[10px] border ' + (textSize===s?'bg-white text-black border-white':'bg-black border-zinc-700 text-zinc-400 hover:border-zinc-500')}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">FONT - all fonts imported</div>
                <select value={textFont} onChange={e=>setTextFont(e.target.value)} className="w-full h-11 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px]">
                  <option>Default</option>
                  <option>Inter</option>
                  <option>Serif</option>
                  <option>Mono</option>
                  <option>Playfair</option>
                  <option>Poppins</option>
                </select>
                <div className="mt-3 bg-black border border-zinc-800 rounded-xl p-3">
                  <div className="mono text-[9px] text-zinc-500 mb-1">Preview: That's the point.</div>
                  <div className="text-white text-[14px]" style={{color: textColor, fontSize: textSize, fontFamily: textFont==='Default'?'inherit':textFont, fontWeight: textWeight==='Bold'?'bold': textWeight==='Black'?'900': textWeight==='Thin'?'300':'400'}}>{textValue || "That's the point."}</div>
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">BOLD / THIN - weight</div>
                <select value={textWeight} onChange={e=>setTextWeight(e.target.value)} className="w-full h-11 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px]">
                  <option>Default</option>
                  <option>Thin</option>
                  <option>Bold</option>
                  <option>Black</option>
                </select>
                <div className="mt-3 flex gap-1.5">
                  {[
                    {label:'Thin', value:'Thin'},
                    {label:'Bold', value:'Bold'},
                    {label:'Black', value:'Black'},
                  ].map(w=>(
                    <button key={w.value} onClick={()=>setTextWeight(w.value)} className={'px-3 py-1.5 rounded-full text-[11px] border ' + (textWeight===w.value?'bg-white text-black border-white':'bg-black border-zinc-700 text-zinc-400')}>{w.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveText} className="flex-1 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-widest hover:scale-[1.02] transition">SAVE (Draft - instant)</button>
              <button onClick={()=>setShowTextEditor(false)} className="flex-1 h-12 rounded-full border border-zinc-700 text-zinc-400 text-[11px]">CANCEL</button>
            </div>
            <div className="mt-3 text-center mono text-[10px] text-zinc-600">Save = draft, instant on all pages. Use PUBLISH in top bar to go live.</div>
          </div>
        </div>
      )}

      {/* Layers */}
      {showLayers && (
        <div className="fixed left-[64px] top-[44px] w-[260px] h-[calc(100vh-44px)] bg-[#0f0f0f] border-r border-zinc-800 p-4 z-40 overflow-y-auto" data-editor-ui>
          <div className="flex justify-between"><div className="mono text-[11px] text-white">Layers - Blank Canvas</div><button onClick={()=>setShowLayers(false)} className="w-6 h-6 rounded-full border border-zinc-700 text-[10px]">✕</button></div>
          <div className="mt-1 mono text-[9px] text-zinc-500">HOME PAGE - Every page is blank white canvas - Everything added onto it, so everything editable</div>
          <div className="mt-4 space-y-1 mono text-[11px]">
            <div className="text-zinc-300">↳ Header</div>
            <div className="ml-3 text-zinc-500">↳ Logo</div>
            <div className="ml-3 text-zinc-500">↳ Navigation</div>
            <div className="ml-3 text-zinc-500">↳ Login / Welcome</div>
            <div className="mt-2 text-zinc-300">↳ Hero Section</div>
            <div className="ml-3 text-zinc-500">↳ Background</div>
            <div className="ml-3 text-zinc-500">↳ Heading: You don't know</div>
            <div className="ml-3 text-zinc-500">↳ Text: That's the point</div>
            <div className="ml-3 text-zinc-500">↳ Photo: Kissa Tanaka</div>
            <div className="ml-3 text-zinc-500">↳ JOIN Button</div>
            <div className="mt-2 text-zinc-300">↳ Restaurant Section</div>
            <div className="ml-3 text-zinc-500">↳ Restaurant Cards</div>
            <div className="ml-3 text-zinc-500">↳ INVITE / JOIN</div>
            <div className="mt-2 text-zinc-300">↳ Upcoming Events</div>
            <div className="mt-2 text-zinc-300">↳ Footer</div>
          </div>
          <div className="mt-4 mono text-[9px] text-zinc-600 leading-relaxed">Find and select element if page complicated - Click layer to select - Layers show hierarchy - If I can see it, I should be able to select it and edit it</div>
        </div>
      )}

      {showPages && (
        <div className="fixed left-[64px] top-[44px] w-[240px] h-[calc(100vh-44px)] bg-[#0f0f0f] border-r border-zinc-800 p-4 z-40" data-editor-ui>
          <div className="flex justify-between"><div className="mono text-[11px] text-white">Pages - All pages editable</div><button onClick={()=>setShowPages(false)} className="w-6 h-6 rounded-full border border-zinc-700 text-[10px]">✕</button></div>
          <div className="mt-3 space-y-2">
            {[
              {name:'Home', path:'/'},
              {name:'Venues', path:'/venues'},
              {name:'Private Events', path:'/private-events'},
              {name:'How It Works', path:'/how-it-works'},
              {name:'Premium', path:'/premium'},
              {name:'Profile', path:'/profile'},
              {name:'Invite', path:'/invite'},
              {name:'Join', path:'/join'},
              {name:'Founder', path:'/founder'},
            ].map(p=>(
              <a key={p.name} href={p.path} className="flex justify-between bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-[11px] hover:border-orange-500 transition"><span>{p.name}</span><span className="text-zinc-500">→</span></a>
            ))}
          </div>
          <div className="mt-4 mono text-[9px] text-zinc-600">All pages blank canvas - Everything visible should be editable - Click what you want to change - Add it, Select it, Edit it, Move it, Resize it, Duplicate it, Delete it - Website not fixed template</div>
        </div>
      )}
    </div>
  );
}
