"use client";

import { useState } from "react";
import { TIMES } from "@/lib/bible";
import { canonicalTime, timeInputValue } from "@/lib/timeLabel";

export function TimeChoices({ value, onChange, renderChoice }) {
  const custom = Boolean(value) && !TIMES.includes(value);
  const [open, setOpen] = useState(custom);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TIMES.map((item) => renderChoice(item, value === item && !open, () => { setOpen(false); onChange(item); }))}
        {renderChoice("Custom time", open || custom, () => setOpen(true))}
      </div>
      {(open || custom) && (
        <input
          type="time"
          aria-label="Custom time"
          value={timeInputValue(value)}
          onChange={(e) => {
            const next = canonicalTime(e.target.value);
            if (next) onChange(next);
          }}
          className="mt-3 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-fg caret-fg"
          style={{ colorScheme: "dark" }}
        />
      )}
    </div>
  );
}
