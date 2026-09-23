const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    // userId is optional so a winner can be recorded as a guest via guestName/guestPhoto instead.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String },
    guestPhoto: { type: String },
    position: { type: Number, required: true },
    videoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winner', winnerSchema);
