const router = require('express').Router()
const userController = require('../controllers/user.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')

router.get('/me', protect, userController.getProfile)
router.patch('/me', protect, userController.updateProfile)
router.get('/', protect, allowRoles('admin'), userController.getAllUsers)
router.get('/:id', protect, allowRoles('admin'), userController.getUserById)
router.patch('/:id/deactivate', protect, allowRoles('admin'), userController.deactivateUser)

module.exports = router
