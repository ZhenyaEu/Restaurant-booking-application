const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Cart = require('../models/Cart');
const Review = require('../models/Review');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

// Мидлвар проверки роли Customer
const isCustomer = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'Customer') {
      return res.status(403).json({ message: 'Access denied: Customers only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 1. Обновление имени и фамилии (PUT /api/customer/profile)
router.put('/profile', isCustomer, async (req, res) => {
  try {
    const { firstName, secondName } = req.body;
    if (!firstName || !secondName) {
      return res.status(400).json({ message: 'First name and second name are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, secondName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      secondName: updatedUser.secondName,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Удаление аккаунта и связанных данных (DELETE /api/customer/profile)
router.delete('/profile', isCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    await Cart.findOneAndDelete({ userId });
    await Review.deleteMany({ userId });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. История заказов и бронирований текущего Customer (GET /api/customer/history)
router.get('/history', isCustomer, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const orders = await Order.find({ customerEmail: userEmail }).sort({ createdAt: -1 });
    const bookings = await Booking.find({ customerEmail: userEmail }).sort({ createdAt: -1 });

    res.json({
      orders: orders.map(o => ({
        id: o._id.toString(),
        items: o.items,
        totalPrice: o.totalPrice,
        status: o.status,
        createdAt: o.createdAt
      })),
      bookings: bookings.map(b => ({
        id: b._id.toString(),
        restaurantId: b.restaurantId,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        createdAt: b.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
