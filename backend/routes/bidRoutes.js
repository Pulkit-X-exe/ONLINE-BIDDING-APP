const express = require('express');
const router = express.Router();
const {
  placeBid,
  getAuctionBids,
  getMyBids,
  getMyWonAuctions
} = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, placeBid);
router.get('/auction/:auctionId', getAuctionBids);
router.get('/my-bids', protect, getMyBids);
router.get('/my-won-auctions', protect, getMyWonAuctions);

module.exports = router;
