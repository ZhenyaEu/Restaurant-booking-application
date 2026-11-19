const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      dish: { type: Object, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
