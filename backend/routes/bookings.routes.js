const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bookingService = require('../services/bookings.service');

const JWT_SECRET = 'my_super_secret_key_123';

// Simple middleware for reading the user from the token
const extractUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (e) {}
  }
  next();
};


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


router.get('/waiter', extractUser, async (req, res) => {
  if (!req.user || req.user.role !== 'Waiter') {
    return res.status(403).json({ message: 'Доступ только для официантов' });
  }
  try {
    const allBookings = await bookingService.getAllBookings();
    res.json(allBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings
router.post('/', extractUser, async (req, res) => {
  try {
    // Combine the form data with the token user data and creation date
    const bookingPayload = {
      ...req.body,
      customerEmail: req.body.customerEmail || req.user?.email || 'Guest',
      customerName: req.body.customerName || req.user?.email?.split('@')[0] || 'Customer',
      createdAt: new Date().toISOString()
    };

    const saved = await bookingService.createBooking(bookingPayload);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
