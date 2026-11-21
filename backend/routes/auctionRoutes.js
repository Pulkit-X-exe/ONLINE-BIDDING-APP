const express = require('express');
const router = express.Router();
const {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  getMyAuctions
} = require('../controllers/auctionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAuctions);
router.get('/my-auctions', protect, authorizeRoles('seller', 'admin'), getMyAuctions);
router.get('/:id', getAuctionById);
router.post('/', protect, authorizeRoles('seller', 'admin'), createAuction);
router.put('/:id', protect, authorizeRoles('seller', 'admin'), updateAuction);
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), deleteAuction);

module.exports = router;
