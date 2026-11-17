const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // Формат: "YYYY-MM-DD"
  startTime: { type: String, required: true },         // Формат: "09:00"
  endTime: { type: String, required: true },           // Формат: "11:30"
  customerName: { type: String, default: 'Guest' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
