const mongoose = require("mongoose");
const bidSchema = new mongoose.Schema({
  bidUserID: { type: String, required: true },
  bidamt: { type: Number, required: true },
  bidTime: { type: String, required: true },
});
const auction = new mongoose.Schema({
  channelID: { type: String },
  createdTime: { type: String },
  auctionName: { type: String },
  baseBid: { type: Number },
  minBid: { type: Number },
  bids: [bidSchema],
  permID: { type: String },
  active: { type: Boolean, default: true },
});

const model = mongoose.model(`AuctionModels`, auction);
module.exports = model;
