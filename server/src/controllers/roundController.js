const Round = require('../models/Round');

// @desc    Get all rounds
// @route   GET /api/rounds
// @access  Public (or Admin, depending on auth rules)
exports.getRounds = async (req, res, next) => {
  try {
    const rounds = await Round.find({}).sort({ createdAt: 1 });
    res.status(200).json(rounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a round
// @route   POST /api/rounds
// @access  Public (or Admin)
exports.createRound = async (req, res, next) => {
  try {
    const { name, duration, status } = req.body;
    
    if (!name || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const round = await Round.create({
      name,
      duration,
      status: status || 'Upcoming'
    });

    res.status(201).json(round);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a round
// @route   PUT /api/rounds/:id
// @access  Public (or Admin)
exports.updateRound = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, status } = req.body;

    const round = await Round.findById(id);

    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    round.name = name || round.name;
    round.duration = duration || round.duration;
    round.status = status || round.status;

    const updatedRound = await round.save();
    
    res.status(200).json(updatedRound);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a round
// @route   DELETE /api/rounds/:id
// @access  Public (or Admin)
exports.deleteRound = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findById(id);
    
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    await round.deleteOne();
    
    res.status(200).json({ message: 'Round removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
