import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteEventFromCalendar } from "@/lib/google-calendar";
import type { Member } from "@/types";

export async function POST(request: NextRequest) {
  const { calendarEventIds } = await request.json() as { calendarEventIds: Record<string, string> };

  if (!calendarEventIds || Object.keys(calendarEventIds).length === 0) {
    return NextResponse.json({ deleted: [] });
  }

  const membersSnap = await getDocs(collection(db, "members"));
  const results: { member: string; success: boolean }[] = [];

  for (const memberDoc of membersSnap.docs) {
    const member = { id: memberDoc.id, ...memberDoc.data() } as Member;
    const eventId = calendarEventIds[member.id];
    if (!eventId || !member.googleTokens?.access_token) continue;

    try {
      const updatedTokens = await deleteEventFromCalendar(member.googleTokens, eventId);
      if (updatedTokens.access_token !== member.googleTokens.access_token) {
        await setDoc(doc(db, "members", member.id), { googleTokens: updatedTokens }, { merge: true });
      }
      results.push({ member: member.name, success: true });
    } catch (err) {
      console.error(`Failed to delete for ${member.name}:`, err);
      results.push({ member: member.name, success: false });
    }
  }

  return NextResponse.json({ deleted: results });
}
