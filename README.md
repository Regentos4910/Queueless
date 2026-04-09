# QueueLess

QueueLess is a Vercel-friendly smart queue management MVP built with Next.js App Router and Firebase Firestore.

## Features

- Facility search and remote queue joining
- Smart token allocation using queue length, service-time median, and travel ETA
- Realtime token tracking with Firestore listeners
- Admin dashboard with queue controls, service-time override, token rearrangement, and analytics graphs
- Geofence-based arrival updates

## Environment Variables

Add these values in `.env.local` and in your Vercel project settings:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GOOGLE_MAPS_API_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

## Development

```bash
npm install
npm run dev
```

## Firebase Collections

- `facilities`
- `tokens`
- `serviceLogs`

The app expects facility documents with `name`, `location`, `medianServiceTime`, and `adminOverrideTime`.

## Admin Access

The admin dashboard is protected by a simple cookie-based login intended for a hackathon MVP. Set `ADMIN_USERNAME` and
`ADMIN_PASSWORD` in your environment before using `/admin`.
