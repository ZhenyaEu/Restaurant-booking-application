const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurantId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Review', reviewSchema);
