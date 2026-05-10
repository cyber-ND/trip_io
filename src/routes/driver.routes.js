const express = require('express');
const router = express.Router();
const {
    registerDriver,
    loginDriver,
    logoutDriver,
    getDriverProfile
} = require('../controllers/driver.controller');

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.post('/logout', logoutDriver);
router.get('/:id', getDriverProfile);

module.exports = router;