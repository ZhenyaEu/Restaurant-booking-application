const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'my_super_secret_key_123';

app.use(cors());
app.use(express.json());
const restaurantRoutes = require('./routes/restaurants');
app.use('/api/restaurants', restaurantRoutes);
//app.use('/api/bookings', require('./bookings.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));

// Раздаем всю папку public как статическую
app.use('/static', express.static(path.join(__dirname, 'public')));

// Создаем папки для хранения картинок, если их нет
if (!fs.existsSync('./public/dishes')) {
  fs.mkdirSync('./public/dishes', { recursive: true });
}

// Настройка хранилища Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/dishes');
  },
  filename: (req, file, cb) => {
    // Сохраняем файл с уникальным именем на основе времени
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Базы данных в памяти (мок)
const users = [
  { id: 1, firstName: 'System', secondName: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'Admin' },
  { id: 2, firstName: 'John', secondName: 'Waiter', email: 'waiter@test.com', password: 'waiter123', role: 'Waiter' }
];

const dishes = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh tomatoes, mozzarella, and basil.',
    price: 17,
    imageUrl: `http://localhost:${PORT}/static/angular.svg` // Временный фолбэк логотипа как блюда
  }
];

const orders = [];

// Мидлвар для проверки JWT токена и роли Admin
const isAdmin = (req, req_res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return req_res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'Admin') {
      return req_res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return req_res.status(401).json({ message: 'Invalid token' });
  }
};

// 3. Мидлвар проверки роли Waiter:
const isWaiter = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'Waiter') {
      return res.status(403).json({ message: 'Forbidden: Waiters only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 1. Конфиг
app.get('/api/config', (req, res) => {
  res.json({ logoUrl: `http://localhost:${PORT}/static/logo.png`, siteName: 'My Junior Project' });
});

// 2. Регистрация
app.post('/api/register', (req, res) => {
  const { firstName, secondName, email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User exists' });
  const newUser = { id: users.length + 1, firstName, secondName, email, password, role: 'Customer' };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token, user: { firstName: newUser.firstName, secondName: newUser.secondName, role: newUser.role } });
});

// 3. Логин
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { firstName: user.firstName, secondName: user.secondName, role: user.role } });
});

// 4. Защищенный список пользователей (только для Админа)
app.get('/api/admin/customers', isAdmin, (req, res) => {
  const customers = users.filter(u => u.role === 'Customer');
  res.json(customers);
});

// 5. Защищенное добавление блюда с картинкой (только для Админа)
app.post('/api/admin/dishes', isAdmin, upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const newDish = {
    id: dishes.length + 1,
    name,
    description,
    price: Number(price),
    imageUrl: `http://localhost:${PORT}/static/dishes/${req.file.filename}`
  };

  dishes.push(newDish);
  console.log('🍕 Добавлено новое блюдо:', newDish);
  res.status(201).json(newDish);
});

// 6. Открытый эндпоинт получения всех блюд (доступен всем)
app.get('/api/dishes', (req, res) => {
  res.json(dishes);
});

// 7. Удаление блюда (только для Админа)
app.delete('/api/admin/dishes/:id', isAdmin, (req, res) => {
  const dishId = Number(req.params.id);
  const index = dishes.findIndex(d => d.id === dishId);

  if (index === -1) {
    return res.status(404).json({ message: 'Dish not found' });
  }

  dishes.splice(index, 1);
  console.log(`🗑️ Блюдо с ID ${dishId} удалено`);
  res.json({ message: 'Dish deleted successfully' });
});

// 8. Редактирование блюда (только для Админа)
app.put('/api/admin/dishes/:id', isAdmin, upload.single('image'), (req, res) => {
  const dishId = Number(req.params.id);
  const dish = dishes.find(d => d.id === dishId);

  if (!dish) {
    return res.status(404).json({ message: 'Dish not found' });
  }

  const { name, description, price } = req.body;
  if (name) dish.name = name;
  if (description) dish.description = description;
  if (price) dish.price = Number(price);

  // Обновляем картинку, только если администратор загрузил новый файл
  if (req.file) {
    dish.imageUrl = `http://localhost:${PORT}/static/dishes/${req.file.filename}`;
  }

  console.log(`✏️ Блюдо обновлено:`, dish);
  res.json(dish);
});

// Объект для хранения корзин по ID пользователя: { [userId]: [ { dish, quantity } ] }
const carts = {};

// Мидлвар проверки токена для любого авторизованного пользователя
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET); // Сохраняем { id, email, role } в req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Получить корзину текущего пользователя
app.get('/api/cart', verifyToken, (req, res) => {
  const userCart = carts[req.user.id] || [];
  res.json(userCart);
});

// Сохранить/обновить корзину текущего пользователя
app.post('/api/cart', verifyToken, (req, res) => {
  const { items } = req.body;
  carts[req.user.id] = items;
  res.json(carts[req.user.id]);
});

// 4. Создание нового заказа (для Customer):
app.post('/api/orders', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  const userCart = carts[req.user.id] || [];

  if (userCart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalPrice = userCart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  const newOrder = {
    id: orders.length + 1,
    customerName: `${user.firstName} ${user.secondName}`,
    customerEmail: user.email,
    items: userCart, // Массив { dish, quantity }
    totalPrice,
    createdAt: new Date().toISOString(),
    status: 'In progress'
  };

  orders.push(newOrder);
  carts[req.user.id] = []; // Очищаем корзину покупателя на сервере
  console.log('🛎️ Новый заказ создан:', newOrder);

  res.status(201).json(newOrder);
});

// 5. Получение списка заказов (для Waiter):
app.get('/api/waiter/orders', isWaiter, (req, res) => {
  res.json(orders);
});

// 6. Завершение заказа (для Waiter):
app.patch('/api/waiter/orders/:id/complete', isWaiter, (req, res) => {
  const orderId = Number(req.params.id);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = 'Completed';
  console.log(`✅ Заказ #${orderId} выполнен`);
  res.json(order);
});


app.listen(PORT, () => console.log(`🚀 Мок-сервер запущен на http://localhost:${PORT}`));
