
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

type ElementType = 'text' | 'heading' | 'image' | 'video' | 'button' | 'box' | 'section' | 'divider' | 'spacer' | 'restaurant' | 'event';
type EditableElement = {
  id: string;
  type: ElementType;
  content: string;
  style: any;
  action?: string;
  src?: string;
  locked?: boolean;
};

const ELEMENT_DEFAULTS: Record<ElementType, Partial<EditableElement>> = {
  text: { content: 'New text - click to edit', style: { fontSize: '14px', color: '#a1a1aa', fontFamily: 'mono', padding: '8px' } },
  heading: { content: 'New Heading', style: { fontSize: '32px', color: '#ffffff', fontFamily: 'serif', fontWeight: 'bold' } },
  image: { content: '', src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', style: { width: '300px', height: '200px', borderRadius: '16px' } },
  video: { content: 'Video', style: { width: '400px', height: '225px', backgroundColor: '#27272a' } },
  button: { content: 'JOIN', style: { backgroundColor: '#ffffff', color: '#000000', padding: '12px 24px', borderRadius: '9999px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.14em' }, action: 'JOIN Event' },
  box: { content: '', style: { width: '200px', height: '200px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' } },
  section: { content: 'New Section', style: { width: '100%', minHeight: '200px', backgroundColor: '#0f0f0f', padding: '40px' } },
  divider: { content: '', style: { height: '1px', backgroundColor: '#27272a', width: '100%', margin: '20px 0' } },
  spacer: { content: '', style: { height: '40px', width: '100%' } },
  restaurant: { content: 'Kissa Tanaka', style: { backgroundColor: '#18181b', padding: '16px', borderRadius: '16px', color: '#ffffff' } },
  event: { content: 'Blind Dinner', style: { backgroundColor: '#18181b', padding: '16px', borderRadius: '16px', color: '#ffffff' } },
};

const BUTTON_ACTIONS = [
  'JOIN Event', 'INVITE', 'SHARE', 'Previous Page', 'Next Page', 'Open Profile', 
  'Open Restaurant', 'Create Private Event', 'Open Venues', 'Open Private Events',
  'External Link', 'Copy Link', 'Book Venue', 'View Bookings'
];

export default function AdminEditor({ children }: { children: React.ReactNode }){
  const { isAdmin, isLoggedIn, logout } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [history, setHistory] = useState<EditableElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLog, setActivityLog] = useState<{time:string, action:string, user:string}[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [isPreviewAsUser, setIsPreviewAsUser] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Auto enable edit mode when admin logged in
  useEffect(()=>{
    if(isAdmin && isLoggedIn){
      setIsEditMode(true);
      addLog('Entered Admin Edit Mode', 'ADMIN');
    } else {
      setIsEditMode(false);
      setSelectedId(null);
    }
  },[isAdmin, isLoggedIn]);

  // Warn unsaved changes
  useEffect(()=>{
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if(hasUnsaved && isEditMode){
        e.preventDefault();
        e.returnValue = 'You have unsaved changes - Save draft before leaving?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return ()=>window.removeEventListener('beforeunload', handleBeforeUnload);
  },[hasUnsaved, isEditMode]);

  const addLog = (action:string, user:string='ADMIN') => {
    const now = new Date().toLocaleTimeString();
    setActivityLog(prev => [{time: now, action, user}, ...prev].slice(0,50));
  };

  const saveToHistory = (newElements: EditableElement[]) => {
    const newHistory = history.slice(0, historyIndex+1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length-1);
    setHasUnsaved(true);
  };

  const undo = () => {
    if(historyIndex>0){
      setHistoryIndex(historyIndex-1);
      setElements(history[historyIndex-1]);
      addLog('Undo', 'ADMIN');
    }
  };

  const redo = () => {
    if(historyIndex<history.length-1){
      setHistoryIndex(historyIndex+1);
      setElements(history[historyIndex+1]);
      addLog('Redo', 'ADMIN');
    }
  };

  const addElement = (type: ElementType) => {
    const id = 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2,5);
    const defaults = ELEMENT_DEFAULTS[type];
    const newEl: EditableElement = {
      id,
      type,
      content: defaults.content || '',
      style: { ...defaults.style, position: 'relative', left: '0px', top: '0px' },
      action: (defaults as any).action,
      src: (defaults as any).src,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(id);
    setShowAddMenu(false);
    addLog(`Added ${type}: ${newEl.content.slice(0,20)}`, 'ADMIN');
  };

  const updateElement = (id:string, updates: Partial<EditableElement>) => {
    const newElements = elements.map(el => el.id===id ? { ...el, ...updates } : el);
    setElements(newElements);
    setHasUnsaved(true);
  };

  const deleteElement = (id:string) => {
    if(!confirm('Delete this element? This cannot be undone unless you undo.')) return;
    const newElements = elements.filter(el => el.id!==id);
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedId(null);
    addLog(`Deleted element ${id}`, 'ADMIN');
  };

  const duplicateElement = (id:string) => {
    const el = elements.find(e=>e.id===id);
    if(!el) return;
    const newId = 'el-' + Date.now();
    const newEl = { ...el, id: newId, style: { ...el.style, left: '20px', top: '20px' } };
    const newElements = [...elements, newEl];
    setElements(newElements);
    saveToHistory(newElements);
    addLog(`Duplicated ${el.type}`, 'ADMIN');
  };

  const handleSaveDraft = () => {
    localStorage.setItem('bb_admin_draft', JSON.stringify({elements, device, savedAt: new Date().toISOString()}));
    localStorage.setItem('bb_draft', JSON.stringify({adminElements: elements, savedAt: new Date().toISOString()}));
    setHasUnsaved(false);
    addLog('Saved draft', 'ADMIN');
    // Show toast
    const toast = document.createElement('div');
    toast.textContent = 'Draft saved - Not published yet';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-full text-xs z-[100]';
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(), 2000);
  };

  const handlePublish = async () => {
    if(!confirm('Publish changes? This will make changes live for all normal users.')) return;
    localStorage.setItem('bb_published', JSON.stringify({elements, publishedAt: new Date().toISOString()}));
    localStorage.setItem('bb_published_live', JSON.stringify(elements));
    localStorage.removeItem('bb_admin_draft');
    setHasUnsaved(false);
    addLog('Published live', 'ADMIN');
    alert('Published! Website now shows edited version to normal users.');
  };

  const handlePreviewToggle = () => {
    setIsPreviewAsUser(!isPreviewAsUser);
    addLog(isPreviewAsUser ? 'Exit preview as user' : 'Preview as user', 'ADMIN');
  };

  const handleExit = () => {
    if(hasUnsaved && !confirm('You have unsaved changes. Exit without saving?')) return;
    setIsEditMode(false);
    setIsPreviewAsUser(false);
    addLog('Exited edit mode - Preview as user', 'ADMIN');
  };

  if(!isAdmin || !isLoggedIn || !isEditMode || isPreviewAsUser){
    return (
      <>
        {children}
        {isAdmin && isLoggedIn && isPreviewAsUser && (
          <div className="fixed top-[64px] left-0 right-0 z-40 bg-blue-600 text-white text-xs px-6 py-2 flex justify-between items-center">
            <span>Preview as User - Normal website view - Click Exit Preview to return to edit mode</span>
            <button onClick={handlePreviewToggle} className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Exit Preview</button>
          </div>
        )}
      </>
    );
  }

  // ADMIN EDIT MODE UI - Wix-like
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Toolbar - Undo, Redo, Desktop/Mobile Preview, Save Draft, Preview, Publish */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800 h-[48px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800">
            <button onClick={undo} disabled={historyIndex<=0} className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-xs disabled:opacity-30">↩</button>
            <button onClick={redo} disabled={historyIndex>=history.length-1} className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-xs disabled:opacity-30">↪</button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-black rounded-full p-1 border border-zinc-800 ml-2">
            <button onClick={()=>setDevice('desktop')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='desktop'?'bg-white text-black':'text-zinc-400')}>Desktop</button>
            <button onClick={()=>setDevice('tablet')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='tablet'?'bg-white text-black':'text-zinc-400')}>Tablet</button>
            <button onClick={()=>setDevice('mobile')} className={'px-3 h-8 rounded-full text-[11px] ' + (device==='mobile'?'bg-white text-black':'text-zinc-400')}>Mobile</button>
          </div>
          {hasUnsaved && <span className="ml-3 text-[10px] text-orange-400">• Unsaved changes</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handlePreviewToggle} className="h-8 px-3 rounded-full border border-zinc-700 text-[11px] hover:bg-zinc-800">Preview as User</button>
          <button onClick={handleSaveDraft} className="h-8 px-3 rounded-full bg-zinc-800 border border-zinc-700 text-[11px]">Save Draft</button>
          <button onClick={()=>setShowActivityLog(!showActivityLog)} className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[11px]">🕒</button>
          <button onClick={handleExit} className="h-8 px-3 rounded-full border border-zinc-700 text-[11px]">Exit</button>
          <button onClick={handlePublish} className="h-8 px-4 rounded-full bg-[#C45A3C] text-white text-[11px] font-bold">Publish</button>
        </div>
      </div>

      <div className="flex">
        {/* Left Toolbar - Add text, photos, videos, buttons, sections */}
        <div className="w-[280px] bg-[#0f0f0f] border-r border-zinc-800 min-h-[calc(100vh-48px)] p-4 overflow-y-auto sticky top-[48px] h-[calc(100vh-48px)]">
          <div className="space-y-6">
            <div>
              <div className="mono text-[11px] tracking-[0.14em] text-white font-bold">ADMIN EDIT MODE</div>
              <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed">See it → Click it → Edit it → Drag it → Preview it → Publish it. If you can see it, you can click and edit it directly.</div>
              <div className="mt-2 mono text-[10px] text-orange-400">Same login as normal user - Auto recognised as admin - No separate backend needed</div>
            </div>

            <div>
              <button onClick={()=>setShowAddMenu(!showAddMenu)} className="w-full h-10 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em]">+ Add Element</button>
              {showAddMenu && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(['text','heading','image','video','button','box','section','divider','spacer','restaurant','event'] as ElementType[]).map(type=>(
                    <button key={type} onClick={()=>addElement(type)} className="h-12 rounded-xl bg-black border border-zinc-800 hover:border-orange-500 text-[11px] capitalize hover:scale-[1.02] transition">
                      <div className="text-[16px]">{type==='text'?'T':type==='heading'?'H':type==='image'?'🖼':type==='video'?'▶':type==='button'?'🔘':type==='box'?'□':type==='section'?'◫':type==='divider'?'—':type==='spacer'?'↕':type==='restaurant'?'🍽':'🎉'}</div>
                      <div className="mono text-[9px] mt-1">{type}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mono text-[11px] tracking-[0.12em] text-zinc-400">PAGES & SECTIONS</div>
              <div className="mt-2 space-y-2">
                {['Home','Venues','Private Events','How It Works','Premium','Profile','Invite','Join'].map(page=>(
                  <div key={page} className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl p-2">
                    <span className="text-[11px]">{page}</span>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">⎙</button>
                      <button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">👁</button>
                    </div>
                  </div>
                ))}
                <button className="w-full h-9 rounded-full border border-dashed border-zinc-700 text-[11px] text-zinc-500">+ Add New Page</button>
              </div>
            </div>

            <div>
              <div className="mono text-[11px] tracking-[0.12em] text-zinc-400">MEDIA LIBRARY</div>
              <div className="mt-2">
                <button onClick={()=>setShowMedia(!showMedia)} className="w-full h-9 rounded-full bg-zinc-900 border border-zinc-800 text-[11px]">📁 Browse Media Library</button>
                <div className="mt-2 text-[10px] text-zinc-600">Drag photo from computer onto page or + Add → Image → Upload from Computer</div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="mono text-[10px] text-zinc-500">Version History • Auto save drafts • Activity Log • Admin permission required • Normal users never see edit mode</div>
            </div>
          </div>
        </div>

        {/* Main Editing Area - Shows actual website/page and allows direct drag-and-drop editing */}
        <div className={'flex-1 bg-[#080808] p-4 md:p-8 overflow-auto ' + (device==='mobile'?'max-w-[375px] mx-auto':device==='tablet'?'max-w-[768px] mx-auto':'')}>
          <div className="relative min-h-[800px] bg-black rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Smart alignment lines - show when dragging */}
            {dragging && (
              <>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500/50 pointer-events-none"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/50 pointer-events-none"></div>
              </>
            )}

            {/* Actual website content - editable */}
            <div className="relative">
              {children}
              
              {/* Editable overlay elements */}
              {elements.map(el=>(
                <div
                  key={el.id}
                  onClick={()=>setSelectedId(el.id)}
                  onMouseDown={()=>setDragging(el.id)}
                  onMouseUp={()=>setDragging(null)}
                  className={'absolute group cursor-move border-2 transition-all ' + (selectedId===el.id?'border-orange-500 z-10':'border-transparent hover:border-zinc-600')}
                  style={{left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height, ...el.style}}
                >
                  {el.type==='text' || el.type==='heading' ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e=>updateElement(el.id, {content: e.currentTarget.textContent||''})}
                      className="outline-none w-full h-full"
                      style={el.style}
                    >
                      {el.content}
                    </div>
                  ) : el.type==='image' ? (
                    <img src={el.src} alt="" className="w-full h-full object-cover" style={{borderRadius: el.style.borderRadius}} />
                  ) : el.type==='button' ? (
                    <button className="w-full h-full" style={el.style}>{el.content}</button>
                  ) : (
                    <div style={el.style}>{el.content}</div>
                  )}

                  {/* Element controls - show on select */}
                  {selectedId===el.id && (
                    <div className="absolute -top-8 left-0 flex gap-1 bg-black border border-zinc-700 rounded-full p-1">
                      <button onClick={()=>duplicateElement(el.id)} className="w-6 h-6 rounded-full bg-zinc-800 text-[10px] hover:bg-zinc-700">⎙</button>
                      <button onClick={()=>deleteElement(el.id)} className="w-6 h-6 rounded-full bg-red-900 text-[10px] hover:bg-red-800">✕</button>
                      <button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">↔</button>
                      <button className="w-6 h-6 rounded-full bg-zinc-800 text-[10px]">↕</button>
                      <span className="text-[9px] px-2 flex items-center mono text-zinc-400">{el.type}</span>
                    </div>
                  )}

                  {/* Resize handles - corners */}
                  {selectedId===el.id && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full cursor-nw-resize"></div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full cursor-ne-resize"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-500 rounded-full cursor-sw-resize"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full cursor-se-resize"></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drop zone for new elements */}
          <div
            className="mt-4 border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-colors"
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{
              e.preventDefault();
              const files = e.dataTransfer.files;
              if(files.length>0){
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (ev)=>{
                  addElement('image');
                  const lastId = elements[elements.length-1]?.id;
                  if(lastId){
                    updateElement(lastId, {src: ev.target?.result as string});
                  }
                };
                reader.readAsDataURL(file);
                addLog(`Uploaded image ${file.name} from computer`, 'ADMIN');
              }
            }}
          >
            <div className="mono text-[11px] text-zinc-500">Drag photo from computer here or + Add → Image → Upload from Computer</div>
          </div>
        </div>

        {/* Right-side settings panel - Shows settings only for selected element */}
        <div className="w-[320px] bg-[#0f0f0f] border-l border-zinc-800 min-h-[calc(100vh-48px)] p-4 overflow-y-auto sticky top-[48px] h-[calc(100vh-48px)]">
          {selectedId ? (
            <div className="space-y-6">
              <div>
                <div className="mono text-[11px] tracking-[0.14em] text-white">SELECTED ELEMENT</div>
                <div className="mt-1 mono text-[10px] text-zinc-500">{elements.find(e=>e.id===selectedId)?.type} · {selectedId}</div>
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">CONTENT · Click to edit directly</div>
                <textarea
                  value={elements.find(e=>e.id===selectedId)?.content||''}
                  onChange={e=>updateElement(selectedId, {content: e.target.value})}
                  className="mt-2 w-full bg-black border border-zinc-800 rounded-xl p-3 text-[12px] min-h-[80px]"
                  placeholder="Wording - Click title and type"
                />
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">FONT · Size · Colour · Style</div>
                <div className="mt-2 space-y-3">
                  <select className="w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]">
                    <option>Inter · Mono</option>
                    <option>Serif · Font-serif</option>
                    <option>Bold · Font-black</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Size" className="w-20 h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" defaultValue={16} />
                    <input type="color" className="w-10 h-9 bg-black border border-zinc-800 rounded-xl" defaultValue="#ffffff" />
                    <div className="flex gap-1">
                      <button className="w-8 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] font-bold">B</button>
                      <button className="w-8 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] italic">I</button>
                      <button className="w-8 h-9 bg-black border border-zinc-800 rounded-xl text-[11px] underline">U</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Left</button>
                    <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Center</button>
                    <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Right</button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">BUTTON ACTION → What it does</div>
                <select
                  value={elements.find(e=>e.id===selectedId)?.action||'JOIN Event'}
                  onChange={e=>updateElement(selectedId, {action: e.target.value})}
                  className="mt-2 w-full h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]"
                >
                  {BUTTON_ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
                <div className="mt-2 mono text-[9px] text-zinc-600">Simple menu - No HTML/CSS/DB IDs - JOIN | INVITE | SHARE | BACK | NEXT | VIEW PROFILE | Open Restaurant | Create Private Event | etc.</div>
              </div>

              <div>
                <div className="mono text-[11px] text-zinc-400">POSITION · Size · Align · Layer</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input placeholder="W" className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="H" className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="X" className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                  <input placeholder="Y" className="h-9 bg-black border border-zinc-800 rounded-xl px-3 text-[11px]" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Lock</button>
                  <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Forward</button>
                  <button className="flex-1 h-8 bg-black border border-zinc-800 rounded-xl text-[10px]">Backward</button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <button onClick={()=>selectedId && duplicateElement(selectedId)} className="w-full h-9 rounded-full bg-zinc-800 text-[11px]">Duplicate · Copy Paste</button>
                <button onClick={()=>selectedId && deleteElement(selectedId)} className="w-full h-9 rounded-full bg-red-900/30 border border-red-800 text-[11px] text-red-400">Delete · Confirm before delete important</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mono text-[11px] text-zinc-400">No element selected</div>
              <div className="text-[11px] leading-relaxed text-zinc-600">Click an element on page to select it. Drag anywhere, resize by corners, duplicate, copy paste, delete, lock, bring forward/backward, align with smart lines. Undo/Redo available.</div>
              <div className="bg-black border border-zinc-800 rounded-xl p-3">
                <div className="mono text-[10px] text-white">How to edit:</div>
                <div className="mt-2 text-[10px] leading-relaxed text-zinc-500 space-y-1">
                  <div>• Click title and type</div>
                  <div>• Drag photo from computer</div>
                  <div>• + Add → Button → JOIN</div>
                  <div>• Select action: JOIN Event</div>
                  <div>• Drag into position</div>
                  <div>• Save Draft → Preview → Publish</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-zinc-800">
            <div className="mono text-[10px] text-zinc-600">Admin Activity Log - What changed, when, which admin</div>
            <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
              {activityLog.slice(0,10).map((log,i)=>(
                <div key={i} className="text-[9px] mono text-zinc-500 flex gap-2">
                  <span className="text-zinc-600">{log.time}</span>
                  <span>{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Modal */}
      {showActivityLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-[18px]">Admin Activity Log</h3>
              <button onClick={()=>setShowActivityLog(false)} className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">✕</button>
            </div>
            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
              {activityLog.map((log,i)=>(
                <div key={i} className="flex justify-between bg-black border border-zinc-800 rounded-xl p-3">
                  <span className="text-[11px]">{log.action}</span>
                  <span className="mono text-[10px] text-zinc-500">{log.time} · {log.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Library */}
      {showMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-[18px]">Media Library - Previously uploaded content</h3>
              <button onClick={()=>setShowMedia(false)} className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7,8].map(i=>(
                <div key={i} className="aspect-square bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-600">IMG {i}</div>
              ))}
            </div>
            <button className="mt-4 w-full h-10 rounded-full bg-white text-black text-[11px] font-bold">Upload from Computer</button>
          </div>
        </div>
      )}
    </div>
  );
}
