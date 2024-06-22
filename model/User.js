// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null // URL to the profile image
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true
  },
  emailOTP: {
    code: {
      type: String,
      default: null // OTP code
    },
    expiry: {
      type: Date,
      default: null // Expiry time for the OTP
    },
    verified: {
      type: Boolean,
      default: false // Email verification status
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
