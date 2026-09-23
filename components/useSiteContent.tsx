'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const defaultContent = {
  heroLeft: "That's the point.",
  heroRightTitle: "The Buddy Blind",
  heroRightDesc: "You don't pick who you sit with. You just show up.",
  heroRightEvent: "Next — Sat, Sep 28 · 7PM · Ponsonby",
  privateTitle: "Private",
  privateDesc: "For teams, birthdays, and brands who want a real conversation.",
  venuesTitle: "Where we've been",
  profileName: "Cizz",
  profileRole: "Founder",
  quickTitle: "Quick",
};

const SiteContentContext = createContext<any>(null);
const LS_KEY = "buddy-blind-v9-content";

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState<any>(defaultContent);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setContent({ ...defaultContent, ...JSON.parse(raw) }); } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(content)); } catch {}
  }, [content, mounted]);

  const updateField = useCallback((key: string, value: string) => setContent((prev:any) => ({ ...prev, [key]: value })), []);
  const resetContent = useCallback(() => { setContent(defaultContent); try { localStorage.removeItem(LS_KEY); } catch {} }, []);
  const getText = useCallback((key: string, fallback?: string) => content?.[key] ?? fallback ?? '', [content]);
  const getStyle = useCallback((key: string) => ({}), []);

  const value = useMemo(() => ({
    content, mounted, isEditMode, setIsEditMode, updateField, resetContent, setContent,
    getText, getStyle, // for old profile page
  }), [content, mounted, isEditMode, updateField, resetContent, getText, getStyle]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

// Accept optional DEFAULT arg to fix: useSiteContent(DEFAULT) -> Expected 0 args error
export function useSiteContent(defaults?: any) {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be within SiteContentProvider");
  // if old code passes DEFAULT, merge it once
  useEffect(() => {
    if (defaults && ctx?.setContent) {
      // only merge keys that don't exist
      ctx.setContent((prev:any) => ({ ...defaults, ...prev }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ctx;
}

export default useSiteContent;
