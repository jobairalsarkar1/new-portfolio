// export { auth as middleware } from "@/auth"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/docs", "/about", "/sign-in", "/unauthorized"];

  const protectedRoutes = ["/account", "/profile", "/settings"];

  const adminRoutes = ["/jas-dashboard"];

  if (session && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/jas-dashboard", req.url));
  }

  if (!session && protectedRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (adminRoutes.some(path => pathname.startsWith(path)) && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (publicPaths.some(path => pathname.startsWith(path)) || session) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/sign-in", req.url));
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}