const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');

const userResolver = {
  Mutation: {
    async register(parent, args, context, info) {
      try {
        const { username, email, password } = args.input;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Validate password length
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
          username,
          email,
          password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
          { userId: savedUser.id, email: savedUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return { user: savedUser, token };
      } catch (error) {
        throw new Error('Failed to register user: ' + error.message);
      }
    },

    async login(parent, args, context, info) {
      try {
        const { email, password } = args.input;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return { user, token };
      } catch (error) {
        throw new Error('Failed to login: ' + error.message);
      }
    }
  },

  Query: {
    async getAllUsers(parent, args, context, info) {
      // Check if the logged-in user is admin
      const { user } = context;
      if (!user || user.username !== 'admin') {
        throw new Error('Unauthorized access');
      }

      try {
        // Fetch all users
        const users = await User.find();

        // Fetch purchased books for each user
        const usersWithBooks = await Promise.all(users.map(async (user) => {
          const purchasedBooks = await Book.find({ postedBy: user._id });
          return { ...user.toObject(), purchasedBooks };
        }));

        return usersWithBooks;
      } catch (error) {
        throw new Error('Failed to fetch users: ' + error.message);
      }
    }
  },

  User: {
    async purchasedBooks(parent, args, context, info) {
      try {
        const purchasedBooks = await Book.find({ _id: { $in: parent.purchasedBooks } });
        return purchasedBooks;
      } catch (error) {
        throw new Error('Failed to fetch purchased books: ' + error.message);
      }
    }
  }
};

module.exports = userResolver;
