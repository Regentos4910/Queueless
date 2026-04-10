# QueueLess

QueueLess is a smart queue orchestration platform built for real-world high-footfall spaces like hospitals, banks, service centers, government offices, and campus facilities.

Instead of forcing people to stand in a physical line with no visibility, QueueLess lets users join remotely, predicts when they should arrive, and gives admins live control over service flow.

This is not just a digital token system.
It is a dynamic queue engine that combines live queue pressure, rolling median service time, travel ETA, geolocation, and admin intervention to reduce crowding while keeping the system fair.

## Why QueueLess Matters

Traditional queues break in the same ways everywhere:

- people waste time standing in line
- crowding builds up near service counters
- users do not know when their turn will come
- one slow customer distorts expected waiting time
- no-shows stall the whole queue
- staff have little control beyond calling the next number

QueueLess solves this by turning a passive queue into an adaptive system.

## What Makes It Special

- Smart token allocation:
  users are not assigned purely on first click; QueueLess considers queue length, service time, and travel ETA before assigning their token.
- Median-based prediction:
  the system uses rolling median service time instead of average so outliers do not destroy ETA quality.
- Location-aware fairness:
  users must share location before joining, and arrival can be verified through geofence logic.
- Admin-first operations:
  staff can override service pace, reorder tokens, skip no-shows, and keep the queue moving.
- Live analytics:
  admins see service-time trends, queue completion estimates, and throughput directly in the dashboard.

## Core Experience

### User Flow

1. Search for a facility by name.
2. Choose a live queue.
3. Allow location access.
4. Request a smart token.
5. View token number, people ahead, ETA, and estimated call time in real time.

### Admin Flow

1. Open the admin login page.
2. Log in to the protected dashboard.
3. Create a facility using Google Maps-powered place lookup.
4. Monitor queue status, waiting users, and service metrics.
5. Call next, complete service, rearrange tokens, or mark a no-show.

## Demo-Worthy Features

- Facility search with live queue visibility
- Remote queue joining with ETA-aware token assignment
- Protected admin dashboard
- Google Maps place search for fast facility setup
- Firestore-powered realtime token updates
- Queue analytics dashboard with charts
- Service-time override for admins
- No-show and token bump handling
- Geolocation-based arrival status
- Favicon and polished hackathon-ready branding

## Smart Queue Engine

QueueLess uses a practical and judge-friendly decision model:

```text
expectedWait = waitingUsers × effectiveServiceTime

effectiveServiceTime =
  adminOverrideTime OR rollingMedian(last20ServiceTimes)

if userTravelTime < expectedWait:
  assign next token
else:
  delay token based on travel ETA
```

This ensures:

- users do not arrive too early
- queues do not become physical crowds
- admins still retain manual control when conditions change

## Admin Intelligence

The dashboard gives staff more than a queue list.

It shows:

- now serving
- people left in queue
- estimated queue completion time
- median service time
- users served today
- queue length over time
- service time per user
- throughput by hour

This makes the system feel less like a demo and more like a real operational tool.

## Tech Stack

### Frontend

- Next.js App Router
- React
- Tailwind CSS
- Chart.js

### Backend

- Next.js serverless API routes
- Firebase Firestore
- Firebase Admin SDK

### External Services

- Google Maps Places API
- Google Distance Matrix API

### Deployment

- Vercel

## Project Structure

```text
src/app
  admin/                 protected admin pages
  api/                   serverless backend routes
  queue/[facilityId]/    user join flow
  token/[tokenId]/       realtime token tracking
  search/                facility discovery

src/lib
  queueEngine.ts         smart token allocation logic
  medianService.ts       rolling median wait logic
  analyticsEngine.ts     dashboard stats generation
  geolocation.ts         distance and ETA helpers
  firebase/              client/admin Firebase setup

src/components
  dashboard cards, charts, queue table, token UI
```

## API Surface

QueueLess exposes a compact but powerful serverless backend:

- `POST /api/joinQueue`
- `POST /api/callNext`
- `POST /api/completeToken`
- `POST /api/rearrangeToken`
- `POST /api/overrideServiceTime`
- `POST /api/updateArrival`
- `POST /api/updateTokenStatus`
- `GET /api/analytics`
- `GET /api/facilities`
- `POST /api/facilities`
- `GET /api/places/search`
- `POST /api/admin/login`
- `POST /api/admin/logout`

## Environment Variables

Add these in local development and in Vercel:

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

## Run Locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`

## Firebase Collections

### `facilities`

- `name`
- `location`
- `medianServiceTime`
- `adminOverrideTime`
- `createdAt`

### `tokens`

- `facilityId`
- `tokenNumber`
- `userName`
- `phone`
- `status`
- `arrivalStatus`
- `userLocation`
- `eta`
- `callTime`
- `completionTime`
- `serviceTime`

### `serviceLogs`

- `facilityId`
- `tokenId`
- `serviceTime`
- `timestamp`

## Security Notes

- Admin routes are protected behind login.
- Firebase frontend config is public by design.
- Firebase Admin credentials must never be committed publicly.
- Local `.env.local` should stay ignored by Git.

## Team

Built by:

- Viraj Makwana
- Shashank Mishra

## Pitch Line

QueueLess turns waiting into timing.
It replaces physical crowding with intelligent arrivals, real-time visibility, and admin-controlled service flow.
