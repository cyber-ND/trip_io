const express = require('express');
const router = express.Router();

const {
    registerDriver,
    getDriverProfile
} = require('../controllers/driver.controller');

router.post('/register', registerDriver);
router.get('/:id', getDriverProfile);

module.exports = router;