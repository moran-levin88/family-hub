import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { deleteEventFromCalendar } from "@/lib/google-calendar";
import type { Member } from "@/types";

export async function POST(request: NextRequest) {
  const { calendarEventIds } = await request.json() as { calendarEventIds: Record<string, string> };

  if (!calendarEventIds || Object.keys(calendarEventIds).length === 0) {
    return NextResponse.json({ deleted: [] });
  }

  const membersSnap = await adminDb.collection("members").get();
  const results: { member: string; success: boolean }[] = [];

  for (const memberDoc of membersSnap.docs) {
    const member = { id: memberDoc.id, ...memberDoc.data() } as Member;
    const eventId = calendarEventIds[member.id];
    if (!eventId || !member.googleTokens?.access_token) continue;

    try {
      const updatedTokens = await deleteEventFromCalendar(member.googleTokens, eventId);
      if (updatedTokens.access_token !== member.googleTokens.access_token) {
        await adminDb.collection("members").doc(member.id).set({ googleTokens: updatedTokens }, { merge: true });
      }
      results.push({ member: member.name, success: true });
    } catch (err) {
      console.error(`Failed to delete for ${member.name}:`, err);
      results.push({ member: member.name, success: false });
    }
  }

  return NextResponse.json({ deleted: results });
}
