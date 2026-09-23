# Manual Test Plan — Competition Details API

These are `curl` commands for exercising the API by hand against a local MongoDB.
No automated test suite yet — this is a walkthrough for manual verification.

## Prerequisite: MongoDB must be a replica set

`registerForCompetition` uses a Mongo session/transaction (`session.withTransaction`)
to make the spot-reservation + Registration-insert atomic. **Multi-document
transactions require MongoDB to be running as a replica set** (even a single-node
one) — a plain standalone `mongod` will throw `Transaction numbers are only
allowed on a replica set member or mongos` on every register attempt.

If your local MongoDB is standalone (the default for most local installs), convert
it to a single-node replica set once:

1. Add `replication.replSetName: rs0` to `mongod.cfg` (or start `mongod --replSet rs0`).
2. Restart MongoDB.
3. Run once via `mongosh`:
   ```js
   rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })
   ```
4. Update `MONGO_URI` in `.env` to include `?replicaSet=rs0` if needed.

(This was verified during development using a separate scratch `mongod` instance
on port 27018 configured as a single-node replica set, so as not to touch any
existing local MongoDB setup.)

## 1. Seed a competition

Run this once against your local DB (`mongosh` or a throwaway Node script) to get
a `Judge`, a `Competition` with `maxSpots: 1` (so the spots-full case is easy to
trigger), and two `User`s:

```js
// seed.js — run with: node seed.js
const mongoose = require('mongoose');
const Judge = require('./src/models/Judge');
const Competition = require('./src/models/Competition');
const User = require('./src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/feedants');

  const judge = await Judge.create({ name: 'Test Judge' });

  const now = Date.now();
  const competition = await Competition.create({
    title: 'Test Dance Competition',
    category: ['Dance'],
    prizePool: 10000,
    entryFee: 100,
    maxSpots: 1,
    judgeId: judge._id,
    registrationDeadline: new Date(now + 1000 * 60 * 60), // registration_open now
    submissionStart: new Date(now + 1000 * 60 * 60 * 2),
    submissionEnd: new Date(now + 1000 * 60 * 60 * 3),
    resultDate: new Date(now + 1000 * 60 * 60 * 4),
    referralBaseAmount: 10,
  });

  const userA = await User.create({ name: 'User A', email: 'a@test.com', referralCode: 'REFA' });
  const userB = await User.create({ name: 'User B', email: 'b@test.com', referralCode: 'REFB' });

  console.log('COMPETITION_ID=' + competition._id);
  console.log('USER_A_ID=' + userA._id);
  console.log('USER_B_ID=' + userB._id);
  process.exit(0);
})();
```

Export the printed IDs as shell variables for the commands below:

```bash
export COMP_ID=<paste competition id>
export USER_A=<paste user A id>
export USER_B=<paste user B id>
```

## 2. Happy path — fetch details, register, submit

```bash
# Fetch details as a guest (no userId)
curl -s http://localhost:5000/api/competitions/$COMP_ID

# Fetch details as User A — userState should be "not_registered", ctaState "can_register"
curl -s "http://localhost:5000/api/competitions/$COMP_ID?userId=$USER_A"

# Register User A — should succeed (201), spotsBooked goes 0 -> 1
curl -s -X POST http://localhost:5000/api/competitions/$COMP_ID/register \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_A\"}"

# (Move submissionStart/submissionEnd into the past/future window before testing
# submit — either re-seed with adjusted dates or patch the doc directly in mongosh.)

# Submit User A — should succeed (201) once liveStatus is "submission_open"
curl -s -X POST http://localhost:5000/api/competitions/$COMP_ID/submit \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_A\",\"fileUrl\":\"https://example.com/file.mp4\"}"

# Fetch winners (empty until a Winner doc exists)
curl -s http://localhost:5000/api/competitions/$COMP_ID/winners
```

## 3. Spots-full rejection

With `maxSpots: 1` and User A already registered:

```bash
# Register User B — should fail 409 "No spots left"
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:5000/api/competitions/$COMP_ID/register \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_B\"}"
```

## 4. Double-registration rejection

```bash
# Register User A again — should fail 409 "Already registered", NOT "No spots left"
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:5000/api/competitions/$COMP_ID/register \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_A\"}"

# Confirm spotsBooked did not get double-incremented by the failed attempt
curl -s http://localhost:5000/api/competitions/$COMP_ID
```

## 5. Referral credit

Register a fresh user with `referralCode` set to an existing user's code, then
confirm the referrer's `walletBalance` increased by `referralBaseAmount` and the
new Registration's `referredBy` points at the referrer.

```bash
curl -s -X POST http://localhost:5000/api/competitions/$COMP_ID/register \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_B\",\"referralCode\":\"REFA\"}"
```

## 6. Validation errors

```bash
# Invalid ObjectId -> 400 with field-level errors
curl -s -w "\nHTTP %{http_code}\n" http://localhost:5000/api/competitions/not-a-valid-id

# Missing required field -> 400
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:5000/api/competitions/$COMP_ID/register \
  -H "Content-Type: application/json" \
  -d "{}"
```

## Notes from manual verification during development

- All of the above were run end-to-end against a scratch single-node replica set
  and passed, including: happy-path register/submit, spots-full 409, double-
  registration 409, referral wallet credit, submit-before-window 403, submit-
  without-registration 403, duplicate-submit 409, and all 5 `liveStatus` values
  (`registration_open`, `registration_closed`, `submission_open`, `closed`,
  `results_declared`) with their corresponding `ctaState`.
- Found and fixed during testing: the duplicate-registration check now runs
  *before* the atomic spot-reservation `findOneAndUpdate`, so a user
  re-registering on an already-full competition correctly gets "Already
  registered" instead of being misreported as "No spots left".
