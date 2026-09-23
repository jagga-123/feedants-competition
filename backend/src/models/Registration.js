const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    amountPaid: { type: Number },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    registeredAt: { type: Date },
  },
  { timestamps: true }
);

// Prevents the same user from registering twice for the same competition.
registrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
