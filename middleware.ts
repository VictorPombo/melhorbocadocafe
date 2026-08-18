import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rotas públicas, estáticas e assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/fidelidade/girar") ||
    pathname.startsWith("/api/fidelidade/codigo-vinculo/validar") ||
    pathname.startsWith("/api/fidelidade/cupom/validar") ||
    pathname.startsWith("/api/fidelidade/cupom/resgatar") ||
    pathname.startsWith("/fidelidade") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/apple-touch-icon.png") ||
    pathname.startsWith("/og-image.png") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Proteção do Portal de Gestão (/gestao/*)
  if (pathname.startsWith("/gestao")) {
    const isLoginPage = pathname === "/gestao/login";
    const authCookie = request.cookies.get("mb_auth")?.value;
    const roleCookie = request.cookies.get("mb_role")?.value;

    const isAuthed = authCookie === "true";

    // 1. Se não estiver autenticado e tentar acessar qualquer página de gestão que não seja login
    if (!isAuthed && !isLoginPage) {
      const loginUrl = new URL("/gestao/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Regra de autorização para perfil "Caixa": acesso restrito ao terminal de caixa
    if (isAuthed && roleCookie === "caixa" && !pathname.startsWith("/gestao/fidelidade/caixa") && !isLoginPage) {
      return NextResponse.redirect(new URL("/gestao/fidelidade/caixa", request.url));
    }
  }

  // Injetar cabeçalhos de segurança HTTP
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
