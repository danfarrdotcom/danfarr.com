import { google } from 'googleapis';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );
}

export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendeeEmail: string;
  }
) {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime },
      attendees: [{ email: event.attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  return {
    eventId: res.data.id!,
    meetLink: res.data.hangoutLink!,
  };
}

export async function getCalendarBusyTimes(
  accessToken: string,
  timeMin: string,
  timeMax: string,
  calendarIds: string[] = ['primary']
) {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: calendarIds.map((id) => ({ id })),
    },
  });

  const busy: { start?: string | null; end?: string | null }[] = [];
  for (const cal of Object.values(res.data.calendars ?? {})) {
    if (cal.busy) busy.push(...cal.busy);
  }
  return busy;
}

/** Get a valid access token for the admin, refreshing if needed. */
export async function getAdminAccessToken(): Promise<string | null> {
  const { supabaseAdmin } = await import('./supabase');

  const { data } = await supabaseAdmin
    .from('admin_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', 'admin')
    .single();

  if (!data) return null;

  // If not expired, use it
  if (data.expires_at && new Date(data.expires_at) > new Date()) {
    return data.access_token;
  }

  // Refresh
  if (!data.refresh_token) return null;

  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: data.refresh_token });

  try {
    const { credentials } = await client.refreshAccessToken();

    await supabaseAdmin.from('admin_tokens').upsert(
      {
        user_id: 'admin',
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token ?? data.refresh_token,
        expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date).toISOString()
          : null,
      },
      { onConflict: 'user_id' }
    );

    return credentials.access_token ?? null;
  } catch {
    return null;
  }
}
