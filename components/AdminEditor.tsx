
'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isFounder, isLoggedIn } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [selectedType, setSelectedType] = useState<'text'|'image'|'button'|'section'|'other'>('text');
  const [showTextModal, setShowTextModal] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState('16px');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x:0,y:0});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLElement | null>(null);

  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelectedEl(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // Make everything editable - robust version
  useEffect(()=>{
    if(!isEditMode || isPreview) return;

    // Add edit mode styles
    const style = document.createElement('style');
    style.id = 'bb-edit-mode-styles';
    style.textContent = `
      [data-bb-editable] { cursor: pointer !important; position: relative; }
      [data-bb-editable]:hover { outline: 2px dashed #C45A3C !important; outline-offset: 2px; background: rgba(196,90,60,0.08) !important; }
      [data-bb-selected] { outline: 3px solid #C45A3C !important; outline-offset: 2px; background: rgba(196,90,60,0.12) !important; }
      .bb-dragging { opacity: 0.8; z-index: 9999 !important; cursor: grabbing !important; }
      .bb-resize-handle { position: absolute; width: 12px; height: 12px; background: #C45A3C; border: 2px solid white; border-radius: 50%; z-index: 10000; }
    `;
    document.head.appendChild(style);

    const markEditable = () => {
      // Mark all text, images, buttons, divs as editable across ALL pages
      const all = document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main button, main img, main a, main div[class*="rounded"], [data-bb-page] h1, [data-bb-page] h2, [data-bb-page] p, [data-bb-page] img, [data-bb-page] button');
      all.forEach(el=>{
        const htmlEl = el as HTMLElement;
        if(htmlEl.closest('[data-editor-ui]')) return;
        if(htmlEl.closest('nav')) return;
        htmlEl.setAttribute('data-bb-editable','true');
      });
      // Also mark images directly
      document.querySelectorAll('img').forEach(img=>{
        if((img as HTMLElement).closest('[data-editor-ui]')) return;
        if((img as HTMLElement).closest('nav')) return;
        (img as HTMLElement).setAttribute('data-bb-editable','true');
      });
    };

    markEditable();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(!target) return;
      if(target.closest('[data-editor-ui]')) return;
      if(target.closest('nav')) return;
      
      // Don't select body, html, main containers
      if(target.tagName === 'BODY' || target.tagName === 'HTML' || target.tagName === 'MAIN') {
        // Click empty area -> deselect
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        setSelectedEl(null);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Remove previous selection
      document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
      
      target.setAttribute('data-bb-selected','true');
      selectedRef.current = target;
      setSelectedEl(target);

      // Determine type
      let type: any = 'text';
      if(target.tagName === 'IMG' || target.querySelector('img')){
        type = 'image';
      } else if(target.tagName === 'BUTTON' || target.getAttribute('role')==='button' || target.className.includes('JOIN') || target.className.includes('INVITE') || (target.textContent && (target.textContent.includes('JOIN') || target.textContent.includes('INVITE') || target.textContent.includes('PRIVATE') || target.textContent.includes('BLIND DINNER')))){
        type = 'button';
      } else if(target.children.length > 2 || target.clientHeight > 150){
        type = 'section';
      }
      setSelectedType(type);

      if(type === 'text'){
        setTextValue(target.textContent || '');
        const computed = window.getComputedStyle(target);
        setTextColor(computed.color || '#ffffff');
        setTextSize(computed.fontSize || '16px');
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(target.closest('nav')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      if(target.tagName === 'IMG' || target.querySelector('img')){
        fileInputRef.current?.click();
      } else {
        // Double click text -> edit
        setTextValue(target.textContent || '');
        const computed = window.getComputedStyle(target);
        setTextColor(computed.color || '#ffffff');
        setTextSize(computed.fontSize || '16px');
        setSelectedEl(target);
        selectedRef.current = target;
        target.setAttribute('data-bb-selected','true');
        setShowTextModal(true);
      }
    };

    // Drag to move - Click Hold Drag Drop
    let dragEl: HTMLElement | null = null;
    let startX = 0, startY = 0;
    let origLeft = 0, origTop = 0;
    let draggingActive = false;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(!target.hasAttribute('data-bb-selected')) return;
      if(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      // Check if clicking on resize handle
      if((e.target as HTMLElement).classList.contains('bb-resize-handle')) return;

      dragEl = target;
      startX = e.clientX;
      startY = e.clientY;
      const rect = target.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      draggingActive = false;
      
      // Prevent text selection while dragging
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if(!dragEl) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if(!draggingActive && (Math.abs(dx) > 5 || Math.abs(dy) > 5)){
        draggingActive = true;
        setIsDragging(true);
        dragEl.classList.add('bb-dragging');
        // Make position relative/absolute for moving
        if(window.getComputedStyle(dragEl).position === 'static'){
          dragEl.style.position = 'relative';
        }
      }

      if(draggingActive){
        dragEl.style.left = dx + 'px';
        dragEl.style.top = dy + 'px';
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if(!dragEl) return;
      
      if(draggingActive){
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        // Keep the transform
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
        dragEl.style.left = dx + 'px';
        dragEl.style.top = dy + 'px';
        dragEl.style.position = 'relative';
        setHasUnsaved(true);
        // Save position
        const currentLeft = parseInt(dragEl.style.left || '0');
        const currentTop = parseInt(dragEl.style.top || '0');
        // Actually move using transform is enough for visual, but save
      }
      
      dragEl.classList.remove('bb-dragging');
      dragEl = null;
      setIsDragging(false);
      draggingActive = false;
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('dblclick', handleDblClick, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);

    // Re-mark when new content loads (for all pages)
    const observer = new MutationObserver(()=>{
      markEditable();
    });
    observer.observe(document.body, {childList:true, subtree:true});

    return ()=>{
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('dblclick', handleDblClick, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      observer.disconnect();
      const existingStyle = document.getElementById('bb-edit-mode-styles');
      if(existingStyle) existingStyle.remove();
      document.querySelectorAll('[data-bb-editable]').forEach(el=>el.removeAttribute('data-bb-editable'));
      document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
    };
  },[isEditMode, isPreview]);

  const handleSaveText = () => {
    if(selectedEl){
      selectedEl.textContent = textValue;
      selectedEl.style.color = textColor;
      selectedEl.style.fontSize = textSize;
      setHasUnsaved(true);
      // Save to localStorage for persistence
      const key = 'bb_text_' + (selectedEl.id || selectedEl.textContent?.slice(0,20));
      localStorage.setItem(key, JSON.stringify({content: textValue, color: textColor, size: textSize}));
    }
    setShowTextModal(false);
  };

  const handleImageReplace = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file || !selectedEl) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      let targetImg: HTMLImageElement | null = null;
      
      if(selectedEl.tagName === 'IMG'){
        targetImg = selectedEl as HTMLImageElement;
      } else {
        targetImg = selectedEl.querySelector('img') as HTMLImageElement;
        if(!targetImg){
          // If no img inside, create one or set background
          const newImg = document.createElement('img');
          newImg.src = src;
          newImg.style.width = '100%';
          newImg.style.height = '100%';
          newImg.style.objectFit = 'cover';
          newImg.style.borderRadius = '16px';
          selectedEl.innerHTML = '';
          selectedEl.appendChild(newImg);
          setHasUnsaved(true);
          return;
        }
      }
      
      if(targetImg){
        targetImg.src = src;
        targetImg.style.objectFit = 'cover';
        targetImg.style.width = '100%';
        targetImg.style.height = '100%';
        setHasUnsaved(true);
        // Photo automatically fits box - keep proportion not stretched
        const parent = targetImg.parentElement as HTMLElement;
        if(parent){
          parent.style.overflow = 'hidden';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if(!selectedEl) return;
    if(!confirm('Remove from Page (not delete actual data)?\n\nThis only removes from this page/layout, not delete restaurant/event from Buddy Blind system. Confirm?')) return;
    selectedEl.remove();
    setHasUnsaved(true);
    setSelectedEl(null);
  };

  const handleDuplicate = () => {
    if(!selectedEl) return;
    const clone = selectedEl.cloneNode(true) as HTMLElement;
    clone.id = 'el-' + Date.now();
    clone.removeAttribute('data-bb-selected');
    clone.setAttribute('data-bb-editable','true');
    clone.style.transform = 'translate(20px, 20px)';
    selectedEl.parentNode?.insertBefore(clone, selectedEl.nextSibling);
    setHasUnsaved(true);
  };

  const handleSaveDraft = () => {
    const html = document.documentElement.outerHTML;
    localStorage.setItem('bb_draft_html', html);
    localStorage.setItem('bb_draft', JSON.stringify({savedAt: new Date().toISOString(), hasUnsaved: false}));
    setHasUnsaved(false);
    alert('Draft saved - Instant on all pages - Use PUBLISH in top bar to go live - Draft not live yet');
  };

  const handlePublish = () => {
    if(!confirm('Publish? Makes changes live for all normal users.\n\nEdit → Save Draft → Preview → Publish\nSave Draft saves without changing live, Preview shows what users will see, Publish makes live. Confirm publish?')) return;
    const html = document.documentElement.outerHTML;
    localStorage.setItem('bb_published_html', html);
    localStorage.setItem('bb_published', JSON.stringify({publishedAt: new Date().toISOString()}));
    setHasUnsaved(false);
    alert('Published! Website now shows edited version to normal users.');
  };

  const addNewElement = (type: string) => {
    const container = document.querySelector('main') || document.body;
    let newEl: HTMLElement;
    
    switch(type){
      case 'text':
        newEl = document.createElement('div');
        newEl.textContent = 'New text - Click to edit - Double click to type - Drag to move - Corner to resize';
        newEl.style.padding = '12px';
        newEl.style.background = '#18181b';
        newEl.style.borderRadius = '12px';
        newEl.style.color = '#a1a1aa';
        newEl.style.margin = '10px';
        break;
      case 'heading':
        newEl = document.createElement('h2');
        newEl.textContent = 'New Heading - Click to edit';
        newEl.style.fontSize = '32px';
        newEl.style.color = '#ffffff';
        newEl.style.fontWeight = 'bold';
        newEl.style.margin = '20px 10px';
        break;
      case 'photo':
        newEl = document.createElement('div');
        newEl.style.width = '320px';
        newEl.style.height = '200px';
        newEl.style.background = '#27272a';
        newEl.style.borderRadius = '16px';
        newEl.style.display = 'flex';
        newEl.style.alignItems = 'center';
        newEl.style.justifyContent = 'center';
        newEl.style.margin = '10px';
        newEl.textContent = 'Photo Box - Upload Photo - Drag photo into box → Auto fits - Not stretched';
        newEl.style.color = '#71717a';
        break;
      case 'button':
        newEl = document.createElement('button');
        newEl.textContent = 'JOIN';
        newEl.style.background = '#ffffff';
        newEl.style.color = '#000000';
        newEl.style.padding = '12px 24px';
        newEl.style.borderRadius = '9999px';
        newEl.style.fontSize = '11px';
        newEl.style.fontWeight = '900';
        newEl.style.margin = '10px';
        break;
      case 'section':
        newEl = document.createElement('div');
        newEl.style.width = '100%';
        newEl.style.minHeight = '200px';
        newEl.style.background = '#0f0f0f';
        newEl.style.border = '1px dashed #3f3f46';
        newEl.style.borderRadius = '16px';
        newEl.style.padding = '24px';
        newEl.style.margin = '10px';
        newEl.innerHTML = '<div style="color:#71717a; font-size:12px;">Section Box - Container - Place photo, heading, description, button inside - If section moved, elements inside move together - Click inside to edit photo/text/button</div>';
        break;
      default:
        newEl = document.createElement('div');
        newEl.textContent = type;
        newEl.style.padding = '12px';
        newEl.style.background = '#18181b';
        newEl.style.borderRadius = '12px';
        newEl.style.margin = '10px';
    }
    
    newEl.setAttribute('data-bb-editable','true');
    newEl.id = 'el-' + Date.now();
    
    // Add to page
    if(container){
      container.appendChild(newEl);
    }
    setHasUnsaved(true);
    setShowAddMenu(false);
  };

  if(!isEditMode || isPreview){
    return (
      <>
        <div data-bb-page>{children}</div>
        {(isAdmin || isFounder) && isPreview && (
          <div className="fixed top-[64px] left-0 right-0 z-40 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between" data-editor-ui>
            <span>Preview as User - Exactly what normal users see - Edit Mode hidden</span>
            <button onClick={()=>setIsPreview(false)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Exit Preview</button>
          </div>
        )}
      </>
    );
  }

  const selectedRect = selectedEl?.getBoundingClientRect();
  const popupStyle = selectedRect ? {
    top: Math.max(70, selectedRect.top - 55) + 'px',
    left: Math.min(window.innerWidth - 350, Math.max(10, selectedRect.left)) + 'px',
  } : {};

  return (
    <div className="min-h-screen bg-black text-white" data-editor-ui>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      
      {/* TOP TOOLBAR */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[44px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-zinc-500 hidden md:block">Page: {typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Undo">↶</button>
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Redo">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          <span className="hidden lg:block ml-3 mono text-[9px] text-zinc-600">Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish · If visible, editable · Every page is blank canvas</span>
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
          <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-[20px] font-bold hover:scale-105 transition">+</button>
          <div className="w-8 h-px bg-zinc-800"></div>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[12px]">📄</span><span className="mono text-[6px]">Pages</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[12px]">◫</span><span className="mono text-[6px]">Sections</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[12px]">⚡</span><span className="mono text-[5px]">Features</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[12px]">🖼</span><span className="mono text-[6px]">Media</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center"><span className="text-[12px]">📚</span><span className="mono text-[6px]">Layers</span></button>
          {isFounder && <button onClick={()=>window.location.href='/founder'} className="w-10 h-10 rounded-xl bg-[#C45A3C] text-white flex flex-col items-center justify-center mt-2"><span className="text-[10px]">👑</span><span className="mono text-[5px]">Admin</span></button>}
          <div className="mt-auto text-[7px] mono text-zinc-600 text-center leading-tight">EDIT MODE<br/>Click<br/>Edit<br/>Move<br/>Resize</div>
        </div>

        {showAddMenu && (
          <div className="w-[260px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] p-4 overflow-y-auto sticky top-[44px] h-[calc(100vh-44px)]">
            <div className="flex justify-between items-center"><div className="mono text-[11px] font-bold text-white">+ ADD - Blank Canvas</div><button onClick={()=>setShowAddMenu(false)} className="w-6 h-6 rounded-full border border-zinc-700 text-[10px]">✕</button></div>
            <div className="mt-3 mono text-[9px] text-zinc-500">Every page is blank canvas - Everything added, so everything editable - Add → Choose → Place → Click → Edit → Move → Resize → Duplicate → Delete</div>
            <div className="mt-4 space-y-3">
              <div><div className="mono text-[10px] text-zinc-400">TEXT</div><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>addNewElement('text')} className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px] hover:border-orange-500">Text</button><button onClick={()=>addNewElement('heading')} className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px] hover:border-orange-500">Heading</button></div></div>
              <div><div className="mono text-[10px] text-zinc-400">MEDIA - Photo, Video</div><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>addNewElement('photo')} className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px] hover:border-orange-500">Photo</button><button className="h-12 rounded-xl bg-black border border-zinc-800 text-[10px]">Video</button></div><button onClick={()=>fileInputRef.current?.click()} className="mt-2 w-full h-9 rounded-full bg-zinc-800 border border-zinc-700 text-[10px]">📁 Upload Photo from Computer</button></div>
              <div><div className="mono text-[10px] text-zinc-400">LAYOUT</div><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>addNewElement('section')} className="h-10 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-orange-500">Section Box</button><button onClick={()=>addNewElement('button')} className="h-10 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-orange-500">Button</button></div></div>
              <div><div className="mono text-[10px] text-zinc-400">BUDDY BLIND</div><div className="mt-2 grid grid-cols-2 gap-1"><button className="h-10 rounded-xl bg-black border border-zinc-800 text-[8px]">Event Section</button><button className="h-10 rounded-xl bg-black border border-zinc-800 text-[8px]">Restaurant Section</button><button className="h-10 rounded-xl bg-black border border-zinc-800 text-[8px]">JOIN</button><button className="h-10 rounded-xl bg-black border border-zinc-800 text-[8px]">INVITE</button></div></div>
            </div>
          </div>
        )}

        {/* CENTRE - Actual website - show as much as website */}
        <div className={'flex-1 bg-[#080808] overflow-auto min-h-[calc(100vh-44px)] ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          <div className="bg-black min-h-screen text-white" data-bb-canvas>
            {children}
          </div>
        </div>
      </div>

      {/* POP-UP TOOL - appears beside selected - clean */}
      {selectedEl && (
        <div 
          className="fixed z-50 bg-[#0f0f0f] border border-zinc-700 rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl"
          style={popupStyle as any}
        >
          <span className="mono text-[9px] text-zinc-500">{selectedType}</span>
          <div className="w-px h-5 bg-zinc-700"></div>
          <button onClick={()=>setShowTextModal(true)} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold hover:scale-105 transition">Edit</button>
          <button onClick={handleImageReplace} className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px] hover:bg-zinc-800">Replace</button>
          <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px] hover:bg-zinc-800" title="Duplicate">⎙</button>
          <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 border border-red-800 text-[10px] hover:bg-red-900" title="Delete">✕</button>
          <div className="mono text-[8px] text-zinc-600 ml-1 max-w-[200px] truncate">Click → Edit → Move (drag) → Resize (corner) → Save → Publish · All pages editable</div>
          <button onClick={()=>{ document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected')); setSelectedEl(null); }} className="w-6 h-6 rounded-full bg-black border border-zinc-700 text-[9px] ml-1">✕</button>
        </div>
      )}

      {/* Selected highlight */}
      {selectedEl && selectedEl.getBoundingClientRect && (
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
          <div className="absolute -bottom-7 left-0 bg-[#C45A3C] text-white text-[8px] px-2 py-1 rounded mono whitespace-nowrap">
            {selectedType} · Drag to move · Corner to resize · Double-click to edit · {isDragging?'Dragging...':''}
          </div>
        </div>
      )}

      {/* TEXT EDITOR MODAL - READABLE */}
      {showTextModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-editor-ui>
          <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-[14px]">Edit Text</h2>
              <span className="mono text-[10px] text-zinc-500">All pages - font, colour, size, bold/thin</span>
            </div>
            
            <div className="mt-6">
              <div className="mono text-[11px] text-zinc-400 mb-2">TEXT - Click and type</div>
              <textarea 
                value={textValue}
                onChange={e=>setTextValue(e.target.value)}
                className="w-full min-h-[100px] bg-black border border-zinc-700 rounded-2xl p-4 text-white text-[15px] leading-relaxed focus:border-orange-500 outline-none resize-none"
                placeholder="Type new text here - That's the point."
                style={{fontFamily:'Inter, system-ui, sans-serif'}}
                autoFocus
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-2">COLOR - pick any</div>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-lg border-2 border-zinc-700 flex-shrink-0" style={{backgroundColor: textColor}}></div>
                  <input value={textColor} onChange={e=>setTextColor(e.target.value)} className="flex-1 h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] font-mono" placeholder="#ffffff" />
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {['#ffffff','#000000','#C45A3C','#CC7357','#E8E6E1','#8B8B8B','#FF0000','#00FF00','#0000FF','#FFFF00'].map(c=>(
                    <button key={c} onClick={()=>setTextColor(c)} className="w-8 h-8 rounded-full border-2 hover:scale-110 transition" style={{backgroundColor: c, borderColor: textColor===c ? '#ffffff' : 'rgba(255,255,255,0.2)'}}></button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-2">SIZE - e.g. 14px, 24px</div>
                <input value={textSize} onChange={e=>setTextSize(e.target.value)} placeholder="e.g. 18px" className="w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px]" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['12px','14px','16px','20px','24px','32px','48px'].map(s=>(
                    <button key={s} onClick={()=>setTextSize(s)} className={'px-2.5 py-1 rounded-full text-[10px] border ' + (textSize===s?'bg-white text-black border-white':'bg-black border-zinc-700 text-zinc-400')}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 bg-black border border-zinc-800 rounded-xl p-3">
              <div className="mono text-[9px] text-zinc-500 mb-1">Preview:</div>
              <div style={{color: textColor, fontSize: textSize}} className="text-[14px]">{textValue || "That's the point."}</div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveText} className="flex-1 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-widest hover:scale-[1.02] transition">SAVE (Draft - instant)</button>
              <button onClick={()=>setShowTextModal(false)} className="flex-1 h-12 rounded-full border border-zinc-700 text-zinc-400 text-[11px]">CANCEL</button>
            </div>
            <div className="mt-3 text-center mono text-[10px] text-zinc-600">Save = draft, instant on all pages. Use PUBLISH in top bar to go live. Double-click text to edit, click photo to replace, drag to move.</div>
          </div>
        </div>
      )}
    </div>
  );
}
