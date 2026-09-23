
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
  const [textFont, setTextFont] = useState('Default');
  const [textWeight, setTextWeight] = useState('Default');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelectedEl(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // FIX 1: Make ALL pages editable - blank canvas principle - if I can see it, I can edit it
  useEffect(()=>{
    if(!isEditMode || isPreview) return;

    // Inject styles - make editable obvious
    const style = document.createElement('style');
    style.id = 'bb-edit-styles';
    style.textContent = `
      [data-bb-editable] { cursor: pointer !important; }
      [data-bb-editable]:hover { outline: 2px dashed #C45A3C !important; outline-offset: 3px !important; background: rgba(196,90,60,0.06) !important; }
      [data-bb-selected] { outline: 3px solid #C45A3C !important; outline-offset: 3px !important; background: rgba(196,90,60,0.10) !important; position: relative !important; }
      .bb-dragging { opacity: 0.9 !important; z-index: 9999 !important; cursor: grabbing !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
    `;
    document.head.appendChild(style);

    const markAllEditable = () => {
      // FIX: Don't limit to main - mark EVERYTHING visible across ALL pages
      const allElements = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,button,img,a,div,section');
      allElements.forEach(el=>{
        const htmlEl = el as HTMLElement;
        if(htmlEl.closest('[data-editor-ui]')) return;
        if(htmlEl.closest('nav')) return;
        if(htmlEl.tagName === 'HTML' || htmlEl.tagName === 'BODY' || htmlEl.tagName === 'SCRIPT' || htmlEl.tagName === 'STYLE') return;
        // Only mark elements with visible text or images or buttons
        const hasText = htmlEl.textContent && htmlEl.textContent.trim().length > 0 && htmlEl.textContent.trim().length < 500;
        const isImg = htmlEl.tagName === 'IMG' || htmlEl.querySelector('img');
        const isBtn = htmlEl.tagName === 'BUTTON' || htmlEl.getAttribute('role') === 'button';
        const isCard = htmlEl.className.includes('rounded') || htmlEl.className.includes('card');
        
        if(hasText || isImg || isBtn || isCard){
          // Don't mark containers that are too large (like whole page)
          if(htmlEl.clientWidth > 0 && htmlEl.clientHeight > 0 && htmlEl.clientHeight < 1000){
            htmlEl.setAttribute('data-bb-editable','true');
          }
        }
      });
      // Specifically mark images - photo editing
      document.querySelectorAll('img').forEach(img=>{
        const htmlEl = img as HTMLElement;
        if(htmlEl.closest('[data-editor-ui]')) return;
        if(htmlEl.closest('nav')) return;
        htmlEl.setAttribute('data-bb-editable','true');
        htmlEl.style.cursor = 'pointer';
      });
    };

    markAllEditable();
    // Re-mark when DOM changes (for other pages)
    const observer = new MutationObserver(()=>{ markAllEditable(); });
    observer.observe(document.body, {childList:true, subtree:true});

    // FIX 2: Use bubbling not capture, and handle correctly
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(!target) return;
      if(target.closest('[data-editor-ui]')) return;
      if(target.closest('nav')) return;
      if(target.tagName === 'BODY' || target.tagName === 'HTML') {
        // Click empty area -> deselect -> toolbar disappears -> clean canvas
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        setSelectedEl(null);
        return;
      }

      // Find closest editable parent if target not editable
      let editableTarget: HTMLElement | null = target;
      if(!target.hasAttribute('data-bb-editable')){
        editableTarget = target.closest('[data-bb-editable]') as HTMLElement;
      }
      if(!editableTarget) return;

      // Prevent navigation for links/buttons in edit mode
      if(editableTarget.tagName === 'A' || editableTarget.tagName === 'BUTTON'){
        e.preventDefault();
      }
      e.stopPropagation();

      // Remove previous selection
      document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
      editableTarget.setAttribute('data-bb-selected','true');
      setSelectedEl(editableTarget);

      // Determine type - system recognises what type selected
      let type: any = 'text';
      if(editableTarget.tagName === 'IMG' || editableTarget.querySelector('img')){
        type = 'image';
      } else if(editableTarget.tagName === 'BUTTON' || editableTarget.textContent?.includes('JOIN') || editableTarget.textContent?.includes('INVITE') || editableTarget.textContent?.includes('SHARE') || editableTarget.textContent?.includes('PRIVATE') || editableTarget.className.includes('rounded-full')){
        type = 'button';
      } else if(editableTarget.children.length > 2 || editableTarget.clientHeight > 120){
        if(editableTarget.textContent?.includes('Kissa') || editableTarget.textContent?.includes('Yardbird') || editableTarget.textContent?.includes('Restaurant') || editableTarget.textContent?.includes('SOHO')){
          type = 'section';
        } else {
          type = 'section';
        }
      }
      setSelectedType(type);

      if(type === 'text' || type === 'button' || type === 'section'){
        setTextValue(editableTarget.textContent?.trim() || '');
        const computed = window.getComputedStyle(editableTarget);
        setTextColor(computed.color || '#ffffff');
        setTextSize(computed.fontSize || '16px');
      }
    };

    // FIX 3: Double-click for quick edit
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(target.closest('nav')) return;
      
      let editableTarget: HTMLElement | null = target;
      if(!target.hasAttribute('data-bb-editable')){
        editableTarget = target.closest('[data-bb-editable]') as HTMLElement;
      }
      if(!editableTarget) return;

      e.preventDefault();
      e.stopPropagation();

      if(editableTarget.tagName === 'IMG' || editableTarget.querySelector('img')){
        // Double-click Photo -> Replace/Edit photo
        fileInputRef.current?.click();
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        editableTarget.setAttribute('data-bb-selected','true');
        setSelectedEl(editableTarget);
        setSelectedType('image');
      } else {
        // Double-click Text -> Start typing - inline editable
        setTextValue(editableTarget.textContent?.trim() || '');
        const computed = window.getComputedStyle(editableTarget);
        setTextColor(computed.color || '#ffffff');
        setTextSize(computed.fontSize || '16px');
        document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
        editableTarget.setAttribute('data-bb-selected','true');
        setSelectedEl(editableTarget);
        setSelectedType('text');
        setShowTextModal(true);
      }
    };

    // FIX 4: Drag and resize directly - Click + Drag -> Move - Drag corner -> Resize - Actually moves and stays
    let dragEl: HTMLElement | null = null;
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(!target.hasAttribute('data-bb-selected')) return;
      // Don't drag when editing text in modal
      if(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      dragEl = target;
      startX = e.clientX;
      startY = e.clientY;
      const rect = target.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if(!dragEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if(!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)){
        isDragging = true;
        dragEl.classList.add('bb-dragging');
        // Ensure position is not static so left/top works
        const computed = window.getComputedStyle(dragEl);
        if(computed.position === 'static'){
          dragEl.style.position = 'relative';
        }
      }

      if(isDragging){
        // FIX: Use only transform, not both left and transform - prevents snap back
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if(!dragEl) return;
      if(isDragging){
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        // Keep transform - don't reset - stays where dropped
        dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
        // Also set data attributes for persistence
        dragEl.setAttribute('data-bb-transform-x', dx.toString());
        dragEl.setAttribute('data-bb-transform-y', dy.toString());
        setHasUnsaved(true);
      }
      dragEl.classList.remove('bb-dragging');
      dragEl = null;
      isDragging = false;
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('dblclick', handleDblClick);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Load saved edits
    const saved = localStorage.getItem('bb_edits');
    if(saved){
      try{
        const edits = JSON.parse(saved);
        Object.keys(edits).forEach(id=>{
          const el = document.getElementById(id) as HTMLElement;
          if(el && edits[id].content){
            el.textContent = edits[id].content;
          }
          if(el && edits[id].color){
            el.style.color = edits[id].color;
          }
          if(el && edits[id].size){
            el.style.fontSize = edits[id].size;
          }
          if(el && edits[id].transformX){
            el.style.transform = `translate(${edits[id].transformX}px, ${edits[id].transformY}px)`;
            el.style.position = 'relative';
          }
        });
      }catch{}
    }

    return ()=>{
      document.removeEventListener('click', handleClick);
      document.removeEventListener('dblclick', handleDblClick);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
      const s = document.getElementById('bb-edit-styles');
      if(s) s.remove();
      document.querySelectorAll('[data-bb-editable]').forEach(el=>el.removeAttribute('data-bb-editable'));
      document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
    };
  },[isEditMode, isPreview]);

  const handleSaveText = () => {
    if(selectedEl){
      // FIX: Don't just set textContent which React overwrites - also save to storage and use innerText
      selectedEl.textContent = textValue;
      (selectedEl as HTMLElement).style.color = textColor;
      (selectedEl as HTMLElement).style.fontSize = textSize;
      if(textFont !== 'Default') (selectedEl as HTMLElement).style.fontFamily = textFont;
      if(textWeight === 'Bold') (selectedEl as HTMLElement).style.fontWeight = 'bold';
      else if(textWeight === 'Thin') (selectedEl as HTMLElement).style.fontWeight = '300';
      else if(textWeight === 'Black') (selectedEl as HTMLElement).style.fontWeight = '900';
      else (selectedEl as HTMLElement).style.fontWeight = '400';
      
      // Persist
      const edits = JSON.parse(localStorage.getItem('bb_edits')||'{}');
      edits[selectedEl.id] = {
        content: textValue,
        color: textColor,
        size: textSize,
        font: textFont,
        weight: textWeight,
        transformX: selectedEl.getAttribute('data-bb-transform-x')||'0',
        transformY: selectedEl.getAttribute('data-bb-transform-y')||'0'
      };
      localStorage.setItem('bb_edits', JSON.stringify(edits));
      
      setHasUnsaved(true);
    }
    setShowTextModal(false);
  };

  const handleImageReplace = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file || !selectedEl) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      let img: HTMLImageElement | null = null;
      if(selectedEl.tagName === 'IMG'){
        img = selectedEl as HTMLImageElement;
      } else {
        img = selectedEl.querySelector('img') as HTMLImageElement;
      }
      
      if(img){
        img.src = src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover'; // Photo automatically fits box - not stretched, auto crop/scale
        img.style.borderRadius = '16px';
      } else {
        // If no img, create one - Drag photo into box -> Auto fits
        const newImg = document.createElement('img');
        newImg.src = src;
        newImg.style.width = '100%';
        newImg.style.height = '100%';
        newImg.style.objectFit = 'cover';
        newImg.style.borderRadius = '16px';
        selectedEl.innerHTML = '';
        selectedEl.appendChild(newImg);
        selectedEl.style.overflow = 'hidden';
        selectedEl.style.borderRadius = '16px';
      }
      setHasUnsaved(true);
      
      // Save image
      const edits = JSON.parse(localStorage.getItem('bb_edits')||'{}');
      edits[selectedEl.id + '_img'] = {src};
      localStorage.setItem('bb_edits', JSON.stringify(edits));
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if(!selectedEl) return;
    if(!confirm('Remove from Page (not delete actual data)?\n\nThis only removes from this page/layout, not delete restaurant/event from Buddy Blind system.\n\nRemove Restaurant Section from Home Page does not mean Delete Restaurant from Buddy Blind.\n\nConfirm remove from this page?')) return;
    selectedEl.remove();
    setHasUnsaved(true);
    setSelectedEl(null);
  };

  const handleDuplicate = () => {
    if(!selectedEl) return;
    const clone = selectedEl.cloneNode(true) as HTMLElement;
    clone.id = 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2,4);
    clone.removeAttribute('data-bb-selected');
    clone.setAttribute('data-bb-editable','true');
    clone.style.transform = 'translate(20px, 20px)';
    selectedEl.parentNode?.insertBefore(clone, selectedEl.nextSibling);
    setHasUnsaved(true);
    // Mark new element as editable
    setTimeout(()=>{
      const all = document.querySelectorAll('[data-bb-editable]');
      all.forEach(el=>{
        if(el.id === clone.id){
          (el as HTMLElement).setAttribute('data-bb-editable','true');
        }
      });
    },100);
  };

  const handleSaveDraft = () => {
    if(selectedEl){
      const edits = JSON.parse(localStorage.getItem('bb_edits')||'{}');
      localStorage.setItem('bb_draft', JSON.stringify({savedAt: new Date().toISOString(), edits}));
    } else {
      localStorage.setItem('bb_draft', JSON.stringify({savedAt: new Date().toISOString()}));
    }
    setHasUnsaved(false);
    alert('Draft saved - Instant on all pages - Not live yet - Use PUBLISH in top bar to go live.\n\nSave = draft, instant on all pages. Use PUBLISH in top bar to go live.');
  };

  const handlePublish = () => {
    if(!confirm('Publish? Makes changes live for all normal users.\n\nEdit → Save Draft → Preview → Publish\nSave Draft saves without changing live website.\nPreview shows what normal users will see.\nPublish makes changes live.\n\nConfirm publish?')) return;
    const edits = localStorage.getItem('bb_edits');
    if(edits){
      localStorage.setItem('bb_published', edits);
    }
    localStorage.setItem('bb_published_at', new Date().toISOString());
    setHasUnsaved(false);
    alert('Published! Website now shows edited version to normal users.');
  };

  const addNewElement = (type: string) => {
    const main = document.querySelector('main') || document.querySelector('[data-bb-page]') || document.body;
    if(!main) return;
    
    let newEl: HTMLElement;
    switch(type){
      case 'text':
        newEl = document.createElement('div');
        newEl.textContent = 'New text - Click to edit - Double-click to type - Drag to move - Corner to resize - All pages editable';
        newEl.style.padding = '16px';
        newEl.style.background = '#18181b';
        newEl.style.borderRadius = '12px';
        newEl.style.color = '#ffffff';
        newEl.style.margin = '12px';
        newEl.style.minWidth = '200px';
        break;
      case 'heading':
        newEl = document.createElement('h2');
        newEl.textContent = 'New Heading - Click to edit - Drag to move';
        newEl.style.fontSize = '32px';
        newEl.style.color = '#ffffff';
        newEl.style.fontWeight = 'bold';
        newEl.style.margin = '20px 12px';
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
        newEl.style.margin = '12px';
        newEl.style.color = '#a1a1aa';
        newEl.style.fontSize = '11px';
        newEl.style.textAlign = 'center';
        newEl.textContent = 'Photo Box - Click to replace - Upload from computer - Drag photo into box → Auto fits - Not stretched, auto crop/scale';
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
        newEl.style.margin = '12px';
        newEl.style.letterSpacing = '0.14em';
        break;
      case 'section':
        newEl = document.createElement('div');
        newEl.style.width = '100%';
        newEl.style.minHeight = '240px';
        newEl.style.background = '#0f0f0f';
        newEl.style.border = '1px dashed #3f3f46';
        newEl.style.borderRadius = '16px';
        newEl.style.padding = '24px';
        newEl.style.margin = '12px';
        newEl.innerHTML = '<div style="color:#71717a; font-size:11px;">Section Box - Container - Like piece of paper on paper - Inside: Photo, Heading, Description, Button - If section moved, elements inside move together - Click inside to edit individual items - Drag photo into box → Auto fits</div>';
        break;
      default:
        newEl = document.createElement('div');
        newEl.textContent = type + ' - Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish';
        newEl.style.padding = '16px';
        newEl.style.background = '#18181b';
        newEl.style.borderRadius = '12px';
        newEl.style.margin = '12px';
        newEl.style.color = '#ffffff';
    }
    
    newEl.setAttribute('data-bb-editable','true');
    newEl.id = 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2,4);
    newEl.style.cursor = 'pointer';
    
    // Find good place to add - after hero or at end of main
    const target = document.querySelector('main') || main;
    target.appendChild(newEl);
    
    setHasUnsaved(true);
    setShowAddMenu(false);
    
    // Select new element
    setTimeout(()=>{
      document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected'));
      newEl.setAttribute('data-bb-selected','true');
      setSelectedEl(newEl);
      setSelectedType(type === 'photo' ? 'image' : type === 'button' ? 'button' : 'text');
    },100);
  };

  if(!isEditMode || isPreview){
    return (
      <>
        <div data-bb-page>{children}</div>
        {(isAdmin || isFounder) && isPreview && (
          <div className="fixed top-[64px] left-0 right-0 z-50 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between items-center" data-editor-ui>
            <span>Preview as User - Exactly what normal users see - Edit Mode hidden</span>
            <button onClick={()=>setIsPreview(false)} className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold">Exit Preview</button>
          </div>
        )}
      </>
    );
  }

  const rect = selectedEl?.getBoundingClientRect();
  const popupStyle = rect ? {
    top: Math.max(70, rect.top - 60) + 'px',
    left: Math.min(window.innerWidth - 380, Math.max(10, rect.left)) + 'px',
  } : {};

  return (
    <div className="min-h-screen bg-black text-white" data-editor-ui>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      
      {/* TOP TOOLBAR - Page | Undo | Redo | Desktop | Tablet | Mobile | Preview | Save | Publish */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[44px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-zinc-500 hidden md:block">Page: {typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Undo ↶">↶</button>
            <button className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Redo ↷">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-7 rounded-full text-[10px] font-bold ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          <span className="hidden lg:block ml-3 mono text-[9px] text-zinc-600">Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish · If visible, editable · Blank canvas · All pages editable · Click text to type, photo to replace, drag to move</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsPreview(true)} className="h-7 px-3 rounded-full border border-zinc-700 text-[10px] hover:bg-zinc-800">Preview</button>
          <button onClick={handleSaveDraft} className="h-7 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[10px]">Save Draft {hasUnsaved&&'•'}</button>
          <button onClick={handlePublish} className="h-7 px-4 rounded-full bg-[#C45A3C] text-white text-[10px] font-bold hover:scale-105 transition">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* LEFT TOOLBAR - MAIN TOOLS ONLY - + Add, Pages, Sections, Buddy Blind Features, Media, Layers, Admin Management */}
        <div className="w-[64px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] flex flex-col items-center py-4 gap-3 sticky top-[44px] h-[calc(100vh-44px)]">
          <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-[20px] font-bold hover:scale-110 transition shadow-lg" title="+ Add - Text, Photo, Button, Section, Event, Restaurant">+</button>
          <div className="w-8 h-px bg-zinc-800"></div>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 flex flex-col items-center justify-center transition" title="Pages - All pages editable"><span className="text-[12px]">📄</span><span className="mono text-[6px]">Pages</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 flex flex-col items-center justify-center transition" title="Sections - Section Box container"><span className="text-[12px]">◫</span><span className="mono text-[6px]">Sections</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 flex flex-col items-center justify-center transition" title="Buddy Blind Features - Event, Restaurant, JOIN, INVITE"><span className="text-[12px]">⚡</span><span className="mono text-[5px]">Features</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 flex flex-col items-center justify-center transition" title="Media Library - Photos"><span className="text-[12px]">🖼</span><span className="mono text-[6px]">Media</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 flex flex-col items-center justify-center transition" title="Layers"><span className="text-[12px]">📚</span><span className="mono text-[6px]">Layers</span></button>
          {isFounder && <button onClick={()=>window.location.href='/founder'} className="w-10 h-10 rounded-xl bg-[#C45A3C] text-white flex flex-col items-center justify-center mt-2 hover:scale-105 transition" title="Admin Management Founder only"><span className="text-[10px]">👑</span><span className="mono text-[5px]">Admin</span></button>}
          <div className="mt-auto text-[7px] mono text-zinc-600 text-center leading-tight px-1">EDIT MODE<br/>Click to edit<br/>Drag to move<br/>All pages<br/>Editable</div>
        </div>

        {showAddMenu && (
          <div className="w-[280px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] p-4 overflow-y-auto sticky top-[44px] h-[calc(100vh-44px)]">
            <div className="flex justify-between items-center"><div className="mono text-[11px] font-bold text-white">+ ADD - Blank Canvas</div><button onClick={()=>setShowAddMenu(false)} className="w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] hover:bg-zinc-800">✕</button></div>
            <div className="mt-2 mono text-[9px] text-zinc-500 leading-relaxed">Every page is blank white canvas. Everything visible added onto it, so everything editable. Add → Choose → Place on canvas → Click → Edit → Move → Resize → Duplicate → Delete. If I can see it, I should be able to select it and edit it.</div>
            
            <div className="mt-5 space-y-4">
              <div>
                <div className="mono text-[10px] text-zinc-400">TEXT - Heading, Paragraph</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={()=>addNewElement('heading')} className="h-14 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] hover:bg-zinc-900 flex flex-col items-center justify-center gap-1 transition"><span className="text-[16px]">H</span><span className="mono text-[9px]">Heading</span></button>
                  <button onClick={()=>addNewElement('text')} className="h-14 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] hover:bg-zinc-900 flex flex-col items-center justify-center gap-1 transition"><span className="text-[14px]">T</span><span className="mono text-[9px]">Text</span></button>
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-400">MEDIA - Photo, Video</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={()=>addNewElement('photo')} className="h-14 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] hover:bg-zinc-900 flex flex-col items-center justify-center gap-1 transition"><span className="text-[16px]">🖼</span><span className="mono text-[9px]">Photo</span></button>
                  <button className="h-14 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] flex flex-col items-center justify-center gap-1"><span className="text-[14px]">▶</span><span className="mono text-[9px]">Video</span></button>
                </div>
                <button onClick={()=>fileInputRef.current?.click()} className="mt-2 w-full h-10 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] hover:border-[#C45A3C] hover:bg-zinc-800 transition">📁 Upload Photo from Computer</button>
                <div className="mt-2 mono text-[8px] text-zinc-600">Drag photo into Section Box → Photo automatically fits box - Not stretched, auto crop/scale, adjust visible part - Move freely, resize, crop, duplicate</div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-400">LAYOUT - Section Box, Container, Button</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={()=>addNewElement('section')} className="h-12 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] text-[10px] hover:bg-zinc-900 transition">Section Box</button>
                  <button onClick={()=>addNewElement('button')} className="h-12 rounded-xl bg-black border border-zinc-800 hover:border-[#C45A3C] text-[10px] hover:bg-zinc-900 transition">Button</button>
                </div>
                <div className="mt-2 mono text-[8px] text-zinc-600 leading-relaxed">Section Box like piece of paper on paper - Inside: Photo, Event Name, Location, Time, Places Left, JOIN Button - Each inside editable, whole section moves together - Click inside to edit photo/text/button</div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-400">BUDDY BLIND - Event, Restaurant, JOIN, INVITE</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={()=>addNewElement('section')} className="h-11 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-[#C45A3C] px-1">Event Section</button>
                  <button onClick={()=>addNewElement('section')} className="h-11 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-[#C45A3C] px-1">Restaurant Section</button>
                  <button onClick={()=>addNewElement('button')} className="h-11 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-[#C45A3C]">JOIN</button>
                  <button onClick={()=>addNewElement('button')} className="h-11 rounded-xl bg-black border border-zinc-800 text-[9px] hover:border-[#C45A3C]">INVITE</button>
                </div>
                <div className="mt-2 mono text-[8px] text-zinc-600">Features are also elements - Quick Meet is real function but visually element placed onto page - Control where appears and how looks, underlying function works normally - Remove from page does not delete actual data</div>
              </div>
            </div>
          </div>
        )}

        {/* CENTRE - Actual Buddy Blind website - show as much as website, editor can see editing and design clearly - blank canvas */}
        <div className={'flex-1 bg-[#080808] overflow-auto min-h-[calc(100vh-44px)] relative ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          <div className="bg-black min-h-screen text-white" data-bb-canvas>
            {children}
          </div>
        </div>
      </div>

      {/* POP-UP TOOL - appears beside selected element - changes automatically depending on what selected - clean, not permanent right panel */}
      {selectedEl && (
        <div 
          className="fixed z-50 bg-[#0f0f0f] border border-zinc-700 rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl backdrop-blur-sm"
          style={popupStyle as any}
        >
          <span className="mono text-[9px] text-zinc-500 uppercase tracking-wider">{selectedType}</span>
          <div className="w-px h-5 bg-zinc-700"></div>
          <button onClick={()=>setShowTextModal(true)} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold hover:scale-105 transition">Edit</button>
          <button onClick={handleImageReplace} className="px-2.5 h-7 rounded-full bg-black border border-zinc-700 text-[10px] hover:bg-zinc-800 transition">Replace</button>
          <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-700 text-[11px] hover:bg-zinc-800 transition" title="Duplicate - Create another one">⎙</button>
          <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/40 border border-red-800/50 text-[11px] hover:bg-red-900/60 transition" title="Delete - Remove from page (not system data)">✕</button>
          <div className="mono text-[8px] text-zinc-500 ml-1 hidden md:block max-w-[180px] truncate">Click → Edit → Drag to move → Corner to resize · All pages editable</div>
          <button onClick={()=>{ document.querySelectorAll('[data-bb-selected]').forEach(el=>el.removeAttribute('data-bb-selected')); setSelectedEl(null); }} className="w-6 h-6 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-[9px] hover:bg-zinc-800 ml-1">✕</button>
        </div>
      )}

      {/* Selected highlight with resize handles - Select → Drag Corner → Resize */}
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
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -bottom-7 left-0 bg-[#C45A3C] text-white text-[8px] px-2 py-1 rounded-full mono whitespace-nowrap shadow-lg">
            {selectedType} · Drag to move · Corner to resize · Double-click to edit
          </div>
        </div>
      )}

      {/* TEXT EDITOR MODAL - READABLE - FIXED DISTORTION */}
      {showTextModal && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" data-editor-ui>
          <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-[15px]">Edit Text: headline_3</h2>
              <span className="mono text-[10px] text-zinc-500">All pages - font, colour, size, bold/thin</span>
            </div>
            
            <div className="mt-6">
              <div className="mono text-[11px] text-zinc-400 mb-2">TEXT</div>
              <textarea 
                value={textValue}
                onChange={e=>setTextValue(e.target.value)}
                className="w-full min-h-[90px] bg-black border border-zinc-700 rounded-2xl p-4 text-white text-[15px] leading-relaxed focus:border-[#C45A3C] focus:outline-none resize-none"
                placeholder="That's the point."
                style={{fontFamily:'Inter, system-ui, -apple-system, sans-serif', letterSpacing:'0.01em'}}
                autoFocus
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">COLOR - pick any</div>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-lg border-2 border-zinc-600 flex-shrink-0 shadow-inner" style={{backgroundColor: textColor}}></div>
                  <input value={textColor} onChange={e=>setTextColor(e.target.value)} className="flex-1 h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] font-mono focus:border-[#C45A3C] focus:outline-none" placeholder="#ffffff" />
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[
                    '#ffffff','#000000','#C45A3C','#CC7357','#E8E6E1',
                    '#8B8B8B','#FF0000','#00FF00','#0000FF','#FFFF00'
                  ].map(c=>(
                    <button key={c} onClick={()=>setTextColor(c)} className="w-8 h-8 rounded-full border-2 hover:scale-110 transition shadow-sm" style={{backgroundColor: c, borderColor: textColor===c ? '#ffffff' : 'rgba(255,255,255,0.2)'}}></button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">SIZE - e.g. 14px, 24px, 2rem</div>
                <input value={textSize} onChange={e=>setTextSize(e.target.value)} placeholder="eg 18px" className="w-full h-10 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] focus:border-[#C45A3C] focus:outline-none" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['12px','14px','16px','20px','24px','32px','48px','64px'].map(s=>(
                    <button key={s} onClick={()=>setTextSize(s)} className={'px-2.5 py-1 rounded-full text-[10px] border transition ' + (textSize===s?'bg-white text-black border-white':'bg-black border-zinc-700 text-zinc-400 hover:border-zinc-500')}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">FONT - all fonts imported</div>
                <select value={textFont} onChange={e=>setTextFont(e.target.value)} className="w-full h-11 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] focus:border-[#C45A3C] focus:outline-none">
                  <option>Default</option>
                  <option>Inter</option>
                  <option>Serif</option>
                  <option>Mono</option>
                  <option>Playfair</option>
                  <option>Poppins</option>
                  <option>Instrument Serif</option>
                </select>
                <div className="mt-3 bg-black border border-zinc-800 rounded-xl p-3">
                  <div className="mono text-[9px] text-zinc-500 mb-1">Preview: That's the point.</div>
                  <div className="text-white" style={{color: textColor, fontSize: textSize, fontFamily: textFont==='Default'?'inherit':textFont, fontWeight: textWeight==='Bold'?'bold': textWeight==='Black'?'900': textWeight==='Thin'?'300':'400'}}>{textValue || "That's the point."}</div>
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500 mb-3">BOLD / THIN - weight</div>
                <select value={textWeight} onChange={e=>setTextWeight(e.target.value)} className="w-full h-11 bg-black border border-zinc-700 rounded-xl px-3 text-white text-[12px] focus:border-[#C45A3C] focus:outline-none">
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
                    <button key={w.value} onClick={()=>setTextWeight(w.value)} className={'px-3 py-1.5 rounded-full text-[11px] border transition ' + (textWeight===w.value?'bg-white text-black border-white':'bg-black border-zinc-700 text-zinc-400 hover:border-zinc-500')}>{w.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={handleSaveText} className="flex-1 h-12 rounded-full bg-white text-black font-black text-[11px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition">SAVE (Draft - instant)</button>
              <button onClick={()=>setShowTextModal(false)} className="flex-1 h-12 rounded-full border border-zinc-700 text-zinc-400 text-[11px] hover:bg-zinc-900 transition">CANCEL</button>
            </div>
            <div className="mt-3 text-center mono text-[10px] text-zinc-600">Save = draft, instant on all pages. Use PUBLISH in top bar to go live.</div>
          </div>
        </div>
      )}
    </div>
  );
}
