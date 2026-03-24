const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: { 
    type: String, 
    enum: ['Lavash', 'Burger', 'Pizza', 'Ichimliklar', 'Osh'],
    required: true 
  },
  status: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
