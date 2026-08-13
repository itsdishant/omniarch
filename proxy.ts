import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function publicPath(url: string | undefined, fallback: string) {
  const raw = url?.trim() || fallback;
  const pathname = raw.startsWith("http") ? new URL(raw).pathname : raw;
  const normalized = pathname.replace(/\/+$/, "") || fallback;
  return `${normalized}(.*)`;
}

const isPublicRoute = createRouteMatcher([
  publicPath(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in"),
  publicPath(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up"),
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
