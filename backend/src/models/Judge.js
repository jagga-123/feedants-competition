const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { type: String },
    bio: { type: String },
    experienceText: { type: String },
    introVideoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Judge', judgeSchema);
