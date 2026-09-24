# Feedants Fullstack Assignment

## Overview

A full-stack "Competition Details" feature for a competitions app: a Node/Express/MongoDB backend
exposing a single competition's details, registration, submission, and winners, paired with a React
Native (Expo) screen that renders that data and drives registration/submission entirely off a
server-computed `ctaState`. The backend derives a competition's live status from its date fields on
every read (rather than trusting a stored, potentially-stale `status` field), and uses an atomic,
transactional spot-reservation so concurrent registrations can never overbook a competition or silently
lose a referral credit.

## Tech Stack

**Backend** — Node.js, Express 5, Mongoose 9 (MongoDB), dotenv, cors, express-async-handler,
express-validator, morgan (dev logging), nodemon (dev).

**Frontend** — Expo (React Native, SDK 57) with TypeScript, React Navigation (native + native-stack),
axios, expo-document-picker, date-fns, react-native-screens, react-native-safe-area-context,
@react-native-async-storage/async-storage.

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB, **configured as a replica set** (even a single-node one) — see below for why and how
- Expo Go app on a physical device, or a web browser (Android/iOS emulators are optional — see
  "Running the frontend")

### Why MongoDB needs to be a replica set

Registering for a competition atomically reserves a spot and inserts the Registration document inside a
single Mongo transaction (`session.withTransaction`), so a spots-full race and a duplicate-registration
race both resolve safely without manual locking. **Multi-document transactions require MongoDB to be
running as a replica set** — a plain standalone `mongod` (the default for most local installs) will
throw `Transaction numbers are only allowed on a replica set member or mongos` on every register attempt.

If your local MongoDB is standalone, convert it to a single-node replica set once:

1. Add `replication.replSetName: rs0` to your `mongod.cfg` (or start `mongod --replSet rs0` directly).
2. Restart MongoDB.
3. Run once via `mongosh`:
   ```js
   rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })
   ```
4. If your `MONGO_URI` doesn't already resolve to that host/port, add `?replicaSet=rs0` to it.

**Using MongoDB Atlas instead of local MongoDB?** Atlas clusters (including the free M0 tier) are already
replica sets — none of the above is needed, just use your Atlas connection string as `MONGO_URI` directly.

> **Troubleshooting `querySrv ECONNREFUSED` with an Atlas `mongodb+srv://` URI:** on some Windows/network
> setups, Node's DNS resolver fails the SRV lookup a `+srv` connection string needs, even though the OS's
> own resolver handles it fine. `backend/src/config/db.js` already works around this automatically by
> falling back to public DNS servers for `+srv` URIs specifically — you shouldn't need to do anything, but
> if you still see this error, it means even the fallback resolvers are blocked on your network; ask your
> network admin, or get Atlas's "Standard connection string" (non-SRV, lists hosts directly) instead.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

| Var | Purpose | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | Mongo connection string (must point at a replica set — see above) | `mongodb://localhost:27017/feedants` |
| `NODE_ENV` | Environment | `development` |

Seed the database (creates one Judge, one Competition, four Users, and four Winners — see "Seeding"
below), then start the server:

```bash
npm run seed
npm run dev      # or: npm start
```

`npm run seed` prints a `competitionId` and a `userId` to the console — **copy both**, you'll need them
for the frontend in the next step.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

| Var | Purpose | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL the app calls the backend at | `http://127.0.0.1:5000/api` |

Only `EXPO_PUBLIC_`-prefixed vars are inlined into the client bundle by Expo — a plain `API_URL` would
silently never reach the app. They're also inlined **at bundle time**, not read live — if you change
`.env` while `expo start` is already running, restart it (Ctrl+C, then `npm run start` again); a browser
refresh alone won't pick up the new value.

> **Android emulator note:** the emulator can't reach the host machine via `localhost` — use
> `http://10.0.2.2:5000/api` instead. A physical device on the same network needs the host machine's LAN
> IP. iOS simulator can use `localhost`.

> **Troubleshooting: web app stuck on a loading spinner forever, even though the backend is confirmed
> running.** On some Windows setups, `localhost` resolves to the IPv6 loopback (`::1`) first in the
> browser, and connections to `::1` hang indefinitely against this backend (while `127.0.0.1` works
> instantly) — likely a local firewall/network quirk, not an app bug. Use `127.0.0.1` instead of
> `localhost` in `EXPO_PUBLIC_API_URL` (as above) to sidestep it entirely.

Open `frontend/src/screens/CompetitionDetailsScreen.tsx` and update the two hardcoded constants near the
top to the IDs `npm run seed` printed:

```ts
const COMPETITION_ID = '<paste competitionId here>';
const USER_ID = '<paste userId here>';
```

(These stand in for real navigation params / auth in this phase — see "Assumptions" below. Every time
you re-run `npm run seed`, new IDs are generated and this file needs updating again.)

Start the app:

```bash
npm run start     # then press "w" for web, or scan the QR code with Expo Go
# or directly:
npm run web
npm run android   # requires Android Studio/emulator
npm run ios       # requires Xcode, macOS only
```

### Seeding the database

From `backend/`:

```bash
npm run seed
```

This clears the Competition/Judge/User/Registration/Submission/Winner collections (refuses to run if
`NODE_ENV=production`) and creates one competition ("Classical Dance Championship") with realistic dates,
a judge, four users, and four winners. Re-run it any time to reset to a clean demo state — remember to
update the frontend's hardcoded IDs afterward.

## API Endpoints

All routes are mounted under `/api/competitions`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/:id?userId=` | Fetch a competition's full details: live status, spots left, judge, dates, rewards, winners, and (if `userId` given) that user's `userState`/`ctaState` |
| POST | `/:id/register` | Register a user for the competition (atomic spot reservation, optional referral credit) |
| POST | `/:id/submit` | Submit an entry for a registered user, during the submission window |
| GET | `/:id/winners` | Fetch winners for the competition, sorted by position |

## Assumptions

- **No authentication.** `userId` is passed directly in the request body/query rather than derived from
  a JWT/session, per the assignment brief's stated scope.
- **One registration and one submission per user per competition** — enforced with unique compound
  indexes, not just application logic.
- **Referral credit happens at registration, not at referral-link click.** The referring user's wallet is
  credited only once the referred user successfully completes registration, in the same transaction —
  there's no separate "click tracking" step.
- **File "upload" uses the picked file's local device URI as `fileUrl`**, not a real upload to cloud
  storage. No S3/Cloudinary integration is configured (out of scope per the brief) — this is a known
  limitation, not a bug. See "What I'd improve for production" below.
- **`entryFee` is not actually charged.** There's no payment gateway; `amountPaid` on a Registration is
  just a stored number.

## Major Technical Decisions

- **Atomic spot reservation via `findOneAndUpdate`.** Registering does
  `Competition.findOneAndUpdate({ _id, spotsBooked: { $lt: maxSpots } }, { $inc: { spotsBooked: 1 } })`
  inside a transaction with the `Registration` insert — a `null` result means spots are full, and any
  failure (including a duplicate-registration unique-index violation) aborts the whole transaction,
  which automatically reverts the increment. No manual locking, no read-then-write race window.
- **Live status computed on every read, not trusted from a stored field.** `computeStatus()` derives
  `registration_open` / `registration_closed` / `submission_open` / `closed` / `results_declared` fresh
  from the competition's four date fields on each request. The stored `status` enum on the `Competition`
  model exists only as a cron-updatable fallback for things like sorting/filtering lists — it's never
  read on this details endpoint. The submission window is evaluated first and independently of the
  registration deadline, because `submissionStart` may fall *before* `registrationDeadline` (as in the
  seeded data and the design reference): during that overlap `liveStatus` is `submission_open`, while
  registration stays open too — `isRegistrationOpen()` tracks that separately, so an unregistered user
  still gets `can_register` and `POST /register` keeps working until the deadline.
- **Denormalized `spotsBooked` counter** on the `Competition` document, rather than
  `Registration.countDocuments()` on every read — O(1) reads on a hot endpoint, with correctness
  guaranteed at write time by the atomic update above rather than by recomputing on read.
- **`ctaState` as the frontend's single source of truth.** The backend combines `liveStatus` and the
  requesting user's `userState` into one `ctaState` value (`can_register`, `already_registered`,
  `registration_closed`, `can_submit`, `already_submitted`, `awaiting_results`, `view_results`). The
  frontend's `BottomCTAButton` is a pure switch over that one value — no business rules are duplicated
  client-side about when registration/submission is allowed.

## Trade-offs Considered

- **Transactions vs. standalone-Mongo simplicity.** Requiring a replica set adds real local setup
  friction (documented above) compared to a plain standalone `mongod`. Chosen anyway because silent
  overbooking or a lost referral credit under concurrent requests is a worse failure mode than asking a
  developer to run one extra `rs.initiate()` command.
- **Real-time status computation vs. cron-based caching.** Computing `liveStatus` on every request avoids
  any staleness window and needs no cron infrastructure, at the cost of a handful of `Date` comparisons
  per request — negligible at this project's scale, but would need revisiting (see below) at high read
  volume.
- **Expo vs. bare React Native CLI.** The assignment brief asked for bare RN CLI by default. Switched to
  Expo (confirmed with the project owner) because bare CLI's native Android/iOS builds need a full local
  toolchain (Android Studio/JDK, or Xcode on macOS) that isn't guaranteed to be present, while Expo's
  managed workflow runs immediately via Expo Go or a browser with zero native toolchain setup. The
  trade-off is less low-level native-module control, which this assignment's scope doesn't need.

## What I'd Improve for Production

- **Real file storage/CDN** (S3 with presigned uploads, or Cloudinary) instead of a local device URI
  standing in for `fileUrl`.
- **Authentication (JWT)** instead of a client-supplied `userId` — the current API will act on behalf of
  whatever `userId` it's given.
- **A Redis caching layer** in front of the read-heavy `GET /competitions/:id` endpoint, since it's the
  one every screen load hits and its data changes far less often than it's read.
- **Real payment gateway integration** (e.g. Razorpay/Stripe) instead of a mocked `entryFee`/`amountPaid`.
- **Rate-limiting** (e.g. `express-rate-limit`) on the register endpoint to blunt abuse/spam registration
  attempts.
- **An automated test suite** — unit tests for `computeStatus`/`ctaState` derivation and integration tests
  exercising the register/submit race conditions — in place of the manual curl-based test plan in
  `backend/TESTING.md`.
