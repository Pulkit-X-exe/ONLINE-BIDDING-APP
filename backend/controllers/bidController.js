const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const placeBid = async (req, res, next) => {
  try {
    const { auctionId, amount } = req.body;

    if (!auctionId || !amount) {
      res.status(400);
      throw new Error('Please provide auction ID and bid amount');
    }

    const bidAmount = Number(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      res.status(400);
      throw new Error('Bid amount must be a positive number');
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    if (auction.seller.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Sellers cannot bid on their own auctions');
    }

    if (new Date(auction.endTime) <= new Date() || auction.status === 'Ended') {
      auction.status = 'Ended';
      await auction.save();
      res.status(400);
      throw new Error('Auction has already ended');
    }

    if (bidAmount <= auction.currentPrice) {
      res.status(400);
      throw new Error('Bid amount must be greater than current price');
    }

    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        status: 'Active',
        endTime: { $gt: new Date() },
        currentPrice: { $lt: bidAmount }
      },
      {
        $set: { currentPrice: bidAmount }
      },
      { new: true }
    );

    if (!updatedAuction) {
      res.status(400);
      throw new Error('Bid could not be placed. A higher bid was placed or the auction has ended.');
    }

    const bid = await Bid.create({
      auction: auctionId,
      bidder: req.user._id,
      amount: bidAmount
    });

    const populatedBid = await Bid.findById(bid._id).populate('bidder', 'name email');

    res.status(201).json({
      bid: populatedBid,
      auction: updatedAuction
    });
  } catch (error) {
    next(error);
  }
};

const getAuctionBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    next(error);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('auction', 'title image currentPrice status endTime')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    next(error);
  }
};

const getMyWonAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({
      winner: req.user._id,
      status: 'Ended'
    }).sort({ endTime: -1 });

    res.json(auctions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeBid,
  getAuctionBids,
  getMyBids,
  getMyWonAuctions
};
