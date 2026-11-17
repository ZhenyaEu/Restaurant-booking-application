const fs = require('fs');
const path = require('path');

// Путь к нашему временному файлу-базе
const DB_PATH = path.join(__dirname, '../data/bookings.json');

// Читаем все брони из файла
const readBookings = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw || '[]');
};

// Записываем брони в файл
const writeBookings = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const getDayTimeline = async (restaurantId, dateStr, clientTimezoneOffset = 0) => {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const openMins = timeToMinutes('09:00');
  const closeMins = isWeekend ? timeToMinutes('23:00') : timeToMinutes('22:00');

  // Берем брони из JSON-файла вместо MongoDB
  const allBookings = readBookings();
  const existingBookings = allBookings.filter(
    b => b.restaurantId === restaurantId && b.date === dateStr
  );

  const blockedIntervals = existingBookings.map(b => ({
    start: timeToMinutes(b.startTime) - 30,
    end: timeToMinutes(b.endTime) + 30
  }));

  const now = new Date();
  const localNow = new Date(now.getTime() - clientTimezoneOffset * 60000);
  const localTodayStr = localNow.toISOString().split('T')[0];
  const currentMinutesOfDay = localNow.getUTCHours() * 60 + localNow.getUTCMinutes();

  const slots = [];
  for (let time = openMins; time <= closeMins; time += 30) {
    const isPastDate = dateStr < localTodayStr;
    const isPastTimeToday = (dateStr === localTodayStr) && (time <= currentMinutesOfDay);

    const isReserved = existingBookings.some(b => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return time >= bStart && time < (bEnd + 30);
    });

    const isBlockedForStart = blockedIntervals.some(interval => time > interval.start && time < interval.end);

    slots.push({
      time: minutesToTime(time),
      minutes: time,
      isPast: isPastDate || isPastTimeToday,
      isReserved,
      isAvailableForStart: !isPastDate && !isPastTimeToday && !isReserved && !isBlockedForStart && (time < closeMins)
    });
  }

  return slots;
};

const createBooking = async ({ restaurantId, date, startTime, endTime }) => {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  if (endMins - startMins < 30) {
    throw new Error('Минимальная длительность бронирования — 30 минут');
  }

  const allBookings = readBookings();
  const existingBookings = allBookings.filter(
    b => b.restaurantId === restaurantId && b.date === date
  );

  const hasConflict = existingBookings.some(b => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return (startMins < bEnd + 30) && (endMins + 30 > bStart);
  });

  if (hasConflict) {
    throw new Error('Выбранное время пересекается с другой бронью.');
  }

  const newBooking = {
    id: Date.now().toString(),
    restaurantId,
    date,
    startTime,
    endTime
  };

  allBookings.push(newBooking);
  writeBookings(allBookings); // Сохраняем в JSON
  return newBooking;
};

module.exports = { getDayTimeline, createBooking };
