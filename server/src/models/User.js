const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  solvedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  attemptedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  startedRounds: [{
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round'
    },
    startTime: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
