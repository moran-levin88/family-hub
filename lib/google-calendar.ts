import { google } from "googleapis";
import type { GoogleTokens } from "@/types";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );
}

export function getAuthUrl(memberId: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: memberId,
    prompt: "consent",
  });
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens as GoogleTokens;
}

export async function addEventToCalendar(
  tokens: GoogleTokens,
  event: { title: string; date: string; time: string; endTime?: string }
): Promise<{ updatedTokens: GoogleTokens; eventId: string }> {
  const client = getOAuthClient();
  client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: client });

  const startDateTimeStr = `${event.date}T${event.time}:00`;
  const resolvedEndTime = event.endTime ?? (() => {
    const [h, m] = event.time.split(":").map(Number);
    return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();
  const endDateTimeStr = `${event.date}T${resolvedEndTime}:00`;

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      start: { dateTime: startDateTimeStr, timeZone: "Asia/Jerusalem" },
      end: { dateTime: endDateTimeStr, timeZone: "Asia/Jerusalem" },
    },
  });

  return { updatedTokens: client.credentials as GoogleTokens, eventId: response.data.id ?? "" };
}

export async function deleteEventFromCalendar(
  tokens: GoogleTokens,
  eventId: string
): Promise<GoogleTokens> {
  const client = getOAuthClient();
  client.setCredentials(tokens);
  const calendar = google.calendar({ version: "v3", auth: client });
  await calendar.events.delete({ calendarId: "primary", eventId });
  return client.credentials as GoogleTokens;
}
