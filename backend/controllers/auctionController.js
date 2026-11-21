const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const createAuction = async (req, res, next) => {
  try {
    const { title, description, image, category, startingPrice, endTime } = req.body;

    if (!title || !description || !category || !startingPrice || !endTime) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    if (new Date(endTime) <= new Date()) {
      res.status(400);
      throw new Error('End time must be in the future');
    }

    const price = Number(startingPrice);
    if (isNaN(price) || price <= 0) {
      res.status(400);
      throw new Error('Starting price must be a valid positive number');
    }

    const auction = await Auction.create({
      seller: req.user._id,
      title,
      description,
      image: image || '',
      category,
      startingPrice: price,
      currentPrice: price,
      endTime: new Date(endTime),
      status: 'Active'
    });

    res.status(201).json(auction);
  } catch (error) {
    next(error);
  }
};

const getAuctions = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    await Auction.updateMany(
      { endTime: { $lte: new Date() }, status: 'Active' },
      { $set: { status: 'Ended' } }
    );

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const auctions = await Auction.find(filter)
      .populate('seller', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (error) {
    next(error);
  }
};

const getAuctionById = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('winner', 'name email');

    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    if (auction.status === 'Active' && new Date(auction.endTime) <= new Date()) {
      auction.status = 'Ended';
      await auction.save();
    }

    res.json(auction);
  } catch (error) {
    next(error);
  }
};

const updateAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this auction');
    }

    if (auction.status === 'Ended') {
      res.status(400);
      throw new Error('Cannot update ended auction');
    }

    const bidCount = await Bid.countDocuments({ auction: auction._id });
    if (bidCount > 0 && req.user.role !== 'admin') {
      res.status(400);
      throw new Error('Cannot update auction after bids have been placed');
    }

    const { title, description, image, category, startingPrice, endTime } = req.body;

    if (title) auction.title = title;
    if (description) auction.description = description;
    if (image !== undefined) auction.image = image;
    if (category) auction.category = category;
    if (startingPrice !== undefined) {
      const price = Number(startingPrice);
      auction.startingPrice = price;
      if (bidCount === 0) {
        auction.currentPrice = price;
      }
    }
    if (endTime) {
      if (new Date(endTime) <= new Date()) {
        res.status(400);
        throw new Error('End time must be in the future');
      }
      auction.endTime = new Date(endTime);
    }

    const updatedAuction = await auction.save();
    res.json(updatedAuction);
  } catch (error) {
    next(error);
  }
};

const deleteAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      res.status(404);
      throw new Error('Auction not found');
    }

    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this auction');
    }

    const bidCount = await Bid.countDocuments({ auction: auction._id });
    if (bidCount > 0 && req.user.role !== 'admin') {
      res.status(400);
      throw new Error('Cannot delete auction after bids have been placed');
    }

    await Auction.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ auction: req.params.id });

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getMyAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  getMyAuctions
};
