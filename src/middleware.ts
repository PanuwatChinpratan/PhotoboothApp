// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");

  if (session?.value) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";                        // กลับหน้า Home
  url.searchParams.set("flash", "login-required"); 

  return NextResponse.redirect(url); 
}

export const config = { matcher: ["/gallery/:path*"] };
