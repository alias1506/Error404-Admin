const express = require('express');
const router = express.Router();
const { getUsersHandler, updateUserHandler, deleteUserHandler, bulkDeleteUsersHandler } = require('../controllers/userController');

router.get('/', getUsersHandler);
router.post('/bulk-delete', bulkDeleteUsersHandler);
router.put('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);

module.exports = router;
