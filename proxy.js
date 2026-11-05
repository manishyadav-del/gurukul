import { NextResponse } from "next/server.js";

/**
 * Next.js Edge Proxy for Gurukul
 * Intercepts requests to prevent direct access to sensitive raw manuscript assets.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Block direct unauthenticated downloads of original source PDFs and generated editions
  if (pathname.startsWith("/uploads/books/") && (pathname.includes("/original/") || pathname.includes("/generated/"))) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden: Direct URL access to manuscript PDF files is restricted. Access via /api/books/[id]/source or /api/books/[id]/pdf?download=true with appropriate credentials.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uploads/books/:path*"],
};

