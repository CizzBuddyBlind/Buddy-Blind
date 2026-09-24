"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useBB } from "./Providers";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function MoveBox({ id, className = "", children }) {
  const { editing, content, update } = useBB();
  const saved = content?.copy?.boxes?.[id] || {};
  const [live, setLive] = useState(null);
  const [shift, setShift] = useState(0);
  const [tick, setTick] = useState(0);
  const box = live || saved;
  const boxRef = useRef(null);
  const markerRef = useRef(null);
  const x = box.x || 0;
  const y = box.y || 0;
  const scale = box.scale || 1;
  const width = box.w || undefined;
  const align = box.align || "";

  function commit(next) {
    update((draft) => {
      if (!draft.copy.boxes) draft.copy.boxes = {};
      draft.copy.boxes[id] = {
        x: Math.round(next.x || 0),
        y: Math.round(next.y || 0),
        w: Math.round(next.w || 0),
        scale: Math.round((next.scale || 1) * 100) / 100,
        align: next.align || "",
        hidden: !!next.hidden,
      };
    });
    setLive(null);
  }

  function pointer(start, onMove) {
    const liveBox = { x, y, w: box.w || 0, scale, align, hidden: false };
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
    if (!align) return undefined;
    const on = () => setTick((n) => n + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [align]);

  useLayoutEffect(() => {
    if (!align || !markerRef.current) return;
    const marker = markerRef.current.getBoundingClientRect().left;
    const boxW = boxRef.current?.getBoundingClientRect().width || width || 0;
    const view = window.innerWidth;
    const pad = 16;
    const target = align === "center" ? (view - boxW) / 2 : align === "right" ? view - boxW - pad : pad;
    setShift(target - marker);
  }, [align, width, scale, y, tick, saved.hidden]);

  const moved = x || y || width || scale !== 1 || align || saved.hidden;
  if (saved.hidden) return null;
  if (!editing && !moved) return children;

  function setAlign(next) {
    commit({ x: 0, y, w: box.w || 0, scale, align: next, hidden: false });
  }

  function removeBox() {
    commit({ x, y, w: box.w || 0, scale, align, hidden: true });
  }

  const locked = align === "left" || align === "center" || align === "right";

  return (
    <div className={className}>
      <span ref={markerRef} className="block h-0 w-0" />
      <div
        ref={boxRef}
        className={editing ? "relative rounded-md outline outline-1 outline-dashed outline-ember/70" : "relative"}
        style={{
          transform: locked ? `translateY(${y}px)` : `translate(${x}px, ${y}px)`,
          left: locked ? shift : undefined,
          width: width || (locked ? "max-content" : undefined),
          maxWidth: locked ? "calc(100vw - 2rem)" : undefined,
          zIndex: editing ? 3 : undefined,
        }}
      >
        {editing && (
          <div className="absolute -top-7 left-0 z-10 flex items-center gap-1">
            {[
              ["left", "Left"],
              ["center", "Center"],
              ["right", "Right"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAlign(align === key ? "" : key)}
                className={`rounded-full px-2 py-0.5 text-[10px] ${align === key ? "bg-ember text-white" : "bg-white text-black"}`}
              >
                {label}
              </button>
            ))}
            <button type="button" onClick={removeBox} className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
              Delete
            </button>
          </div>
        )}
        {editing && (
          <button
            type="button"
            aria-label="Move"
            title={locked ? "Drag up or down" : "Drag to move"}
            className={`absolute -left-3 top-3 z-10 h-6 w-6 rounded-full bg-ember text-xs text-white ${locked ? "cursor-ns-resize" : "cursor-grab"}`}
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
        {editing && (
          <button
            type="button"
            aria-label="Resize"
            title="Drag to resize"
            className="absolute -bottom-2 -right-2 z-10 h-4 w-4 cursor-nwse-resize rounded-sm bg-white"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startW = box.w || boxRef.current?.getBoundingClientRect().width || 320;
              const start = { x: e.clientX, y: e.clientY };
              pointer(start, (liveBox, dx, dy) => {
                liveBox.w = clamp(startW + dx, 180, 920);
                liveBox.x = locked ? 0 : x;
                liveBox.scale = clamp(scale + dy / 220, 0.7, 2.2);
              });
            }}
          />
        )}
        <div style={{ transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </div>
  );
}
