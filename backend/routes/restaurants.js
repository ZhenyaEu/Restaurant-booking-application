const express = require('express');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

// Customer role-checking middleware
const isCustomer = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'Customer') {
      return res.status(403).json({ message: 'Only customers can leave reviews' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


// Mock restaurant and review database
const restaurants = [
  {
    id: 1,
    name: 'The Georgian Spirit',
    address: '24 Soborna Square, Dnipro',
    imageUrl: `http://localhost:${PORT}/static/restaurants/georgian-3.jpg`,
    cuisine: 'Modern Georgian & Organic Farm-to-Table',
    workingHours: 'Mon–Fri: 09:00 – 22:00 | Sat–Sun: 10:00 – 23:00',
    interiorDescription: 'Spacious panoramic dining hall filled with natural daylight, live olive trees, warm oak furniture, and soft acoustic lighting designed for relaxed dining.',
    locationDescription: 'Located in the quiet historic heart of Soborna Square, just a 3-minute walk from Shevchenko Park, with convenient street parking and a summer terrace.',
    reviews: [
      {
        id: 101,
        author: 'Olena Kovalenko',
        rating: 5,
        date: 'November 10, 2026',
        comment: 'Amazing atmosphere and super fresh ingredients! The Margherita pizza and homemade lemonade were outstanding.'
      },
      {
        id: 102,
        author: 'Dmytro Melnyk',
        rating: 5,
        date: 'November 14, 2026',
        comment: 'Very cozy interior with lots of greenery. Friendly staff and fast service even on a busy Friday evening.'
      }
    ]
  }, 
   {
    id: 2,
    name: 'Suliko & Saperavi',
    address: '15 Dmytra Yavornytskoho Ave, Dnipro',
    imageUrl: `http://localhost:${PORT}/static/restaurants/georgian-1.jpg`,
    cuisine: 'Authentic Georgian Cuisine & Wine Bar',
    workingHours: 'Mon–Fri: 09:00 – 22:00 | Sat–Sun: 10:00 – 23:00',
    interiorDescription: 'Warm brick arches, handmade clay amphoras (qvevri), woven Georgian carpets, and an open wood-fired tone oven where fresh shoti bread is baked right before guests.',
    locationDescription: 'Situated right on the central Dmytra Yavornytskoho Avenue near Katerynoslavskyi Boulevard, easily accessible by public transport with a cozy courtyard patio.',
    reviews: [] // Empty array for future reviews
  },
  {
    id: 3,
    name: 'Tbilisi Hearth',
    address: '7 Sichovykh Striltsiv St, Dnipro',
    imageUrl: `http://localhost:${PORT}/static/restaurants/georgian-2.jpg`,
    cuisine: 'Traditional Caucasian Grill & Khachapuri House',
    workingHours: 'Mon–Fri: 09:00 – 22:00 | Sat–Sun: 10:00 – 23:00',
    interiorDescription: 'Rustic mountain-style hall featuring carved walnut tables, vintage Tbilisi photographs, soft lantern lighting, and panoramic windows overlooking the historic street.',
    locationDescription: 'Located in the lively cultural district on Sichovykh Striltsiv Street, a 5-minute walk from Trinity Cathedral, offering private family booths.',
    reviews: [] // Empty array for future reviews
  }
];

// Get a list of all restaurants
router.get('/', (req, res) => {
  const summaryList = restaurants.map(({ id, name, address, imageUrl }) => ({
    id,
    name,
    address,
    imageUrl
  }));
  res.json(summaryList);
});

// Get a restaurant and combined reviews (mock and MongoDB)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const restaurant = restaurants.find(r => r.id === id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Load real MongoDB reviews for this restaurant
    const dbReviews = await Review.find({ restaurantId: id });
    const formattedDbReviews = dbReviews.map(r => ({
      id: r._id.toString(),
      userId: r.userId.toString(),
      author: r.author,
      rating: r.rating,
      date: r.date,
      comment: r.comment
    }));

    res.json({
      ...restaurant,
      reviews: [...restaurant.reviews, ...formattedDbReviews]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update a review (1 review per restaurant from 1 Customer)
router.post('/:id/reviews', isCustomer, async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const user = await User.findById(req.user.id);
    const authorName = user ? `${user.firstName} ${user.secondName}` : 'Customer';
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Find this user's existing review for this restaurant and update it, or create a new one
    const review = await Review.findOneAndUpdate(
      { restaurantId, userId: req.user.id },
      {
        author: authorName,
        rating: Number(rating),
        comment,
        date: formattedDate
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      id: review._id.toString(),
      userId: review.userId.toString(),
      author: review.author,
      rating: review.rating,
      date: review.date,
      comment: review.comment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
