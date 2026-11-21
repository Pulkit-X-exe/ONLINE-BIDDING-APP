const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCategorySales,
  getAllUsers,
  deleteUser,
  getAllBids
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorizeRoles('admin'), getDashboardStats);
router.get('/category-sales', protect, authorizeRoles('admin'), getCategorySales);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);
router.get('/bids', protect, authorizeRoles('admin'), getAllBids);

module.exports = router;
