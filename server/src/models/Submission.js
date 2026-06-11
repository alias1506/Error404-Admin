const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  codeSubmitted: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded', 'Pending', 'Saved'],
    default: 'Pending'
  },
  type: {
    type: String,
    enum: ['Save', 'Submit'],
    default: 'Submit'
  },
  executionTime: {
    type: Number 
  },
  memoryUsage: {
    type: Number 
  },
  errorMessage: {
    type: String 
  }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
