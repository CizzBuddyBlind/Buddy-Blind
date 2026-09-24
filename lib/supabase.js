import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseReady = Boolean(url && key);
export const supabase = supabaseReady ? createClient(url, key) : null;

const DOC_NAME = "__bb_published__";

export async function loadSharedContent() {
  if (!supabase) return { ok: false, reason: "missing-env" };
  const { data, error } = await supabase
    .from("venues")
    .select("id,invite_text,created_at")
    .eq("name", DOC_NAME)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return { ok: false, reason: error.message };
  const row = data?.[0];
  if (!row?.invite_text) return { ok: true, content: null, id: row?.id || null };
  try {
    const content = JSON.parse(row.invite_text);
    if (!content?.venues || !content?.copy) return { ok: true, content: null, id: row.id };
    return { ok: true, content, id: row.id };
  } catch {
    return { ok: true, content: null, id: row.id };
  }
}

function slimDoc(content) {
  try {
    return JSON.parse(JSON.stringify(content, (key, value) => {
      if (typeof value === "string" && (value.startsWith("data:") || value.length > 80000)) return "";
      return value;
    }));
  } catch {
    return { venues: [], events: [], copy: content?.copy || {}, bookingLog: [] };
  }
}

export async function saveSharedContent(content) {
  if (!supabase) return { ok: false, reason: "Supabase is not configured." };
  const slim = slimDoc(content);
  const doc = JSON.stringify(slim);
  const { data, error } = await supabase
    .from("venues")
    .select("id")
    .eq("name", DOC_NAME)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return { ok: false, reason: error.message };
  const existingId = data?.[0]?.id;
  if (existingId) {
    const { error: updateError } = await supabase
      .from("venues")
      .update({ invite_text: doc, location: "site-document", places_left: 0 })
      .eq("id", existingId);
    if (updateError) return { ok: false, reason: updateError.message };
  } else {
    const { error: insertError } = await supabase.from("venues").insert({
      name: DOC_NAME,
      location: "site-document",
      places_left: 0,
      invite_text: doc,
    });
    if (insertError) return { ok: false, reason: insertError.message };
  }
  return { ok: true };
}
