const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const Winner = require('../models/Winner');
const User = require('../models/User');
// Required so Mongoose registers the "Judge" model referenced by Competition's
// judgeId — otherwise .populate('judgeId') throws "Schema hasn't been registered".
require('../models/Judge');
const { computeStatus, isRegistrationOpen } = require('../utils/competitionStatus');

/**
 * Combines the live competition status with the requesting user's state into
 * a single value the frontend can switch on directly to render its CTA.
 */
function deriveCtaState(liveStatus, userState) {
  if (liveStatus === 'registration_open') {
    if (userState === 'registered' || userState === 'submitted') {
      return 'already_registered';
    }
    return 'can_register';
  }

  if (liveStatus === 'registration_closed') {
    return 'registration_closed';
  }

  if (liveStatus === 'submission_open') {
    if (userState === 'submitted') return 'already_submitted';
    if (userState === 'registered') return 'can_submit';
    return 'registration_closed';
  }

  if (liveStatus === 'closed') {
    return 'awaiting_results';
  }

  return 'view_results';
}

// GET /api/competitions/:id?userId=xxx
const getCompetitionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const competition = await Competition.findById(id).populate('judgeId').lean();
  if (!competition) {
    res.status(404);
    throw new Error('Competition not found');
  }

  // Populated so a non-guest winner (userId set, no guestName) still has a
  // displayable name — otherwise the response would carry only a raw ObjectId.
  const winners = await Winner.find({ competitionId: id }).sort({ position: 1 }).populate('userId', 'name').lean();

  const liveStatus = computeStatus(competition);
  const spotsLeft = Math.max(competition.maxSpots - competition.spotsBooked, 0);

  let userState = null;
  if (userId) {
    const [registration, submission] = await Promise.all([
      Registration.findOne({ competitionId: id, userId }).lean(),
      Submission.findOne({ competitionId: id, userId }).lean(),
    ]);

    if (submission) userState = 'submitted';
    else if (registration) userState = 'registered';
    else userState = 'not_registered';
  }

  const ctaState = deriveCtaState(liveStatus, userState);

  res.status(200).json({
    success: true,
    data: {
      id: competition._id,
      title: competition.title,
      category: competition.category,
      prizePool: competition.prizePool,
      entryFee: competition.entryFee,
      maxSpots: competition.maxSpots,
      spotsBooked: competition.spotsBooked,
      spotsLeft,
      judge: competition.judgeId || null,
      registrationDeadline: competition.registrationDeadline,
      submissionStart: competition.submissionStart,
      submissionEnd: competition.submissionEnd,
      resultDate: competition.resultDate,
      aboutText: competition.aboutText,
      judgingParamsText: competition.judgingParamsText,
      rulesText: competition.rulesText,
      rewards: competition.rewards,
      referralBaseAmount: competition.referralBaseAmount,
      liveStatus,
      userState,
      ctaState,
      winners,
    },
  });
});

// POST /api/competitions/:id/register  body: { userId, referralCode? }
const registerForCompetition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, referralCode } = req.body;

  const competition = await Competition.findById(id).lean();
  if (!competition) {
    res.status(404);
    throw new Error('Competition not found');
  }

  const liveStatus = computeStatus(competition);
  // Checked against registrationDeadline directly rather than liveStatus: when
  // submissions open early, liveStatus is 'submission_open' while registration
  // is still legitimately open.
  const registrationOpen = isRegistrationOpen(competition);
  if (!registrationOpen) {
    res.status(403);
    throw new Error(`Registration is not open for this competition (current status: ${liveStatus})`);
  }

  const session = await mongoose.startSession();
  let registration;

  try {
    // withTransaction commits only if the callback resolves; any throw
    // (spots-full or a duplicate-registration E11000) aborts the whole
    // transaction, which automatically reverts the $inc on spotsBooked.
    await session.withTransaction(async () => {
      // Checked first so a user re-registering on an already-full competition
      // gets "Already registered" rather than being turned away as "No spots
      // left" — the E11000 catch below remains the source of truth under a race.
      const existingRegistration = await Registration.findOne({ competitionId: id, userId }).session(session);
      if (existingRegistration) {
        const err = new Error('Already registered');
        err.statusCode = 409;
        throw err;
      }

      const updatedCompetition = await Competition.findOneAndUpdate(
        { _id: id, spotsBooked: { $lt: competition.maxSpots } },
        { $inc: { spotsBooked: 1 } },
        { returnDocument: 'after', session }
      );

      if (!updatedCompetition) {
        const err = new Error('No spots left');
        err.statusCode = 409;
        throw err;
      }

      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode }).session(session);
        if (referrer && String(referrer._id) !== String(userId)) {
          referrer.walletBalance += updatedCompetition.referralBaseAmount || 0;
          await referrer.save({ session });
          referredBy = referrer._id;
        }
      }

      const [createdRegistration] = await Registration.create(
        [
          {
            competitionId: id,
            userId,
            referredBy,
            registeredAt: new Date(),
          },
        ],
        { session }
      );

      registration = createdRegistration;
    });
  } catch (error) {
    if (error.statusCode === 409) {
      res.status(409);
      throw new Error(error.message);
    }
    if (error.code === 11000) {
      res.status(409);
      throw new Error('Already registered');
    }
    throw error;
  } finally {
    await session.endSession();
  }

  res.status(201).json({
    success: true,
    data: {
      registrationId: registration._id,
      userState: 'registered',
      ctaState: deriveCtaState(liveStatus, 'registered'),
    },
  });
});

// POST /api/competitions/:id/submit  body: { userId, fileUrl }
const submitForCompetition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, fileUrl } = req.body;

  const competition = await Competition.findById(id).lean();
  if (!competition) {
    res.status(404);
    throw new Error('Competition not found');
  }

  const registration = await Registration.findOne({ competitionId: id, userId });
  if (!registration) {
    res.status(403);
    throw new Error('You must be registered for this competition to submit');
  }

  const liveStatus = computeStatus(competition);
  if (liveStatus !== 'submission_open') {
    res.status(403);
    throw new Error(`Submissions are not open for this competition (current status: ${liveStatus})`);
  }

  let submission;
  try {
    submission = await Submission.create({
      competitionId: id,
      userId,
      fileUrl,
      submittedAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      throw new Error('Already submitted');
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    data: {
      submissionId: submission._id,
      userState: 'submitted',
      ctaState: deriveCtaState(liveStatus, 'submitted'),
    },
  });
});

// GET /api/competitions/:id/winners
const getWinners = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const winners = await Winner.find({ competitionId: id }).sort({ position: 1 }).populate('userId', 'name').lean();

  res.status(200).json({
    success: true,
    data: winners,
  });
});

module.exports = {
  getCompetitionDetails,
  registerForCompetition,
  submitForCompetition,
  getWinners,
};
