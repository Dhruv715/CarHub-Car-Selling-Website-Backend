const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inquirySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
