"use client";

import { useRef, useState } from "react";
import { useBB } from "./Providers";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function MoveBox({ id, className = "", children }) {
  const { editing, content, update } = useBB();
  const saved = content?.copy?.boxes?.[id] || {};
  const [live, setLive] = useState(null);
  const box = live || saved;
  const boxRef = useRef(null);
  const x = box.x || 0;
  const y = box.y || 0;
  const scale = box.scale || 1;
  const width = box.w || undefined;

  function commit(next) {
    update((draft) => {
      if (!draft.copy.boxes) draft.copy.boxes = {};
      draft.copy.boxes[id] = {
        x: Math.round(next.x || 0),
        y: Math.round(next.y || 0),
        w: Math.round(next.w || 0),
        scale: Math.round((next.scale || 1) * 100) / 100,
      };
    });
    setLive(null);
  }

  function pointer(start, onMove) {
    const liveBox = { x, y, w: box.w || 0, scale };
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

  const frame = (
    <div
      ref={boxRef}
      className={className}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: width || undefined,
        position: "relative",
        zIndex: editing ? 3 : undefined,
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );

  if (!editing) return frame;

  return (
    <div
      ref={boxRef}
      className={`${className} rounded-md outline outline-1 outline-dashed outline-ember/70`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: width || undefined,
        position: "relative",
        zIndex: 3,
      }}
    >
      <button
        type="button"
        aria-label="Move"
        title="Drag to move"
        className="absolute -left-3 top-3 z-10 h-6 w-6 cursor-grab rounded-full bg-ember text-xs text-white active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const start = { x: e.clientX, y: e.clientY };
          pointer(start, (liveBox, dx, dy) => {
            liveBox.x = x + dx;
            liveBox.y = y + dy;
          });
        }}
      >
        +
      </button>
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
            liveBox.scale = clamp(scale + dy / 220, 0.7, 2.2);
          });
        }}
      />
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
