require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Judge = require('../models/Judge');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const Winner = require('../models/Winner');

const DAY = 1000 * 60 * 60 * 24;

const seed = async () => {
  await connectDB();
  console.log('MongoDB connected for seeding');

  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to clear collections in production. Aborting seed.');
    process.exit(1);
  }

  await Promise.all([
    Competition.deleteMany({}),
    Judge.deleteMany({}),
    User.deleteMany({}),
    Registration.deleteMany({}),
    Submission.deleteMany({}),
    Winner.deleteMany({}),
  ]);
  console.log('Cleared existing collections');

  const judge = await Judge.create({
    name: 'Dr. Ananya Rajan',
    photo: 'https://picsum.photos/seed/judge-ananya/400/400',
    bio: 'Renowned Bharatanatyam exponent and recipient of the State Award for Classical Arts, with over 25 years on stage across India and abroad.',
    experienceText: '25+ years performing and teaching classical dance; has judged 40+ national-level competitions.',
    introVideoUrl: 'https://example.com/videos/judge-ananya-intro.mp4',
  });

  const now = Date.now();

  const competition = await Competition.create({
    title: 'Classical Dance Championship',
    category: ['Dance', 'Classical'],
    prizePool: 1500,
    entryFee: 99,
    maxSpots: 20,
    spotsBooked: 1,
    judgeId: judge._id,
    registrationDeadline: new Date(now + 1 * DAY),
    submissionStart: new Date(now - 2 * DAY),
    submissionEnd: new Date(now + 10 * DAY),
    resultDate: new Date(now + 15 * DAY),
    aboutText:
      'Showcase your classical dance talent to a national audience. Open to all classical styles — Bharatanatyam, Kathak, Odissi, and more. Submit a solo performance video and get evaluated by an expert judging panel.',
    judgingParamsText:
      'Entries are scored on technique and precision (30%), expression / abhinaya (30%), rhythm and musicality (25%), and overall stage presence (15%).',
    rulesText:
      '1. Performance must be a solo act between 2-5 minutes long.\n2. Video must be recorded in landscape orientation with clear audio.\n3. Costumes should be appropriate to the classical style performed.\n4. One submission per participant; re-submissions before the deadline overwrite the previous entry.\n5. Decisions made by the judging panel are final.',
    rewards: [
      { position: 1, label: 'Winner', amount: 500 },
      { position: 2, label: '1st Runner Up', amount: 300 },
      { position: 3, label: '2nd Runner Up', amount: 200 },
      { position: 4, label: 'Best Newcomer', amount: 150 },
      { position: 5, label: "Judges' Choice", amount: 150 },
      { position: 6, label: "People's Choice", amount: 200 },
    ],
    referralBaseAmount: 10,
  });

  const users = await User.create([
    { name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '9000000001', referralCode: 'AARAV10' },
    { name: 'Diya Sharma', email: 'diya.sharma@example.com', phone: '9000000002', referralCode: 'DIYA10' },
    { name: 'Kabir Singh', email: 'kabir.singh@example.com', phone: '9000000003', referralCode: 'KABIR10' },
    { name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '9000000004', referralCode: 'MEERA10' },
  ]);

  // Keep this in sync with the competition's spotsBooked: 1 above, so the
  // seeded data is internally consistent for anyone poking at both collections.
  await Registration.create({
    competitionId: competition._id,
    userId: users[0]._id,
    paymentStatus: 'paid',
    amountPaid: competition.entryFee,
    registeredAt: new Date(now - 1 * DAY),
  });

  // "Previous Winners" — from an earlier edition of this competition, shown
  // as a trust signal regardless of the current edition's live status.
  await Winner.create([
    {
      competitionId: competition._id,
      userId: users[0]._id,
      position: 1,
      videoUrl: 'https://example.com/videos/winner-1.mp4',
    },
    {
      competitionId: competition._id,
      guestName: 'Priya Nair',
      guestPhoto: 'https://picsum.photos/seed/winner-2/200/200',
      position: 2,
      videoUrl: 'https://example.com/videos/winner-2.mp4',
    },
    {
      competitionId: competition._id,
      guestName: 'Rohan Das',
      guestPhoto: 'https://picsum.photos/seed/winner-3/200/200',
      position: 3,
      videoUrl: 'https://example.com/videos/winner-3.mp4',
    },
    {
      competitionId: competition._id,
      guestName: 'Sneha Reddy',
      guestPhoto: 'https://picsum.photos/seed/winner-4/200/200',
      position: 4,
      videoUrl: 'https://example.com/videos/winner-4.mp4',
    },
  ]);

  console.log('Seed complete');
  console.log('competitionId=' + competition._id);
  console.log('userId=' + users[0]._id);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
