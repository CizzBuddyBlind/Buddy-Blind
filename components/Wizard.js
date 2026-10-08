"use client";

import { useBB } from "./Providers";
import { translate } from "@/lib/i18n";

const chrome = "text-xs uppercase tracking-[0.14em] text-mute hover:text-fg";

export function WizardDialog({ title, step, total, onBack, onClose, children, progress = false, backdropClose = false }) {
  const { lang } = useBB();
  const t = (key) => translate(lang, key);
  return (
    <div className="fixed inset-0 z-[85] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" onClick={backdropClose ? onClose : undefined}>
      <div className="bb-sheet max-h-[92dvh] w-full max-w-lg overflow-auto rounded-3xl border border-white/10 bg-[#101010] p-6 text-fg shadow-2xl" onClick={(event) => event.stopPropagation()}>
        {progress && (
          <div className="mb-4 h-px w-full bg-white/10">
            <div className="h-px bg-ember" style={{ width: `${Math.max(8, ((step || 0) / (total || 1)) * 100)}%` }} />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          {onBack ? <button type="button" className={chrome} onClick={onBack}>{t("btn.back")}</button> : <span />}
          {progress ? <span className="text-[10px] uppercase tracking-[0.16em] text-mute">{step}/{total}</span> : <span />}
          <button type="button" className={chrome} onClick={onClose}>{t("btn.close")}</button>
        </div>
        {title ? <h2 className="mt-4 font-serif text-3xl leading-tight">{title}</h2> : null}
        <div className={title ? "mt-5" : "mt-4"}>{children}</div>
      </div>
    </div>
  );
}

export function WizardSummary({ children, actions }) {
  return (
    <div className="text-sm leading-relaxed text-mute">
      <div className="space-y-1">{children}</div>
      {actions ? <div className="mt-4">{actions}</div> : null}
    </div>
  );
}
