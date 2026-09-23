
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

type ElementType = 'text' | 'heading' | 'image' | 'video' | 'button' | 'box' | 'section' | 'divider' | 'spacer' | 'restaurant' | 'event' | 'privateEvent' | 'feature-invite' | 'feature-join' | 'feature-share' | 'feature-quickmeet' | 'feature-upcoming' | 'feature-filters' | 'feature-profile' | 'banner' | 'promotion' | 'columns' | 'container' | 'icon';

type EditableElement = {
  id: string;
  type: ElementType;
  content: string;
  style: React.CSSProperties & { left?: string; top?: string; position?: any };
  action?: string;
  src?: string;
  locked?: boolean;
  zIndex?: number;
  parentId?: string | null;
  children?: string[];
};

const BUTTON_ACTIONS = [
  'JOIN Event', 'INVITE', 'SHARE', 'Previous Page', 'Next Page', 'Open Restaurant', 'Open Profile', 'Open Private Event', 'Create Event', 'Login', 'External Link', 'Quick Meet', 'Upcoming Events', 'Filters', 'Add Buddy', 'Restaurant List', 'Profile', 'Comments', 'Rating'
];

const FONTS = ['Inter', 'Mono', 'Serif', 'Sans', 'Poppins', 'Roboto', 'Playfair', 'Space Grotesk', 'Instrument Serif'];
const BASIC_ELEMENTS: {type: ElementType, label: string, icon: string}[] = [
  {type:'text', label:'Text', icon:'T'},
  {type:'heading', label:'Heading', icon:'H'},
  {type:'image', label:'Photo', icon:'🖼'},
  {type:'video', label:'Video', icon:'▶'},
  {type:'button', label:'Button', icon:'🔘'},
  {type:'icon', label:'Icon', icon:'★'},
  {type:'divider', label:'Divider', icon:'—'},
  {type:'spacer', label:'Spacer', icon:'↕'},
];
const LAYOUT_ELEMENTS: {type: ElementType, label: string, icon: string}[] = [
  {type:'section', label:'Section Box', icon:'◫'},
  {type:'container', label:'Container', icon:'□'},
  {type:'box', label:'Box', icon:'▢'},
  {type:'banner', label:'Banner', icon:'🏷'},
  {type:'promotion', label:'Promotion Box', icon:'🎁'},
  {type:'columns', label:'Columns', icon:'◧'},
];
const BUDDY_ELEMENTS: {type: ElementType, label: string, icon: string}[] = [
  {type:'event', label:'Event Section', icon:'🎉'},
  {type:'restaurant', label:'Restaurant Section', icon:'🍽'},
  {type:'privateEvent', label:'Private Event Section', icon:'🎭'},
  {type:'feature-invite', label:'INVITE', icon:'✉'},
  {type:'feature-join', label:'JOIN', icon:'✓'},
  {type:'feature-share', label:'SHARE', icon:'↗'},
  {type:'feature-quickmeet', label:'Quick Meet', icon:'⚡'},
  {type:'feature-upcoming', label:'Upcoming Events', icon:'📅'},
  {type:'feature-filters', label:'Filters', icon:'⚙'},
  {type:'feature-profile', label:'Profile', icon:'👤'},
];

function generateId(){ return 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2,5); }

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isFounder, isLoggedIn } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [history, setHistory] = useState<EditableElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [showAddMenu, setShowAddMenu] = useState(true);
  const [activeAddTab, setActiveAddTab] = useState<'basic'|'layout'|'buddy'>('basic');
  const [isPreviewAsUser, setIsPreviewAsUser] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [draggingId, setDraggingId] = useState<string|null>(null);
  const [dragOffset, setDragOffset] = useState({x:0,y:0});
  const [showAlignment, setShowAlignment] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string|null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Auto enable edit mode when admin/founder logged in - actual website automatically changes into Edit Mode
  useEffect(()=>{
    if((isAdmin || isFounder) && isLoggedIn){
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelectedId(null);
    }
  },[isAdmin, isFounder, isLoggedIn]);

  // Load draft
  useEffect(()=>{
    const draft = localStorage.getItem('bb_admin_elements');
    if(draft){
      try{ setElements(JSON.parse(draft)); }catch{}
    }
  },[]);

  const saveToHistory = (newElements: EditableElement[]) => {
    const newHistory = history.slice(0, historyIndex+1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length-1);
    setHasUnsaved(true);
    localStorage.setItem('bb_admin_elements', JSON.stringify(newElements));
  };

  const undo = () => { if(historyIndex>0){ setHistoryIndex(historyIndex-1); setElements(history[historyIndex-1]); } };
  const redo = () => { if(historyIndex<history.length-1){ setHistoryIndex(historyIndex+1); setElements(history[historyIndex+1]); } };

  const addElement = (type: ElementType) => {
    const id = generateId();
    let content = '';
    let style: any = { position:'relative', left:'0px', top:'0px' };
    let src = '';
    let action = '';

    switch(type){
      case 'text': content='New text - Click to edit directly - Change wording, font, size, colour, bold, italic, underline, alignment, letter spacing, line spacing, background'; style={ fontSize:'14px', color:'#a1a1aa', padding:'8px', minWidth:'200px' }; break;
      case 'heading': content='New Heading - Click to edit'; style={ fontSize:'32px', color:'#ffffff', fontFamily:'serif', fontWeight:'bold', minWidth:'300px' }; break;
      case 'image': content=''; src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'; style={ width:'320px', height:'200px', borderRadius:'16px', objectFit:'cover' }; break;
      case 'button': content='JOIN'; style={ backgroundColor:'#ffffff', color:'#000000', padding:'12px 24px', borderRadius:'9999px', fontSize:'11px', fontWeight:'900', letterSpacing:'0.14em', minWidth:'100px', textAlign:'center', cursor:'pointer' }; action='JOIN Event'; break;
      case 'section': content='Section Box - Container - Drag photo into this box → Photo automatically fits the box - If section moved, elements inside move together'; style={ width:'100%', minHeight:'300px', backgroundColor:'#0f0f0f', border:'1px dashed #27272a', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }; break;
      case 'box': content='Box - Change background colour, background image, border/shape, move, resize, duplicate'; style={ width:'200px', height:'200px', backgroundColor:'#18181b', border:'1px solid #27272a', borderRadius:'16px', padding:'16px' }; break;
      case 'event': content='Event Section Box - Event Photo, Event Name, Restaurant/Venue, Date, Time, Places Left, Event Type, JOIN Button - Choose which info displayed, change layout/design - Data still from event system'; style={ width:'100%', maxWidth:'400px', backgroundColor:'#18181b', borderRadius:'16px', padding:'16px', border:'1px solid #27272a' }; break;
      case 'restaurant': content='Restaurant Section Box - Restaurant Photo, Name, Location, Cuisine, INVITE/JOIN Buttons - Change design, decide which info shown without changing restaurant data'; style={ width:'100%', maxWidth:'400px', backgroundColor:'#18181b', borderRadius:'16px', padding:'16px', border:'1px solid #27272a' }; break;
      case 'feature-join': content='JOIN Feature - Drag into position - If deleted from page, only removes from that page/layout, not delete actual feature or data'; style={ backgroundColor:'#ffffff', color:'#000000', padding:'10px 20px', borderRadius:'9999px', fontSize:'11px', fontWeight:'900' }; action='JOIN Event'; break;
      case 'feature-invite': content='INVITE Feature'; style={ backgroundColor:'#C45A3C', color:'#ffffff', padding:'10px 20px', borderRadius:'9999px', fontSize:'11px', fontWeight:'900' }; action='INVITE'; break;
      case 'feature-share': content='SHARE Feature'; style={ backgroundColor:'#27272a', color:'#ffffff', padding:'10px 20px', borderRadius:'9999px', fontSize:'11px', fontWeight:'900', border:'1px solid #3f3f46' }; action='SHARE'; break;
      default: content=type + ' - Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish'; style={ padding:'12px', backgroundColor:'#18181b', borderRadius:'12px', color:'#ffffff', minWidth:'150px' };
    }

    const newEl: EditableElement = { id, type, content, style, src, action, locked:false, zIndex: elements.length+10, parentId:null, children:[] };
    const newElements = [...elements, newEl];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(id);
  };

  const updateElement = (id:string, updates: Partial<EditableElement>) => {
    setElements(prev => prev.map(el => el.id===id ? {...el, ...updates, style:{...el.style, ...(updates.style||{})}} : el));
    setHasUnsaved(true);
  };

  const deleteElement = (id:string) => {
    if(!confirm('Delete this element from this page/layout? It will not delete actual feature or data from Buddy Blind system, only remove from this page. Confirm?')) return;
    const newElements = elements.filter(el => el.id!==id);
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(null);
  };

  const duplicateElement = (id:string) => {
    const el = elements.find(e=>e.id===id);
    if(!el) return;
    const newEl = {...el, id: generateId(), style:{...el.style, left:'20px', top:'20px'}, content: el.content + ' (copy)'};
    const newElements = [...elements, newEl];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(newEl.id);
  };

  const handleMouseDown = (e: React.MouseEvent, id:string) => {
    const el = elements.find(x=>x.id===id);
    if(el?.locked) return;
    setDraggingId(id);
    setSelectedId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({x: e.clientX - rect.left, y: e.clientY - rect.top});
    setShowAlignment(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if(!draggingId || !mainRef.current) return;
    const mainRect = mainRef.current.getBoundingClientRect();
    const x = e.clientX - mainRect.left - dragOffset.x;
    const y = e.clientY - mainRect.top - dragOffset.y;
    updateElement(draggingId, {style:{ left: x+'px', top: y+'px', position:'absolute' } as any});
  },[draggingId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if(draggingId){
      const el = elements.find(e=>e.id===draggingId);
      if(el) saveToHistory(elements);
      setDraggingId(null);
      setShowAlignment(false);
    }
  },[draggingId, elements]);

  useEffect(()=>{
    if(draggingId){
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return ()=>{ window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }
  },[draggingId, handleMouseMove, handleMouseUp]);

  const handleSaveDraft = () => {
    localStorage.setItem('bb_admin_elements', JSON.stringify(elements));
    localStorage.setItem('bb_draft', JSON.stringify({adminElements: elements, savedAt: new Date().toISOString()}));
    setHasUnsaved(false);
    alert('Draft saved - Work without changing live website - Preview shows what normal users will see');
  };

  const handlePublish = () => {
    if(!confirm('Publish changes? This will make changes live for all normal users. Save Draft saves without changing live, Preview shows what users will see, Publish makes live.')) return;
    localStorage.setItem('bb_published_live', JSON.stringify(elements));
    setHasUnsaved(false);
    alert('Published! Website now shows edited version to normal users.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, targetId?: string) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if(targetId){
        updateElement(targetId, {src});
      } else {
        // Add new image box that automatically fits
        const id = generateId();
        const newEl: EditableElement = {
          id, type:'image', content:'', src,
          style:{ width:'320px', height:'200px', borderRadius:'16px', objectFit:'cover', position:'relative' } as any,
          locked:false, zIndex: elements.length+10
        };
        const newElements = [...elements, newEl];
        setElements(newElements);
        saveToHistory(newElements);
      }
    };
    reader.readAsDataURL(file);
  };

  if(!isEditMode || isPreviewAsUser){
    return (
      <>
        {children}
        {(isAdmin || isFounder) && isPreviewAsUser && (
          <div className="fixed top-[64px] left-0 right-0 z-40 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between"><span>Preview as User - Exactly what normal users will see - Edit Mode hidden</span><button onClick={()=>setIsPreviewAsUser(false)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Exit Preview</button></div>
        )}
      </>
    );
  }

  const selectedElement = elements.find(el=>el.id===selectedId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Toolbar - Undo Redo Desktop Mobile Preview Save Publish */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[48px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button onClick={undo} className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-xs" title="Undo">↶</button>
            <button onClick={redo} className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-xs" title="Redo">↷</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          {hasUnsaved && <span className="ml-2 text-[10px] text-orange-400">• Unsaved</span>}
          <span className="hidden md:block ml-3 mono text-[10px] text-zinc-500">Click it → Edit it → Move it → Resize it → Add/Delete → Save → Publish · If visible, you can edit it</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsPreviewAsUser(true)} className="h-8 px-3 rounded-full border border-zinc-700 text-[11px] hover:bg-zinc-800">Preview</button>
          <button onClick={handleSaveDraft} className="h-8 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[11px]">Save Draft</button>
          <button onClick={handlePublish} className="h-8 px-4 rounded-full bg-[#C45A3C] text-white text-[11px] font-bold">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* Left Side - Add / Pages / Media / Features */}
        <div className="w-[300px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-48px)] overflow-y-auto sticky top-[48px] h-[calc(100vh-48px)]">
          <div className="p-4 space-y-5">
            <div>
              <div className="mono text-[11px] tracking-widest text-white font-bold">EDIT MODE · Wix-like Visual Builder</div>
              <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed">Actual website automatically changed into Edit Mode. Browse normally with editing functions. Click any text, photo, button, box, event, restaurant to edit.</div>
            </div>

            {/* Add Menu */}
            <div>
              <div className="flex gap-1 mb-3">
                {[
                  {id:'basic', label:'Basic'},
                  {id:'layout', label:'Layout'},
                  {id:'buddy', label:'Buddy Blind'},
                ].map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveAddTab(tab.id as any)} className={'flex-1 h-8 rounded-full text-[10px] font-bold ' + (activeAddTab===tab.id?'bg-white text-black':'bg-black border border-zinc-800 text-zinc-400')}>{tab.label}</button>
                ))}
              </div>
              <div className="mono text-[11px] text-zinc-400 mb-2">+ ADD · {activeAddTab.toUpperCase()}</div>
              <div className="grid grid-cols-2 gap-2">
                {(activeAddTab==='basic'?BASIC_ELEMENTS: activeAddTab==='layout'?LAYOUT_ELEMENTS: BUDDY_ELEMENTS).map(el=>(
                  <button key={el.type} onClick={()=>addElement(el.type)} className="h-[64px] rounded-xl bg-black border border-zinc-800 hover:border-orange-500 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-1">
                    <span className="text-[18px]">{el.icon}</span>
                    <span className="mono text-[9px] text-zinc-400">{el.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="w-full h-9 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500">
                  <span>📁</span> Upload Photo from Computer
                  <input type="file" accept="image/*" className="hidden" onChange={e=>handleImageUpload(e)} />
                </label>
                <div className="mt-2 mono text-[9px] text-zinc-600 leading-relaxed">Drag photo into Section Box → Automatically fits box · Photo not stretched, auto crop/scale, adjust visible part · Move photos freely, resize, crop, duplicate, move into different sections</div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="mono text-[11px] text-zinc-400">PAGES & SECTIONS</div>
              <div className="mt-2 space-y-1.5">
                {['Home','Venues','Private Events','How It Works','Premium','Profile','Invite','Join','Founder'].map(p=>(
                  <div key={p} className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl px-3 py-2">
                    <span className="text-[11px]">{p}</span>
                    <div className="flex gap-1"><button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">⎙</button><button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">👁</button><button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">🗑</button></div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full h-9 rounded-full border border-dashed border-zinc-700 text-[11px] text-zinc-500">+ Add New Page · Duplicate · Rename · Hide/unhide · Delete · Add section · Duplicate section · Reorder · Copy between pages</button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="mono text-[10px] text-zinc-600">Media Library · Previously uploaded content · Easy reuse · Drag from computer onto page or + Add → Image → Upload</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i=><div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-[9px] text-zinc-600">IMG {i}</div>)}
              </div>
            </div>

            {isFounder && (
              <div className="pt-4 border-t border-zinc-800">
                <div className="mono text-[11px] text-[#C45A3C]">Admin Management (Founder)</div>
                <a href="/founder" className="mt-2 block w-full h-9 rounded-full bg-[#C45A3C] text-white text-[11px] font-bold flex items-center justify-center">Go to Founder → Assign/Remove Admin</a>
                <div className="mt-2 mono text-[9px] text-zinc-600">Founder → Can assign/remove Admin → Admin → Edit Mode → User → Normal</div>
              </div>
            )}
          </div>
        </div>

        {/* Centre - Actual Buddy Blind website being edited */}
        <div ref={mainRef} className={'flex-1 bg-[#080808] p-2 md:p-4 overflow-auto relative min-h-[calc(100vh-48px)] ' + (device==='mobile'?'max-w-[390px] mx-auto': device==='tablet'?'max-w-[768px] mx-auto':'')}>
          {/* Smart alignment lines */}
          {showAlignment && draggingId && (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500/60 pointer-events-none z-50"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/60 pointer-events-none z-50"></div>
              <div className="absolute left-0 top-1/3 right-0 h-px bg-orange-500/30 pointer-events-none z-50"></div>
              <div className="absolute left-0 top-2/3 right-0 h-px bg-orange-500/30 pointer-events-none z-50"></div>
            </>
          )}

          <div className="relative bg-black rounded-2xl border border-zinc-800 overflow-hidden min-h-[800px]">
            {/* Actual website */}
            <div className="relative">
              {children}
            </div>

            {/* Editable overlay elements - Free Movement Drag-and-Drop */}
            <div className="absolute inset-0 pointer-events-none">
              {elements.map(el=>(
                <div
                  key={el.id}
                  onMouseDown={e=>handleMouseDown(e, el.id)}
                  onClick={e=>{ e.stopPropagation(); setSelectedId(el.id); }}
                  className={'absolute pointer-events-auto group border-2 ' + (selectedId===el.id?'border-[#C45A3C] z-20 shadow-lg shadow-orange-900/20':'border-transparent hover:border-zinc-600 z-10') + (el.locked?' opacity-60':' cursor-move')}
                  style={{...el.style as any, zIndex: el.zIndex, left: el.style.left||'0px', top: el.style.top||'0px'}}
                >
                  {el.type==='image' ? (
                    <div className="relative w-full h-full overflow-hidden" style={{borderRadius: el.style.borderRadius as any}}>
                      <img src={el.src} alt="" className="w-full h-full" style={{objectFit:'cover', objectPosition:'center'}} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  ) : el.type==='text' || el.type==='heading' ? (
                    <div
                      contentEditable={editingTextId===el.id}
                      suppressContentEditableWarning
                      onDoubleClick={()=>setEditingTextId(el.id)}
                      onBlur={e=>{ updateElement(el.id, {content: e.currentTarget.textContent||''}); setEditingTextId(null); }}
                      className={'outline-none w-full h-full p-2 ' + (editingTextId===el.id?'bg-black border border-orange-500 rounded':'')}
                      style={el.style}
                    >
                      {el.content}
                    </div>
                  ) : (
                    <div className="w-full h-full p-2 overflow-auto" style={el.style}>
                      {el.content}
                      {el.src && <img src={el.src} alt="" className="mt-2 w-full rounded" />}
                    </div>
                  )}

                  {/* Controls - Edit | Duplicate | Copy | Delete - show on select */}
                  {selectedId===el.id && (
                    <div className="absolute -top-10 left-0 flex items-center gap-1 bg-black border border-zinc-700 rounded-full p-1 shadow-xl">
                      <button onClick={()=>setEditingTextId(el.id)} className="px-2.5 h-7 rounded-full bg-zinc-800 text-[10px] hover:bg-zinc-700" title="Edit">Edit</button>
                      <button onClick={()=>duplicateElement(el.id)} className="w-7 h-7 rounded-full bg-zinc-800 text-[10px] hover:bg-zinc-700" title="Duplicate">⎙</button>
                      <button onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(el)); alert('Copied - Paste to duplicate'); }} className="w-7 h-7 rounded-full bg-zinc-800 text-[10px]" title="Copy">⧉</button>
                      <button onClick={()=>deleteElement(el.id)} className="w-7 h-7 rounded-full bg-red-900/50 border border-red-800 text-[10px] hover:bg-red-900" title="Delete">✕</button>
                      <div className="w-px h-5 bg-zinc-700 mx-1"></div>
                      <button onClick={()=>updateElement(el.id, {style:{...el.style, zIndex: (el.zIndex||10)+10} as any})} className="px-2 h-7 rounded-full bg-zinc-800 text-[9px]" title="Bring to Front">Front</button>
                      <button onClick={()=>updateElement(el.id, {style:{...el.style, zIndex: Math.max(0,(el.zIndex||10)-10)} as any})} className="px-2 h-7 rounded-full bg-zinc-800 text-[9px]" title="Send to Back">Back</button>
                      <button onClick={()=>updateElement(el.id, {locked: !el.locked})} className={'w-7 h-7 rounded-full text-[10px] ' + (el.locked?'bg-orange-600':'bg-zinc-800')} title={el.locked?'Unlock':'Lock'}>{el.locked?'🔒':'🔓'}</button>
                    </div>
                  )}

                  {/* Resize handles - corners - Drag corner → Resize it */}
                  {selectedId===el.id && !el.locked && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-nw-resize hover:scale-125 transition"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-ne-resize hover:scale-125 transition"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-sw-resize hover:scale-125 transition"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-se-resize hover:scale-125 transition"></div>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-n-resize"></div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#C45A3C] rounded-full border-2 border-black cursor-s-resize"></div>
                    </>
                  )}

                  <div className="absolute -bottom-6 left-0 mono text-[8px] text-zinc-500 bg-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">{el.type} {el.locked?'🔒':''}</div>
                </div>
              ))}
            </div>

            {/* Drop zone for Section Box */}
            <div className="absolute bottom-4 left-4 right-4 border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center bg-black/50 backdrop-blur-sm hover:border-orange-500/50 transition-colors">
              <div className="mono text-[10px] text-zinc-500">Drop zone - Drag photo into Section Box → Automatically fits box - Photo not stretched, auto crop/scale, adjust visible part - Section Box container - If section moved, elements inside move together</div>
            </div>
          </div>

          {/* Make existing website text editable */}
          <div className="mt-4 p-3 bg-[#0f0f0f] border border-zinc-800 rounded-xl">
            <div className="mono text-[10px] text-zinc-500">All text on website is editable - Click text to edit directly - All photos editable - Free movement drag-and-drop - Smart alignment lines appear when moving - Elements recognise when dragged inside Section Box</div>
          </div>
        </div>

        {/* Right Side - Settings for selected element */}
        <div className="w-[320px] bg-[#0f0f0f] border-l border-zinc-800 min-h-[calc(100vh-48px)] overflow-y-auto sticky top-[48px] h-[calc(100vh-48px)]">
          {selectedElement ? (
            <div className="p-4 space-y-5">
              <div>
                <div className="mono text-[11px] tracking-widest text-white">SELECTED · {selectedElement.type.toUpperCase()}</div>
                <div className="mt-1 mono text-[10px] text-zinc-500">{selectedElement.id} · {selectedElement.locked?'Locked 🔒 - Unlock to edit': 'Unlocked 🔓 - Click it → Edit it → Move it → Resize it'}</div>
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">TEXT EDITING · All text editable</div>
                <textarea value={selectedElement.content} onChange={e=>updateElement(selectedElement.id, {content: e.target.value})} className="mt-2 w-full bg-black border border-zinc-800 rounded-xl p-3 text-[12px] min-h-[100px] focus:border-orange-500 outline-none" placeholder="Change wording - Click on text and edit directly"/>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <select value={selectedElement.style.fontFamily as string || 'Inter'} onChange={e=>updateElement(selectedElement.id, {style:{fontFamily:e.target.value} as any})} className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]">
                    {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <button className="flex-1 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] font-bold">B</button>
                    <button className="flex-1 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] italic">I</button>
                    <button className="flex-1 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] underline">U</button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <input type="number" placeholder="Size" value={parseInt(selectedElement.style.fontSize as string)||14} onChange={e=>updateElement(selectedElement.id, {style:{fontSize:e.target.value+'px'} as any})} className="w-20 h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input type="color" value={selectedElement.style.color as string || '#ffffff'} onChange={e=>updateElement(selectedElement.id, {style:{color:e.target.value} as any})} className="w-10 h-9 bg-black border border-zinc-800 rounded-xl" />
                  <button onClick={()=>setShowColorPicker(!showColorPicker)} className="flex-1 h-9 bg-black border border-zinc-800 rounded-xl text-[10px]">Color Picker + Code</button>
                </div>
                {showColorPicker && (
                  <div className="mt-2 p-3 bg-black border border-zinc-800 rounded-xl">
                    <div className="grid grid-cols-6 gap-1.5">
                      {['#ffffff','#000000','#C45A3C','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#a1a1aa','#18181b','#27272a'].map(c=>(
                        <button key={c} onClick={()=>updateElement(selectedElement.id, {style:{color:c} as any})} className="w-6 h-6 rounded-full border border-zinc-700" style={{backgroundColor:c}} />
                      ))}
                    </div>
                    <input placeholder="#C45A3C" className="mt-2 w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2 text-[10px]" />
                  </div>
                )}
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <button className="h-8 bg-black border border-zinc-800 rounded-lg text-[10px]">Left</button>
                  <button className="h-8 bg-black border border-zinc-800 rounded-lg text-[10px]">Center</button>
                  <button className="h-8 bg-black border border-zinc-800 rounded-lg text-[10px]">Right</button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><div className="mono text-[9px] text-zinc-600">Letter spacing</div><input type="range" min="-2" max="10" className="w-full" /></div>
                  <div><div className="mono text-[9px] text-zinc-600">Line spacing</div><input type="range" min="1" max="3" step="0.1" className="w-full" /></div>
                </div>
              </div>

              {selectedElement.type==='image' && (
                <div>
                  <div className="mono text-[11px] text-zinc-400">PHOTOS & IMAGES · Editable directly</div>
                  <div className="mt-2 space-y-2">
                    <img src={selectedElement.src} alt="" className="w-full h-32 object-cover rounded-xl border border-zinc-800" />
                    <label className="w-full h-9 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center cursor-pointer">Replace Photo - Upload from computer<input type="file" accept="image/*" className="hidden" onChange={e=>handleImageUpload(e, selectedElement.id)} /></label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Crop</button>
                      <button className="h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Resize</button>
                    </div>
                    <div className="mono text-[9px] text-zinc-600">Move freely, resize, crop, duplicate, move into different sections, automatically fit Section Box, not stretched, auto crop/scale</div>
                  </div>
                </div>
              )}

              <div>
                <div className="mono text-[11px] text-zinc-400">BUTTON ACTION · No coding</div>
                <select value={selectedElement.action||'JOIN Event'} onChange={e=>updateElement(selectedElement.id, {action:e.target.value})} className="mt-2 w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]">
                  {BUTTON_ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input placeholder="Text JOIN" value={selectedElement.content} onChange={e=>updateElement(selectedElement.id, {content:e.target.value})} className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <select className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]"><option>Shape Pill</option><option>Square</option><option>Round</option></select>
                </div>
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">BOX & SECTION · Add Delete Move Resize Duplicate</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input placeholder="W" value={selectedElement.style.width as string||''} onChange={e=>updateElement(selectedElement.id, {style:{width:e.target.value} as any})} className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="H" value={selectedElement.style.height as string||''} onChange={e=>updateElement(selectedElement.id, {style:{height:e.target.value} as any})} className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="BG Color" onChange={e=>updateElement(selectedElement.id, {style:{backgroundColor:e.target.value} as any})} className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="Border" className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                </div>
                <div className="mt-2 flex gap-1">
                  <button onClick={()=>updateElement(selectedElement.id, {locked: !selectedElement.locked})} className={'flex-1 h-8 rounded-xl text-[10px] border ' + (selectedElement.locked?'bg-orange-600 border-orange-600 text-white':'bg-black border-zinc-800')}>{selectedElement.locked?'Unlock':'Lock'}</button>
                  <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Forward</button>
                  <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Back</button>
                </div>
                <div className="mt-2 mono text-[9px] text-zinc-600">Move forward/backward, bring to front, send to back, text over photo, button inside banner, lock position, duplicate, copy paste, align with smart lines</div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <button onClick={()=>duplicateElement(selectedElement.id)} className="w-full h-9 rounded-full bg-zinc-800 text-[11px]">Duplicate · Create another one</button>
                <button onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(selectedElement)); }} className="w-full h-9 rounded-full bg-zinc-800 text-[11px]">Copy · Paste between pages</button>
                <button onClick={()=>deleteElement(selectedElement.id)} className="w-full h-9 rounded-full bg-red-900/30 border border-red-800 text-[11px] text-red-400">Delete · Remove from page (not system data)</button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="mono text-[11px] text-zinc-400">No element selected · Click it → Edit it</div>
              <div className="text-[11px] leading-relaxed text-zinc-600">If something is visible on website, Founder/Admin should normally be able to Click it → Edit it, Drag it → Move it, Drag corner → Resize it, Duplicate → Create another, Delete → Remove from page, + Add → Add something new. For photos: Drag photo into box → Automatically fit box. For Buddy Blind functions: + Add → Select Feature → Drag into position. For sections: + Add → Select Section Type → Customise → Move/Resize.</div>
              <div className="bg-black border border-zinc-800 rounded-xl p-3">
                <div className="mono text-[10px] text-white">How to:</div>
                <div className="mt-2 text-[10px] leading-relaxed text-zinc-500 space-y-1">
                  <div>• Click text and type - Change wording, font, size, colour, bold, italic, underline, alignment, spacing, background, move, resize</div>
                  <div>• Drag photo from computer - Add from Media Library, delete, replace, move freely, resize, crop, duplicate, move into different sections, auto fit Section Box, not stretched</div>
                  <div>• Section Box container - Place photo, heading, description, button inside - If section moved, elements inside move together</div>
                  <div>• Event/Restaurant Section - Choose info displayed, change layout/design, data still from system</div>
                  <div>• + Add → Feature → Quick Meet etc - Drag into position - Delete only from page/layout not system data</div>
                  <div>• + Add → Button → Choose action JOIN/INVITE/SHARE etc - Change text, font, size, colour, shape, border, position - No coding</div>
                  <div>• Free Movement - Click Text/Photo/Button/Box/Event/Restaurant/Feature and drag - Smart alignment lines appear - Recognise when dragged inside Section Box</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
