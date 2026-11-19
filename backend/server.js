require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

// Модели
const User = require('./models/User');
const Dish = require('./models/Dish');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Роутеры
const restaurantRoutes = require('./routes/restaurants');
const bookingRoutes = require('./routes/bookings.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

if (!fs.existsSync('./public/dishes')) {
  fs.mkdirSync('./public/dishes', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/dishes'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Функция автоматического наполнения БД при старте (Admin, Waiter и базовое блюдо)
const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (!adminExists) {
      await User.create({
        firstName: 'System',
        secondName: 'Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'Admin'
      });
      console.log('👑 Создан аккаунт Admin (admin@test.com)');
    }

    const waiterExists = await User.findOne({ email: 'waiter@test.com' });
    if (!waiterExists) {
      await User.create({
        firstName: 'John',
        secondName: 'Waiter',
        email: 'waiter@test.com',
        password: 'waiter123',
        role: 'Waiter'
      });
      console.log('🤵 Создан аккаунт Waiter (waiter@test.com)');
    }

    const dishesCount = await Dish.countDocuments();
    if (dishesCount === 0) {
      await Dish.create({
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh tomatoes, mozzarella, and basil.',
        price: 17,
        imageUrl: `http://localhost:${PORT}/static/logo.png`
      });
      console.log('🍕 Добавлено стартовое блюдо в БД');
    }
  } catch (err) {
    console.error('Ошибка при инициализации данных БД:', err);
  }
};

// Подключаем модульные роуты
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/bookings', bookingRoutes);

// Мидлвары авторизации
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admins only' });
    next();
  });
};

const isWaiter = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'Waiter') return res.status(403).json({ message: 'Waiters only' });
    next();
  });
};

// 1. Конфиг
app.get('/api/config', (req, res) => {
  res.json({ logoUrl: `http://localhost:${PORT}/static/logo.png`, siteName: 'My Junior Project' });
});

// 2. Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, secondName, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User with this email already exists' });

    const newUser = await User.create({ firstName, secondName, email, password, role: 'Customer' });
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({
      token,
      user: { firstName: newUser.firstName, secondName: newUser.secondName, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Логин
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      user: { firstName: user.firstName, secondName: user.secondName, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Список покупателей для Админа
app.get('/api/admin/customers', isAdmin, async (req, res) => {
  const customers = await User.find({ role: 'Customer' });
  res.json(customers.map(c => ({ id: c._id, firstName: c.firstName, secondName: c.secondName, email: c.email })));
});

// 5. Блюда (CRUD)
app.get('/api/dishes', async (req, res) => {
  const dishes = await Dish.find();
  res.json(dishes.map(d => ({ id: d._id, name: d.name, description: d.description, price: d.price, imageUrl: d.imageUrl })));
});

app.post('/api/admin/dishes', isAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image is required' });
  const { name, description, price } = req.body;

  const dish = await Dish.create({
    name,
    description,
    price: Number(price),
    imageUrl: `http://localhost:${PORT}/static/dishes/${req.file.filename}`
  });

  res.status(201).json({ id: dish._id, name: dish.name, description: dish.description, price: dish.price, imageUrl: dish.imageUrl });
});

app.put('/api/admin/dishes/:id', isAdmin, upload.single('image'), async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) return res.status(404).json({ message: 'Dish not found' });

  const { name, description, price } = req.body;
  if (name) dish.name = name;
  if (description) dish.description = description;
  if (price) dish.price = Number(price);
  if (req.file) dish.imageUrl = `http://localhost:${PORT}/static/dishes/${req.file.filename}`;

  await dish.save();
  res.json({ id: dish._id, name: dish.name, description: dish.description, price: dish.price, imageUrl: dish.imageUrl });
});

app.delete('/api/admin/dishes/:id', isAdmin, async (req, res) => {
  await Dish.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// 6. Персональная корзина
app.get('/api/cart', verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart ? cart.items : []);
});

app.post('/api/cart', verifyToken, async (req, res) => {
  const { items } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { items },
    { new: true, upsert: true } // Создаст корзину в БД, если её еще нет
  );
  res.json(cart.items);
});

// 7. Заказы (Customer -> Waiter)
app.post('/api/orders', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalPrice = cart.items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  const newOrder = await Order.create({
    customerName: `${user.firstName} ${user.secondName}`,
    customerEmail: user.email,
    items: cart.items,
    totalPrice,
    status: 'In progress'
  });

  // Очищаем корзину в базе
  cart.items = [];
  await cart.save();

  res.status(201).json({
    id: newOrder._id,
    customerName: newOrder.customerName,
    customerEmail: newOrder.customerEmail,
    items: newOrder.items,
    totalPrice: newOrder.totalPrice,
    createdAt: newOrder.createdAt,
    status: newOrder.status
  });
});

app.get('/api/waiter/orders', isWaiter, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders.map(o => ({
    id: o._id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    items: o.items,
    totalPrice: o.totalPrice,
    createdAt: o.createdAt,
    status: o.status
  })));
});

app.patch('/api/waiter/orders/:id/complete', isWaiter, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: 'Completed' },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });

  res.json({
    id: order._id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    status: order.status
  });
});

// Запуск подключения к MongoDB Atlas и старт сервера
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Успешное подключение к MongoDB Atlas!');
    await seedDatabase();
    app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Ошибка подключения к MongoDB Atlas:', err.message);
  });
