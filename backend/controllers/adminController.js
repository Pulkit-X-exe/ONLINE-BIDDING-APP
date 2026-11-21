const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'Active' });
    const endedAuctions = await Auction.countDocuments({ status: 'Ended' });
    const totalBids = await Bid.countDocuments();

    const categorySales = await Auction.aggregate([
      {
        $match: {
          status: 'Ended',
          winner: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSales: { $sum: '$currentPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalSales: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]);

    res.json({
      totalUsers,
      totalAuctions,
      activeAuctions,
      endedAuctions,
      totalBids,
      categorySales
    });
  } catch (error) {
    next(error);
  }
};

const getCategorySales = async (req, res, next) => {
  try {
    const categorySales = await Auction.aggregate([
      {
        $match: {
          status: 'Ended',
          winner: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSales: { $sum: '$currentPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalSales: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]);

    res.json(categorySales);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllBids = async (req, res, next) => {
  try {
    const bids = await Bid.find()
      .populate('bidder', 'name email')
      .populate('auction', 'title category currentPrice')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getCategorySales,
  getAllUsers,
  deleteUser,
  getAllBids
};
