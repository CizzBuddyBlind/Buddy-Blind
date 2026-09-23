function e164(phone) {
  const raw = String(phone || "").replace(/[^\d+]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("852")) return `+${raw}`;
  return `+${raw}`;
}

function message(body) {
  return [
    `Buddy Blind booking · ${body.action || "update"}`,
    body.venueName || "",
    body.dateISO ? `${body.dateISO} · ${body.time || ""}` : "",
    body.host ? `Host ${body.host}` : "",
    body.participants != null ? `${body.participants} people · hold ${body.held || 0} seats` : "",
    body.status ? `Status ${body.status}` : "",
    body.reason || "",
  ].filter(Boolean).join("\n");
}

async function sendEmail({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "no-key" };
  const from = process.env.RESEND_FROM || "Buddy Blind <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) return { status: "failed", detail: (await res.text()).slice(0, 180) };
  return { status: "sent" };
}

async function sendTwilio({ to, from, text }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { status: "no-key" };
  if (!from || !to) return { status: "no-from" };
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: to, Body: text }),
  });
  if (!res.ok) return { status: "failed", detail: (await res.text()).slice(0, 180) };
  return { status: "sent" };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const text = message(body);
  const method = body.method || "email";
  const subject = `Buddy Blind · ${body.venueName || "restaurant"} · ${body.action || "booking"}`;
  const recipients = [];
  if (body.email && !String(body.email).endsWith(".example")) recipients.push(body.email);
  if (body.userEmail && !recipients.includes(body.userEmail)) recipients.push(body.userEmail);
  const email = recipients.length
    ? await sendEmail({ to: recipients, subject, text })
    : { status: process.env.RESEND_API_KEY ? "skipped" : "no-key" };

  let sms = { status: "skipped" };
  let whatsapp = { status: "skipped" };
  const phone = e164(body.phone);
  if (method === "sms") {
    sms = await sendTwilio({ to: phone, from: process.env.TWILIO_SMS_FROM || "", text });
  }
  if (method === "whatsapp") {
    const from = process.env.TWILIO_WHATSAPP_FROM || "";
    const to = phone ? `whatsapp:${phone}` : "";
    whatsapp = await sendTwilio({ to, from, text });
  }

  const missing = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if ((method === "sms" || method === "whatsapp") && !process.env.TWILIO_ACCOUNT_SID) missing.push("Twilio");
  const hint = missing.length
    ? `Not sent yet. Add ${missing.join(" and ")} on Vercel, then redeploy.`
    : body.email && String(body.email).endsWith(".example")
      ? "Restaurant email is still a placeholder. Put a real address in Restaurants, then send again."
      : "";

  return Response.json({
    ok: true,
    email: email.status,
    sms: sms.status,
    whatsapp: whatsapp.status,
    hint,
    detail: email.detail || sms.detail || whatsapp.detail || "",
  });
}
