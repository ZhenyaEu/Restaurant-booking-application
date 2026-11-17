const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookings.service');

// GET /api/bookings/timeline?restaurantId=1&date=2026-11-17&tzOffset=-120
router.get('/timeline', async (req, res) => {
  try {
    const { restaurantId, date, tzOffset } = req.query;
    if (!restaurantId || !date) {
      return res.status(400).json({ message: 'Требуются restaurantId и date' });
    }
    const timeline = await bookingService.getDayTimeline(restaurantId, date, Number(tzOffset || 0));
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const saved = await bookingService.createBooking(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
