import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { adminDb } from "@/lib/firebase-admin";
import { requestOrigin } from "@/lib/request-origin";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const code = request.nextUrl.searchParams.get("code");
  const memberId = request.nextUrl.searchParams.get("state");

  if (!code || !memberId) {
    return NextResponse.redirect(`${origin}/settings?error=1`);
  }

  try {
    // ה-redirect_uri בהחלפת הקוד חייב להיות זהה לזה שנשלח בבקשת ההרשאה
    const tokens = await exchangeCodeForTokens(code, origin);
    await adminDb.collection("members").doc(memberId).set({ googleTokens: tokens }, { merge: true });
    return NextResponse.redirect(`${origin}/settings?connected=1`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/settings?error=1`);
  }
}
