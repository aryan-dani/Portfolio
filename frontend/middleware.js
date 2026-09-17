/**
 * Edge middleware: serve the SPA shell with HTTP 404 for unknown paths.
 * Known routes and static assets pass through unchanged.
 * Paths are listed explicitly so this file stays Edge-safe (no React imports).
 */
const KNOWN_PATHS = new Set([
  "/",
  "/projects",
  "/experience",
  "/certifications",
  "/skills",
  "/about",
  "/contact",
  "/playground",
  "/achievements",
  "/guestbook",
  "/copyright",
  "/404",
  "/resume.pdf",
]);

export const config = {
  matcher: ["/((?!api/|assets/|Images/|favicons/).*)"],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname !== "/" && pathname.endsWith("/")) {
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return Response.redirect(url, 308);
  }

  const looksStatic = /\.[a-zA-Z0-9]{1,8}$/.test(pathname);
  if (looksStatic || KNOWN_PATHS.has(pathname)) {
    return;
  }

  const shell = await fetch(new URL("/index.html", url.origin));
  const headers = new Headers(shell.headers);
  headers.set("x-portfolio-not-found", "1");
  headers.set("cache-control", "no-store");

  return new Response(shell.body, {
    status: 404,
    statusText: "Not Found",
    headers,
  });
}
