const express = require('express');
const router = express.Router();

// Моковая база ресторанов и отзывов
const restaurants = [
  {
    id: 1,
    name: 'Green Garden Bistro',
    address: '24 Soborna Square, Dnipro',
    imageUrl: 'https://unsplash.com',
    cuisine: 'Modern European & Organic Farm-to-Table',
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
  }
];

// Получить краткий список всех ресторанов (для страницы /restaurants)
router.get('/', (req, res) => {
  const summaryList = restaurants.map(({ id, name, address, imageUrl }) => ({
    id,
    name,
    address,
    imageUrl
  }));
  res.json(summaryList);
});

// Получить полную информацию о конкретном ресторане + отзывы (для /restaurant/:id)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  res.json(restaurant);
});

module.exports = router;
