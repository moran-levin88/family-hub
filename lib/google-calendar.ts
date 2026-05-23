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
  event: { title: string; date: string; time: string }
): Promise<GoogleTokens> {
  const client = getOAuthClient();
  client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: client });

  const startDateTime = new Date(`${event.date}T${event.time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Jerusalem" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Jerusalem" },
    },
  });

  return client.credentials as GoogleTokens;
}
