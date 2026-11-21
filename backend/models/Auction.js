const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Ended'],
    default: 'Active'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

auctionSchema.index({ category: 1 });
auctionSchema.index({ status: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
