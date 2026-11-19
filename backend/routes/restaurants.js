const express = require('express');
const router = express.Router();

const PORT = process.env.PORT || 3000;

// Моковая база ресторанов и отзывов
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
    reviews: [] // Пустой массив для будущих отзывов
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
    reviews: [] // Пустой массив для будущих отзывов
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
