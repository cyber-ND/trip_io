const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
} = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;