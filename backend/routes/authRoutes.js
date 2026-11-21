const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  getUserProfile
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.get('/profile', protect, getUserProfile);
router.get('/admin-check', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

module.exports = router;
