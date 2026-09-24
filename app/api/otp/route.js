function e164(phone) {
  const raw = String(phone || "").replace(/[^\d+]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("00")) return `+${raw.slice(2)}`;
  if (raw.startsWith("852")) return `+${raw}`;
  if (/^[4-9]\d{7}$/.test(raw)) return `+852${raw}`;
  return `+${raw}`;
}

function reasonFor(data) {
  const code = Number(data?.code);
  if (code === 60200 || code === 21211 || code === 21614) return "Use a full number, like +852 9123 4567.";
  if (code === 60203 || code === 60212 || code === 20429) return "Too many tries. Wait a few minutes.";
  if (code === 60202) return "That code is used up. Send a new one.";
  if (code === 20404) return "Send a new code.";
  if (code === 60205) return "Text codes aren't on for that country yet.";
  return "";
}

async function verify(path, params) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !service) {
    return { ok: false, reason: "Phone codes aren't switched on yet." };
  }
  const res = await fetch(`https://verify.twilio.com/v2/Services/${service}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, reason: reasonFor(data) || "The code could not be sent." };
  return { ok: true, data };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const to = e164(body.phone);
  if (!to || to.length < 8) {
    return Response.json({ ok: false, reason: "Use a full number, like +852 9123 4567." });
  }
  if (body.action === "check") {
    const code = String(body.code || "").replace(/\D/g, "");
    if (code.length < 4) return Response.json({ ok: false, reason: "Enter the code from your phone." });
    const checked = await verify("/VerificationCheck", { To: to, Code: code });
    if (!checked.ok) return Response.json(checked);
    if (checked.data.status !== "approved") {
      return Response.json({ ok: false, reason: "That code didn't match." });
    }
    return Response.json({ ok: true, phone: to });
  }
  const sent = await verify("/Verifications", { To: to, Channel: "sms" });
  if (!sent.ok) return Response.json(sent);
  return Response.json({ ok: true, phone: to });
}
