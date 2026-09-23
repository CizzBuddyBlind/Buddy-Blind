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

function cardRow(venue) {
  const photo = venue.imageUrl && !String(venue.imageUrl).startsWith("data:") ? venue.imageUrl : "";
  return {
    name: venue.name,
    location: venue.locationLabel || "",
    photo_url: photo,
    places_left: Number.isFinite(venue.spots) ? venue.spots : 0,
    area: venue.area || null,
    time: venue.timeLabel || null,
    cuisine: venue.typeLabel || null,
    vibe_tag: venue.priceLabel || null,
    invite_text: venue.imageAlt || null,
  };
}

export async function saveSharedContent(content) {
  if (!supabase) throw new Error("Supabase is not configured on this deployment.");
  const doc = JSON.stringify(content);
  const { data, error } = await supabase
    .from("venues")
    .select("id")
    .eq("name", DOC_NAME)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const existingId = data?.[0]?.id;
  if (existingId) {
    const { error: updateError } = await supabase
      .from("venues")
      .update({ invite_text: doc, location: "site-document", places_left: 0 })
      .eq("id", existingId);
    if (updateError) throw new Error(updateError.message);
  } else {
    const { error: insertError } = await supabase.from("venues").insert({
      name: DOC_NAME,
      location: "site-document",
      places_left: 0,
      invite_text: doc,
    });
    if (insertError) throw new Error(insertError.message);
  }

  for (const venue of content.venues || []) {
    if (!venue?.name || String(venue.name).startsWith("__bb_")) continue;
    const row = cardRow(venue);
    const { data: found, error: findError } = await supabase
      .from("venues")
      .select("id")
      .eq("name", venue.name)
      .neq("name", DOC_NAME)
      .limit(1);
    if (findError) continue;
    if (found?.[0]?.id) {
      await supabase.from("venues").update(row).eq("id", found[0].id);
    } else {
      await supabase.from("venues").insert(row);
    }
  }
}
