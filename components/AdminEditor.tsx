
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

type SelectedType = 'text' | 'image' | 'button' | 'section' | 'event' | 'restaurant' | 'feature' | 'empty';
type SelectedElement = {
  id: string;
  type: SelectedType;
  element: HTMLElement | null;
  rect: DOMRect | null;
  content: string;
};

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isFounder, isLoggedIn } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelected(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // Make all website elements editable - scan and add listeners
  useEffect(()=>{
    if(!isEditMode || isPreview) return;
    
    const makeEditable = () => {
      // All text elements
      const textSelectors = 'h1,h2,h3,h4,h5,h6,p,span,a,button,div';
      const allElements = document.querySelectorAll('[data-bb-page] *');
      // For all pages - make everything clickable for editing
      const allPageElements = document.querySelectorAll('main *, [class*="min-h-screen"] *, body > div > *');
      
      const handleElementClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if(!target) return;
        
        // Ignore clicks on editor UI
        if(target.closest('[data-editor-ui]')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const tag = target.tagName.toLowerCase();
        const isImage = tag === 'img' || target.style.backgroundImage || target.querySelector('img');
        const isButton = tag === 'button' || target.getAttribute('role') === 'button' || target.className.includes('rounded-full') && (target.textContent?.includes('JOIN') || target.textContent?.includes('INVITE') || target.textContent?.includes('SHARE'));
        const isSection = target.className.includes('rounded-2xl') || target.className.includes('rounded-3xl') || target.className.includes('section') || target.getAttribute('data-section');
        
        let type: SelectedType = 'text';
        if(isImage) type = 'image';
        else if(isButton) type = 'button';
        else if(isSection && target.children.length > 1) type = 'section';
        else if(target.textContent?.includes('Kissa') || target.textContent?.includes('Yardbird')) type = 'restaurant';
        else if(target.textContent?.includes('Blind Box') || target.textContent?.includes('BLIND')) type = 'event';
        
        const rect = target.getBoundingClientRect();
        const id = target.id || 'el-' + Date.now();
        if(!target.id) target.id = id;
        
        setSelected({
          id,
          type,
          element: target,
          rect,
          content: target.textContent || ''
        });
      };

      // Add click listeners to all editable elements on page
      const editableArea = document.body;
      const addListeners = (root: Element) => {
        const elements = root.querySelectorAll('h1,h2,h3,p,span,img,button,a,div');
        elements.forEach(el=>{
          if((el as HTMLElement).closest('[data-editor-ui]')) return;
          (el as HTMLElement).style.cursor = 'pointer';
          el.addEventListener('click', handleElementClick as any);
        });
      };

      // Observe for new elements
      const observer = new MutationObserver(()=>{
        // Re-add listeners when DOM changes
      });
      observer.observe(document.body, {childList:true, subtree:true});

      document.addEventListener('click', handleElementClick as any);

      return ()=>{
        document.removeEventListener('click', handleElementClick as any);
        observer.disconnect();
      };
    };

    const cleanup = makeEditable();
    return cleanup;
  },[isEditMode, isPreview]);

  // Click empty area → toolbar disappears
  useEffect(()=>{
    if(!isEditMode) return;
    const handleEmptyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if(target.closest('[data-editor-ui]')) return;
      if(target === document.body || target.tagName === 'MAIN' || target.classList.contains('min-h-screen')){
        setSelected(null);
      }
    };
    document.addEventListener('click', handleEmptyClick);
    return ()=>document.removeEventListener('click', handleEmptyClick);
  },[isEditMode]);

  const handleTextEdit = (newContent: string) => {
    if(selected?.element){
      selected.element.textContent = newContent;
      setHasUnsaved(true);
    }
  };

  const handleImageReplace = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file || !selected?.element) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if(selected.type === 'image'){
        const img = selected.element as HTMLImageElement;
        if(img.tagName === 'IMG'){
          img.src = src;
        } else {
          const imgInside = img.querySelector('img') as HTMLImageElement;
          if(imgInside) imgInside.src = src;
          else img.style.backgroundImage = `url(${src})`;
        }
        setHasUnsaved(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDuplicate = () => {
    if(!selected?.element) return;
    const clone = selected.element.cloneNode(true) as HTMLElement;
    clone.id = 'el-' + Date.now();
    selected.element.parentNode?.insertBefore(clone, selected.element.nextSibling);
    setHasUnsaved(true);
    setSelected(null);
  };

  const handleDelete = () => {
    if(!selected?.element) return;
    if(!confirm('Delete this element from this page/layout? It will not delete actual feature or data from system, only remove from this page.')) return;
    selected.element.remove();
    setHasUnsaved(true);
    setSelected(null);
  };

  const handleSaveDraft = () => {
    const html = document.documentElement.outerHTML;
    localStorage.setItem('bb_draft_html', html);
    setHasUnsaved(false);
    alert('Draft saved - Not published yet - Preview shows what users will see');
  };

  const handlePublish = () => {
    if(!confirm('Publish? Makes changes live for all normal users.')) return;
    const html = document.documentElement.outerHTML;
    localStorage.setItem('bb_published_html', html);
    setHasUnsaved(false);
    alert('Published! Live for normal users.');
  };

  const undo = () => {
    if(historyIndex>0){
      setHistoryIndex(historyIndex-1);
    }
  };
  const redo = () => {
    if(historyIndex<history.length-1){
      setHistoryIndex(historyIndex+1);
    }
  };

  if(!isEditMode || isPreview){
    return (
      <>
        <div ref={containerRef} data-bb-page>
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

  // Calculate popup position
  const popupStyle = selected?.rect ? {
    top: Math.max(10, selected.rect.top - 60) + 'px',
    left: Math.min(window.innerWidth - 400, Math.max(10, selected.rect.left)) + 'px',
  } : {};

  return (
    <div className="min-h-screen bg-black text-white" data-editor-ui>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      
      {/* TOP TOOLBAR - Page | Undo | Redo | Desktop | Tablet | Mobile | Preview | Save | Publish - clean */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[44px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="mono text-[10px] tracking-widest text-zinc-500 hidden md:block">Page</div>
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button onClick={undo} className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Undo ↶">↶</button>
            <button onClick={redo} className="w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center text-[12px]" title="Redo ↷">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-7 rounded-full text-[10px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          <span className="hidden lg:block ml-3 mono text-[10px] text-zinc-600">Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish · If visible, you can edit it</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsPreview(true)} className="h-7 px-3 rounded-full border border-zinc-700 text-[10px] hover:bg-zinc-800">Preview</button>
          <button onClick={handleSaveDraft} className="h-7 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[10px]">Save Draft {hasUnsaved&&'•'}</button>
          <button onClick={handlePublish} className="h-7 px-4 rounded-full bg-[#C45A3C] text-white text-[10px] font-bold">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* LEFT TOOLBAR - MAIN TOOLS ONLY - simple, not filled with detailed settings */}
        <div className="w-[64px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] flex flex-col items-center py-4 gap-3 sticky top-[44px] h-[calc(100vh-44px)]">
          <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-[18px] font-bold hover:scale-105 transition" title="+ Add - Basic, Layout, Buddy Blind">+</button>
          <div className="w-8 h-px bg-zinc-800"></div>
          <button onClick={()=>setShowPages(!showPages)} className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Pages"><span className="text-[14px]">📄</span><span className="mono text-[7px]">Pages</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Sections"><span className="text-[14px]">◫</span><span className="mono text-[7px]">Sections</span></button>
          <button className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Buddy Blind Features"><span className="text-[14px]">⚡</span><span className="mono text-[6px]">Features</span></button>
          <button onClick={()=>setShowMedia(!showMedia)} className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Media"><span className="text-[14px]">🖼</span><span className="mono text-[7px]">Media</span></button>
          <button onClick={()=>setShowLayers(!showLayers)} className="w-10 h-10 rounded-xl bg-black border border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-0.5" title="Layers"><span className="text-[14px]">📚</span><span className="mono text-[7px]">Layers</span></button>
          {isFounder && <button onClick={()=>window.location.href='/founder'} className="w-10 h-10 rounded-xl bg-[#C45A3C] text-white flex flex-col items-center justify-center gap-0.5 mt-2" title="Admin Management Founder only"><span className="text-[12px]">👑</span><span className="mono text-[6px]">Admin</span></button>}
          <div className="mt-auto text-[7px] mono text-zinc-600 text-center leading-tight">EDIT MODE<br/>Wix-like<br/>Visual<br/>Builder<br/>Simple<br/>Clean</div>
        </div>

        {/* + Add Menu - visual simple */}
        {showAddMenu && (
          <div className="w-[280px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-44px)] p-4 overflow-y-auto sticky top-[44px] h-[calc(100vh-44px)]">
            <div className="flex justify-between items-center"><div className="mono text-[11px] font-bold text-white">+ ADD</div><button onClick={()=>setShowAddMenu(false)} className="w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center text-[10px]">✕</button></div>
            <div className="mt-4 space-y-5">
              <div>
                <div className="mono text-[10px] text-zinc-500">Basic</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    {label:'Text', icon:'T', desc:'Click text to edit directly'},
                    {label:'Heading', icon:'H', desc:'Large text'},
                    {label:'Photo', icon:'🖼', desc:'Upload from computer'},
                    {label:'Video', icon:'▶', desc:'Video'},
                    {label:'Button', icon:'🔘', desc:'JOIN/INVITE/SHARE'},
                    {label:'Icon', icon:'★', desc:'Icon'},
                    {label:'Divider', icon:'—', desc:'Line'},
                    {label:'Spacer', icon:'↕', desc:'Space'},
                  ].map(item=>(
                    <button key={item.label} onClick={()=>{
                      const newEl = document.createElement('div');
                      newEl.textContent = item.label + ' - New - Click it → Edit it';
                      newEl.style.padding = '12px';
                      newEl.style.background = '#18181b';
                      newEl.style.borderRadius = '12px';
                      newEl.style.margin = '10px';
                      document.body.appendChild(newEl);
                      setHasUnsaved(true);
                    }} className="h-14 rounded-xl bg-black border border-zinc-800 hover:border-orange-500 flex flex-col items-center justify-center gap-1 hover:scale-[1.02] transition">
                      <span className="text-[16px]">{item.icon}</span><span className="mono text-[9px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500">Layout</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Section Box','Container','Banner','Columns'].map(l=>(
                    <button key={l} className="h-12 rounded-xl bg-black border border-zinc-800 hover:border-orange-500 text-[10px]">{l}</button>
                  ))}
                </div>
                <div className="mt-2 mono text-[9px] text-zinc-600">Section Box container - Place photo, heading, description, button inside - If section moved, elements inside move together - Drag photo into box → Auto fits</div>
              </div>
              <div>
                <div className="mono text-[10px] text-zinc-500">Buddy Blind</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Event Section','Restaurant Section','Private Event Section','Quick Meet','Upcoming Events','Filters','INVITE','JOIN','SHARE','Profile','Comments & Rating'].map(b=>(
                    <button key={b} className="h-12 rounded-xl bg-black border border-zinc-800 hover:border-orange-500 text-[9px] px-1">{b}</button>
                  ))}
                </div>
                <div className="mt-2 mono text-[9px] text-zinc-600">Event Section: Event Photo, Name, Restaurant/Venue, Date, Time, Places Left, Type, JOIN - Choose info displayed, change layout/design, data still from system - Restaurant Section similar - Features add/delete/move, delete only from page not system</div>
              </div>
            </div>
          </div>
        )}

        {/* Pages Panel */}
        {showPages && (
          <div className="w-[240px] bg-[#0f0f0f] border-r border-zinc-800 p-4">
            <div className="mono text-[11px] text-white">Pages</div>
            <div className="mt-3 space-y-2">
              {['Home','Venues','Private Events','How It Works','Premium','Profile','Founder'].map(p=>(
                <div key={p} className="flex justify-between bg-black border border-zinc-800 rounded-xl px-3 py-2 text-[11px]"><span>{p}</span><span className="text-zinc-500">👁</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Centre - Actual Buddy Blind website - show as much as website, editor can see editing and design clearly */}
        <div className={'flex-1 bg-[#080808] overflow-auto min-h-[calc(100vh-44px)] ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          <div className="relative min-h-full">
            {/* Smart alignment lines - appear automatically while moving */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500/20 hidden" data-alignment="center-v"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/20 hidden" data-alignment="center-h"></div>
            </div>
            
            <div className="bg-black min-h-screen">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* POP-UP TOOL - appears beside currently selected element and changes automatically depending on what was selected - not permanent large right panel */}
      {selected && selected.rect && (
        <div 
          className="fixed z-50 bg-[#0f0f0f] border border-zinc-700 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
          style={popupStyle as any}
        >
          {selected.type==='text' && (
            <>
              <select className="h-7 bg-black border border-zinc-700 rounded-full px-2 text-[10px]"><option>Inter</option><option>Serif</option><option>Mono</option></select>
              <input type="number" defaultValue={14} className="w-12 h-7 bg-black border border-zinc-700 rounded-full px-2 text-[10px]" />
              <input type="color" defaultValue="#ffffff" className="w-7 h-7 rounded-full" onChange={e=>{ if(selected.element) selected.element.style.color = e.target.value; }} />
              <div className="w-px h-5 bg-zinc-700 mx-1"></div>
              <button className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px] font-bold hover:bg-zinc-800" onClick={()=>{ if(selected.element) selected.element.style.fontWeight = selected.element.style.fontWeight==='bold'?'':'bold'; }}>B</button>
              <button className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px] italic hover:bg-zinc-800" onClick={()=>{ if(selected.element) selected.element.style.fontStyle = selected.element.style.fontStyle==='italic'?'':'italic'; }}>I</button>
              <button className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px] underline hover:bg-zinc-800">U</button>
              <div className="w-px h-5 bg-zinc-700 mx-1"></div>
              <button className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">≡</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[9px]">••• More</button>
              <div className="w-px h-5 bg-zinc-700 mx-1"></div>
              <button onClick={()=>setEditingText(true)} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold">Edit Text</button>
            </>
          )}
          {selected.type==='image' && (
            <>
              <button onClick={handleImageReplace} className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold">Replace</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Crop</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Fit</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Fill</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Edit</button>
              <div className="w-px h-5 bg-zinc-700 mx-1"></div>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 border border-red-800 text-[10px]">✕</button>
              <div className="mono text-[8px] text-zinc-500 ml-1">Drag to move · Corner to resize · Drag into Section Box → Auto fits · Not stretched</div>
            </>
          )}
          {selected.type==='button' && (
            <>
              <button className="px-3 h-7 rounded-full bg-white text-black text-[10px] font-bold">Edit Text</button>
              <select className="h-7 bg-black border border-zinc-700 rounded-full px-2 text-[10px]">
                <option>JOIN Event</option><option>INVITE</option><option>SHARE</option><option>Go Back</option><option>Open Restaurant</option><option>Open Profile</option>
              </select>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Design</button>
              <div className="w-px h-5 bg-zinc-700"></div>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 text-[10px]">✕</button>
            </>
          )}
          {(selected.type==='section' || selected.type==='event' || selected.type==='restaurant') && (
            <>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Background</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Layout</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Display Info</button>
              <button className="px-2 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">Design</button>
              <div className="w-px h-5 bg-zinc-700"></div>
              <button onClick={handleDuplicate} className="w-7 h-7 rounded-full bg-black border border-zinc-800 text-[10px]">⎙</button>
              <button onClick={handleDelete} className="w-7 h-7 rounded-full bg-red-900/50 text-[10px]">✕</button>
              <div className="mono text-[8px] text-zinc-500 ml-1">{selected.type==='section'?'If section moved, elements inside move together · Click inside to edit photo/text/button': selected.type==='event'?'☑ Name ☑ Photo ☑ Venue ☑ Date ☑ Time ☑ Places Left ☑ Type ☑ JOIN - Display without changing data': '☑ Photo ☑ Name ☑ Location ☑ Cuisine ☑ INVITE ☑ JOIN'}</div>
            </>
          )}
          <button onClick={()=>setSelected(null)} className="w-7 h-7 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-[10px] ml-1">✕</button>
        </div>
      )}

      {/* Selected element highlight - resize handles */}
      {selected && selected.rect && (
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
        </div>
      )}

      {/* Text inline editing */}
      {editingText && selected && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f0f] border border-zinc-800 rounded-2xl p-5">
            <div className="mono text-[11px] text-white">Edit Text - Click text and type</div>
            <textarea 
              defaultValue={selected.content}
              onChange={e=>{ if(selected.element) selected.element.textContent = e.target.value; }}
              className="mt-3 w-full min-h-[100px] bg-black border border-zinc-700 rounded-xl p-3 text-sm focus:border-orange-500 outline-none"
              autoFocus
            />
            <div className="mt-3 flex gap-2"><button onClick={()=>setEditingText(false)} className="flex-1 h-10 rounded-full bg-white text-black text-[11px] font-bold">Done</button><button onClick={()=>setEditingText(false)} className="flex-1 h-10 rounded-full border border-zinc-700 text-[11px]">Cancel</button></div>
            <div className="mt-3 mono text-[9px] text-zinc-600">Double-click Text → Start typing - Font | Size | Colour | B | I | U | Alignment | ••• More for letter spacing, line spacing, transparency, background, border, exact position</div>
          </div>
        </div>
      )}

      {/* Layers panel */}
      {showLayers && (
        <div className="fixed left-[64px] top-[44px] w-[240px] h-[calc(100vh-44px)] bg-[#0f0f0f] border-r border-zinc-800 p-4 z-40">
          <div className="mono text-[11px] text-white">Layers</div>
          <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
            <div>Background</div>
            <div>Section Box</div>
            <div>→ Photo (Kissa Tanaka)</div>
            <div>→ Heading (You don't know)</div>
            <div>→ Button JOIN</div>
            <div>Event Section</div>
            <div>Restaurant Section</div>
          </div>
        </div>
      )}

      {/* Media panel */}
      {showMedia && (
        <div className="fixed left-[64px] top-[44px] w-[280px] h-[calc(100vh-44px)] bg-[#0f0f0f] border-r border-zinc-800 p-4 z-40">
          <div className="mono text-[11px] text-white">Media Library</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map(i=><div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-[10px] text-zinc-600">IMG {i}</div>)}
          </div>
          <div className="mt-4 mono text-[9px] text-zinc-600">Upload from computer, add from Media Library, delete, replace, move freely, resize, crop, duplicate, move into different sections, auto fit Section Box</div>
        </div>
      )}
    </div>
  );
}
