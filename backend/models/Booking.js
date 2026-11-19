const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  customerName: { type: String, default: 'Customer' },
  customerEmail: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
