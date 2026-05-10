const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const { protect } = require('../middlewares/auth.middleware')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/google', authController.googleLogin)
router.post('/refresh', authController.refreshToken)
router.post('/logout', protect, authController.logout)

module.exports = router
