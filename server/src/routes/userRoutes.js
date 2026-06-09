const express = require('express');
const router = express.Router();
const { getUsersHandler, updateUserHandler, deleteUserHandler } = require('../controllers/userController');

router.get('/', getUsersHandler);
router.put('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);

module.exports = router;
