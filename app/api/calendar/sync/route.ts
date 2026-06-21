import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { addEventToCalendar } from "@/lib/google-calendar";
import type { Member } from "@/types";

export async function POST(request: NextRequest) {
  const { title, date, time, endTime, assignedTo } = await request.json();
  const filterByMembers: string[] | null = assignedTo?.length > 0 ? assignedTo : null;

  const membersSnap = await adminDb.collection("members").get();
  const results: { memberId: string; member: string; success: boolean; eventId?: string }[] = [];

  for (const memberDoc of membersSnap.docs) {
    const member = { id: memberDoc.id, ...memberDoc.data() } as Member;
    if (!member.googleTokens?.access_token) continue;
    if (filterByMembers && !filterByMembers.includes(member.id)) continue;

    try {
      const { updatedTokens, eventId } = await addEventToCalendar(member.googleTokens, { title, date, time, endTime });
      if (updatedTokens.access_token !== member.googleTokens.access_token) {
        await adminDb.collection("members").doc(member.id).set({ googleTokens: updatedTokens }, { merge: true });
      }
      results.push({ memberId: member.id, member: member.name, success: true, eventId });
    } catch (err) {
      console.error(`Failed to sync for ${member.name}:`, err);
      results.push({ memberId: member.id, member: member.name, success: false });
    }
  }

  return NextResponse.json({ synced: results });
}
