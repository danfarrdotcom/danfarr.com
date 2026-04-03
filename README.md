This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## meet.danfarr.com

A Calendly-style scheduling app at `/meet`. Guests pick a meeting type, choose a date/time, and book — it creates a Google Meet link, adds it to Google Calendar, and sends a confirmation email with cancel/reschedule links.

### Setup (do once)

- [ ] Create Supabase project, run `docs/meet-schema.sql` in SQL editor
- [ ] Create Google Cloud project, enable Calendar API
- [ ] Create OAuth 2.0 credentials (web app), add redirect URI `http://localhost:3000/api/auth/callback/google`
- [ ] Sign up for [Resend](https://resend.com), verify `danfarr.com` domain, grab API key
- [ ] `cp .env.example .env.local` and fill in all values
- [ ] Run `openssl rand -base64 32` for `NEXTAUTH_SECRET`

### Local testing

- [ ] `pnpm dev`
- [ ] Sign in at `/api/auth/signin` with your Google account
- [ ] Go to `/meet/admin` — add availability rules (e.g. Mon–Fri 09:00–17:00)
- [ ] Create at least one slot type (e.g. "Quick Chat", 30min, slug: `quick-chat`)
- [ ] Add any extra Google Calendar IDs to sync in the Synced Calendars section
- [ ] Open `/meet` in an incognito window, book a test slot
- [ ] Verify: Google Calendar event created, Meet link works, confirmation email received
- [ ] Test cancel + reschedule links from the email

### Deploy

- [ ] Push to GitHub
- [ ] Add all env vars to Vercel (swap `NEXTAUTH_URL` to `https://meet.danfarr.com`)
- [ ] Add `meet.danfarr.com` as a domain in Vercel project settings
- [ ] Add CNAME record in DNS: `meet` → `cname.vercel-dns.com`
- [ ] Add prod redirect URI in Google Cloud Console: `https://meet.danfarr.com/api/auth/callback/google`
- [ ] Verify Resend domain is set up for `danfarr.com` (DNS records)
- [ ] Sign in again on prod at `https://meet.danfarr.com/api/auth/signin` to store tokens

### Post-launch polish

- [ ] Style the pages to match the site's look
- [ ] Add OG image / metadata for the `/meet` page
- [ ] Add a link to meet from the main homepage
- [ ] Set up Resend webhook or check dashboard to monitor email delivery
- [ ] Consider rate limiting on the `/api/meet/book` endpoint

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
