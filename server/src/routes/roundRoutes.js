const express = require('express');
const {
  getRounds,
  createRound,
  updateRound,
  deleteRound,
  bulkDeleteRounds
} = require('../controllers/roundController');

const router = express.Router();

router.route('/')
  .get(getRounds)
  .post(createRound);

router.post('/bulk-delete', bulkDeleteRounds);

router.route('/:id')
  .put(updateRound)
  .delete(deleteRound);

module.exports = router;
