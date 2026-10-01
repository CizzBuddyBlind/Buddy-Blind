const cache = globalThis.__bbTr || (globalThis.__bbTr = new Map());

function langPair(to) {
  if (to === "zh-HK") return "en|zh-TW";
  if (to === "zh") return "en|zh-CN";
  return "";
}

async function translateChunk(text, pair) {
  const key = pair + "\n" + text;
  if (cache.has(key)) return cache.get(key);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  const res = await fetch(url);
  const data = await res.json();
  const next = data?.responseData?.translatedText || text;
  cache.set(key, next);
  return next;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const texts = Array.isArray(body.texts) ? body.texts.map((item) => String(item || "").slice(0, 450)) : [];
  const pair = langPair(body.to);
  if (!pair || !texts.length) return Response.json({ texts });
  const out = [];
  let batch = [];
  let size = 0;
  async function flush() {
    if (!batch.length) return;
    const joined = batch.map((item) => item.text).join("\n@@@\n");
    let parts = [];
    try {
      const translated = await translateChunk(joined, pair);
      parts = String(translated).split(/\n?@@@\n?/);
    } catch {
      parts = batch.map((item) => item.text);
    }
    batch.forEach((item, index) => {
      let next = (parts[index] || item.text).trim();
      if (next && item.text.endsWith(next) === false && item.text.startsWith(next) && item.text.length === next.length + 1) next = item.text;
      out[item.index] = next;
    });
    batch = [];
    size = 0;
  }
  for (let index = 0; index < texts.length; index += 1) {
    const text = texts[index];
    if (size && size + text.length + 5 > 420) await flush();
    batch.push({ index, text });
    size += text.length + 5;
  }
  await flush();
  return Response.json({ texts: out });
}
