'use client';
export async function triggerCheckout(type: 'lite' | 'premium' | 'admin', venue_id?: string) {
  const res = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, venue_id, ref: 'cizz-HEART' }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else alert('Error: ' + (data.error || 'unknown'));
}
