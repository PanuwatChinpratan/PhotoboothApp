import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");

  if (session?.value) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";

  const res = NextResponse.redirect(url); // 307 by default
  res.cookies.set("flash-photobooth", "login-required-photobooth", {
    path: "/",
    maxAge: 60,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
  return res;
}

export const config = { matcher: ["/gallery/:path*"] };
