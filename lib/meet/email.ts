import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Dan Farr <meet@danfarr.com>';

type BookingDetails = {
  bookingId: string;
  cancelToken?: string;
  guestName: string;
  guestEmail: string;
  title: string;
  startsAt: string;
  endsAt: string;
  meetLink?: string | null;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  });
}

export async function sendConfirmation(b: BookingDetails) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://meet.danfarr.com';
  const qs = `id=${b.bookingId}&token=${b.cancelToken || ''}`;
  const cancelUrl = `${baseUrl}/meet/manage?${qs}&action=cancel`;
  const rescheduleUrl = `${baseUrl}/meet/manage?${qs}&action=reschedule`;

  await resend.emails.send({
    from: FROM,
    to: b.guestEmail,
    subject: `Confirmed: ${b.title} with Dan`,
    html: `
      <h2>You're booked!</h2>
      <p><strong>${b.title}</strong></p>
      <p>${formatTime(b.startsAt)} – ${formatTime(b.endsAt)}</p>
      ${b.meetLink ? `<p><a href="${b.meetLink}">Join Google Meet</a></p>` : ''}
      <hr/>
      <p>
        <a href="${rescheduleUrl}">Reschedule</a> · 
        <a href="${cancelUrl}">Cancel</a>
      </p>
    `,
  });
}

export async function sendCancellation(b: BookingDetails) {
  await resend.emails.send({
    from: FROM,
    to: b.guestEmail,
    subject: `Cancelled: ${b.title} with Dan`,
    html: `
      <h2>Meeting cancelled</h2>
      <p>Your <strong>${b.title}</strong> on ${formatTime(b.startsAt)} has been cancelled.</p>
    `,
  });
}
