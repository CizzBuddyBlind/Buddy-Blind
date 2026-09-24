"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useBB } from "./Providers";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

let activeId = "";
const watchers = new Set();
function choose(id) {
  activeId = id;
  watchers.forEach((fn) => fn());
}

export function MoveBox({ id, className = "", children }) {
  const { editing, content, update } = useBB();
  const saved = content?.copy?.boxes?.[id] || {};
  const [live, setLive] = useState(null);
  const [on, setOn] = useState(false);
  const [shift, setShift] = useState(0);
  const [tick, setTick] = useState(0);
  const raw = live || saved;
  const box = raw.v === 2 ? raw : {};
  const boxRef = useRef(null);
  const x = box.x || 0;
  const y = box.y || 0;
  const scale = box.scale || 1;
  const width = box.sized ? box.w : 0;
  const align = box.align || "";
  const locked = align === "left" || align === "center" || align === "right";

  useEffect(() => {
    const sync = () => setOn(activeId === id);
    watchers.add(sync);
    sync();
    return () => watchers.delete(sync);
  }, [id]);

  function commit(next) {
    update((draft) => {
      if (!draft.copy.boxes) draft.copy.boxes = {};
      draft.copy.boxes[id] = {
        x: Math.round(next.x || 0),
        y: Math.round(next.y || 0),
        w: Math.round(next.w || 0),
        sized: !!next.sized,
        scale: Math.round((next.scale || 1) * 100) / 100,
        align: next.align || "",
        hidden: !!next.hidden,
        v: 2,
      };
    });
    setLive(null);
  }

  function pointer(start, onMove) {
    const liveBox = { x, y, w: width || 0, sized: !!box.sized, scale, align, hidden: false, v: 2 };
    function move(ev) {
      onMove(liveBox, ev.clientX - start.x, ev.clientY - start.y);
      setLive({ ...liveBox });
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      commit(liveBox);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  useEffect(() => {
    if (!locked) return undefined;
    const onResize = () => setTick((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [locked]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!locked || !el) return;
    const rect = el.getBoundingClientRect();
    const naturalLeft = rect.left - shift;
    const boxW = Math.max(el.scrollWidth, rect.width);
    const view = window.innerWidth;
    const pad = 24;
    const target = align === "center" ? (view - boxW) / 2 : align === "right" ? Math.max(pad, view - boxW - pad) : pad;
    const next = Math.round(target - naturalLeft);
    if (Math.abs(next - shift) > 1) setShift(next);
  }, [align, locked, width, scale, y, tick, saved.hidden, shift]);

  if (box.hidden) return null;
  const moved = x || y || width || scale !== 1 || locked;
  if (!editing && !moved) return children;

  function setAlign(next) {
    choose(id);
    setShift(0);
    commit({ x: 0, y: 0, w: width || 0, sized: !!box.sized, scale, align: next, hidden: false });
  }

  const rect = on && boxRef.current ? boxRef.current.getBoundingClientRect() : null;

  return (
    <span
      ref={boxRef}
      className={editing && on ? `${className} outline outline-1 outline-dashed outline-ember/70` : className}
      style={{
        display: "inline-block",
        position: "relative",
        left: locked ? shift : undefined,
        transform: locked ? `translateY(${y}px)` : x || y ? `translate(${x}px, ${y}px)` : undefined,
        width: width || undefined,
        maxWidth: "100%",
        zoom: scale === 1 ? undefined : scale,
        verticalAlign: "top",
      }}
      onMouseDownCapture={() => editing && choose(id)}
    >
      {editing && on && (
        <span
          className="fixed z-[80] flex items-center gap-1"
          style={{ top: Math.max(8, (rect?.top || 0) - 34), left: Math.max(8, rect?.left || 0) }}
        >
          {[
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setAlign(align === key ? "" : key)}
              className={`rounded-full px-2 py-0.5 text-[10px] ${align === key ? "bg-ember text-white" : "bg-white text-black"}`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => commit({ x, y, w: width || 0, sized: !!box.sized, scale, align, hidden: true })}
            className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white"
          >
            Delete
          </button>
        </span>
      )}
      {editing && on && (
        <button
          type="button"
          aria-label="Move"
          title={locked ? "Drag up or down" : "Drag to move"}
          className={`absolute -left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-ember text-xs text-white ${locked ? "cursor-ns-resize" : "cursor-grab"}`}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const start = { x: e.clientX, y: e.clientY };
            pointer(start, (liveBox, dx, dy) => {
              liveBox.x = locked ? 0 : x + dx;
              liveBox.y = y + dy;
            });
          }}
        >
          +
        </button>
      )}
      {editing && on && (
        <button
          type="button"
          aria-label="Resize"
          title="Drag to resize"
          className="absolute -bottom-1 -right-1 z-10 h-4 w-4 cursor-nwse-resize rounded-sm bg-white"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startW = width || boxRef.current?.getBoundingClientRect().width || 320;
            const start = { x: e.clientX, y: e.clientY };
            pointer(start, (liveBox, dx, dy) => {
              liveBox.w = clamp(startW + dx, 120, 1100);
              liveBox.sized = true;
              liveBox.x = locked ? 0 : x;
              liveBox.scale = clamp(scale + dy / 280, 0.75, 1.8);
            });
          }}
        />
      )}
      {children}
    </span>
  );
}
