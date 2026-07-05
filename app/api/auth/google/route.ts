import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-calendar";
import { requestOrigin } from "@/lib/request-origin";

export function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }
  return NextResponse.redirect(getAuthUrl(memberId, requestOrigin(request)));
}
