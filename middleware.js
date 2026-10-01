import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/gate" ||
    pathname.startsWith("/api/gate") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }
  if (request.cookies.get("bb_private")?.value === "1") return NextResponse.next();
  const url = request.nextUrl.clone();
  const next = `${pathname}${request.nextUrl.search || ""}`;
  url.pathname = "/gate";
  url.search = "";
  if (next.startsWith("/") && !next.startsWith("//")) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
