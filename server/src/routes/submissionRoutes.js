const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// @desc    Get all unique user submissions
// @route   GET /api/submissions
// @access  Private/Admin
router.get('/', async (req, res, next) => {
  try {
    const pipeline = [
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          latestSubmissionId: { $first: "$_id" },
          latestDate: { $first: "$createdAt" },
          totalSaves: { 
            $sum: { $cond: [ { $eq: ["$type", "Save"] }, 1, 0 ] }
          },
          totalSubmits: {
            $sum: { $cond: [ { $eq: ["$type", "Submit"] }, 1, 0 ] }
          }
        }
      },
      { $sort: { latestDate: -1 } }
    ];

    const grouped = await Submission.aggregate(pipeline);
    const paginatedIds = grouped.map(g => g.latestSubmissionId);

    const submissions = await Submission.find({ _id: { $in: paginatedIds } })
      .populate('user', 'username email')
      .populate('question', 'title')
      .sort({ createdAt: -1 });

    const resultData = submissions.map(sub => {
      const groupData = grouped.find(g => g.latestSubmissionId.toString() === sub._id.toString());
      return {
        ...sub.toObject(),
        totalSaves: groupData ? groupData.totalSaves : 0,
        totalSubmits: groupData ? groupData.totalSubmits : 0
      };
    });

    res.json({
      success: true,
      count: resultData.length,
      data: resultData
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all submissions by a specific user
// @route   GET /api/submissions/user/:userId
// @access  Private/Admin
router.get('/user/:userId', async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.params.userId })
      .populate('question', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk delete submissions
// @route   POST /api/submissions/bulk-delete
// @access  Private/Admin
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid or missing ids array' });
    }
    const result = await Submission.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${result.deletedCount} submissions deleted` });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
router.delete('/:id', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    await submission.deleteOne();
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
