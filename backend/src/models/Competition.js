const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: [String], default: [] },
    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },
    maxSpots: { type: Number, required: true },
    spotsBooked: { type: Number, default: 0 },
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Judge' },
    registrationDeadline: { type: Date },
    submissionStart: { type: Date },
    submissionEnd: { type: Date },
    resultDate: { type: Date },
    aboutText: { type: String },
    judgingParamsText: { type: String },
    rulesText: { type: String },
    rewards: { type: [rewardSchema], default: [] },
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'submission_open', 'closed', 'results_declared'],
      default: 'upcoming',
    },
    referralBaseAmount: { type: Number },
  },
  { timestamps: true }
);

competitionSchema.index({ status: 1, registrationDeadline: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
