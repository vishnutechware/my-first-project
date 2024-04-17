const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  purchasedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
