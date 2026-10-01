import { NextResponse } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD || "BuddyBlindPrivate";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (String(body.password || "") !== PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bb_private", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
