import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addEventToCalendar } from "@/lib/google-calendar";
import type { Member } from "@/types";

export async function POST(request: NextRequest) {
  const { title, date, time, assignedTo } = await request.json();
  const filterByMembers: string[] | null = assignedTo?.length > 0 ? assignedTo : null;

  const membersSnap = await getDocs(collection(db, "members"));
  const results: { member: string; success: boolean }[] = [];

  for (const memberDoc of membersSnap.docs) {
    const member = { id: memberDoc.id, ...memberDoc.data() } as Member;
    if (!member.googleTokens?.access_token) continue;
    if (filterByMembers && !filterByMembers.includes(member.id)) continue;

    try {
      const updatedTokens = await addEventToCalendar(member.googleTokens, { title, date, time });
      if (updatedTokens.access_token !== member.googleTokens.access_token) {
        await setDoc(
          doc(db, "members", member.id),
          { googleTokens: updatedTokens },
          { merge: true }
        );
      }
      results.push({ member: member.name, success: true });
    } catch (err) {
      console.error(`Failed to sync for ${member.name}:`, err);
      results.push({ member: member.name, success: false });
    }
  }

  return NextResponse.json({ synced: results });
}
