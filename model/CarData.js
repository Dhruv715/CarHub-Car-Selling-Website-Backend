// models/Car.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    type: [String], 
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  ownerType: {
    type: String,
    enum: ['First Owner', 'Second Owner'],
    required: true
  },
  kmReading: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'process'],
    default: 'pending'
  },
  features: {
    type: [String], 
    default: []
  },
   addedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  addedByAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
