const express = require('express');
const {
    register,
    login,
    logout,
    getMe
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Routes for register, login, and logout
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);  // Change GET to POST for logout
router.get('/me', protect, getMe);

module.exports = router;
