import { marketFromCode } from "@/lib/market";

export const dynamic = "force-dynamic";

export function GET(request) {
  const geo = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "";
  const market = marketFromCode(geo);
  return Response.json({ id: market.id, fee: market.fee, free: market.free, lite: market.lite, premium: market.premium });
}