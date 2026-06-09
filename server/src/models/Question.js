const mongoose = require('mongoose');

const languageCodeSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
  },
  buggyCode: {
    type: String,
    required: true,
  },
  correctSolution: {
    type: String,
    required: true,
  }
}, { _id: false });

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a question title'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    xpReward: {
      type: Number,
      required: [true, 'Please provide XP reward'],
    },
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
      required: [true, 'Please provide a round'],
    },
    codes: {
      type: [languageCodeSchema],
      validate: [v => v.length > 0, 'Please provide at least one language code'],
    },
    slug: {
      type: String,
      unique: true,
    }
  },
  {
    timestamps: true,
  }
);

questionSchema.pre('save', async function() {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }
});

module.exports = mongoose.model('Question', questionSchema);
