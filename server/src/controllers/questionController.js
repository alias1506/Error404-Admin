const Question = require('../models/Question');
const beautify = require('js-beautify').js;

// @desc    Create a new question
// @route   POST /api/questions
// @access  Public
exports.createQuestion = async (req, res) => {
  try {
    const { title, difficulty, xpReward, roundId, codes, expectedOutput } = req.body;

    if (!title || !difficulty || !xpReward || !roundId || !codes || codes.length === 0 || !expectedOutput) {
      return res.status(400).json({ message: 'Please provide all required fields including expected output' });
    }

    // Auto-format code
    const formattedCodes = codes.map(c => {
      if (c.language !== 'python') {
        if (c.buggyCode) c.buggyCode = beautify(c.buggyCode, { indent_size: 4 });
        if (c.correctSolution) c.correctSolution = beautify(c.correctSolution, { indent_size: 4 });
      }
      return c;
    });

    const question = await Question.create({
      title,
      difficulty,
      xpReward,
      roundId,
      codes: formattedCodes,
      expectedOutput
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error creating question', error: error.message });
  }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('roundId', 'name').sort({ createdAt: 1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error fetching questions', error: error.message });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('roundId', 'name');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error fetching question', error: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Public
exports.updateQuestion = async (req, res) => {
  try {
    const { title, difficulty, xpReward, roundId, codes, expectedOutput } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (title) question.title = title;
    if (difficulty) question.difficulty = difficulty;
    if (xpReward) question.xpReward = xpReward;
    if (roundId) question.roundId = roundId;
    if (codes) {
      // Auto-format code
      question.codes = codes.map(c => {
        if (c.language !== 'python') {
          if (c.buggyCode) c.buggyCode = beautify(c.buggyCode, { indent_size: 4 });
          if (c.correctSolution) c.correctSolution = beautify(c.correctSolution, { indent_size: 4 });
        }
        return c;
      });
    }
    if (expectedOutput) question.expectedOutput = expectedOutput;

    await question.save();
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error updating question', error: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Public
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Question removed' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error deleting question', error: error.message });
  }
};

// @desc    Import multiple questions
// @route   POST /api/questions/import
// @access  Public
exports.importQuestions = async (req, res) => {
  try {
    const questions = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of questions' });
    }

    const questionsWithSlugs = questions.map((q, index) => {
      if (!q.slug && q.title) {
        q.slug = q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4) + '-' + index;
      }
      
      // Auto-format code during import
      if (q.codes && Array.isArray(q.codes)) {
        q.codes = q.codes.map(c => {
          if (c.language !== 'python') {
            if (c.buggyCode) c.buggyCode = beautify(c.buggyCode, { indent_size: 4 });
            if (c.correctSolution) c.correctSolution = beautify(c.correctSolution, { indent_size: 4 });
          }
          return c;
        });
      }
      return q;
    });

    const inserted = await Question.insertMany(questionsWithSlugs);
    res.status(201).json({ message: `Successfully imported ${inserted.length} questions`, insertedCount: inserted.length });
  } catch (error) {
    console.error('Error importing questions:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({ message: 'Server error importing questions', error: error.message });
  }
};

// @desc    Bulk delete questions
// @route   POST /api/questions/bulk-delete
// @access  Public
exports.bulkDeleteQuestions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid or missing ids array' });
    }

    const result = await Question.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: `${result.deletedCount} questions removed` });
  } catch (error) {
    console.error('Error bulk deleting questions:', error);
    res.status(500).json({ message: 'Server error bulk deleting questions', error: error.message });
  }
};
