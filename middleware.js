import { NextResponse } from "next/server";
import { decodeSession } from "./app/lib/session";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  const session = decodeSession(token);

  if (pathname.startsWith("/login")) {
    if (session?.username) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.username || session.username.toLowerCase() !== "rajesh") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!session?.username) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/login|api/logout|api/envcheck|_next/static|_next/image|favicon.ico).*)",
  ],
};
