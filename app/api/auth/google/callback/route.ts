import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { adminDb } from "@/lib/firebase-admin";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const memberId = request.nextUrl.searchParams.get("state");

  if (!code || !memberId) {
    return NextResponse.redirect(`${appUrl}/settings?error=1`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await adminDb.collection("members").doc(memberId).set({ googleTokens: tokens }, { merge: true });
    return NextResponse.redirect(`${appUrl}/settings?connected=1`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/settings?error=1`);
  }
}
