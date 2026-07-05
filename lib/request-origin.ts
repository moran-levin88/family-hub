import type { NextRequest } from "next/server";

// הדומיין הציבורי של הבקשה — מאחורי פרוקסי (Vercel) לוקחים את הכותרות המקוריות,
// כך שה-redirect URI של OAuth תמיד תואם לכתובת שממנה גולשים
export function requestOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return process.env.NEXT_PUBLIC_APP_URL ?? "";
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
