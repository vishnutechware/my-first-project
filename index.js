const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const userResolver = require('./resolvers/userResolver');
const bookResolver = require('./resolvers/bookResolver');
const userSchema = require('./schemas/userSchema');
const bookSchema = require('./schemas/bookSchema');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Authentication middleware to decode JWT token and attach user to request context
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.userId);
      req.user = user;
      console.log(user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('Error decoding token1:', error.message);
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        console.error('Error decoding token2:', error);
      }
    }
  }
  next();
};

// Create an Express app
const app = express();

// Apply authentication middleware
app.use(authMiddleware);

// Create an ApolloServer instance
const server = new ApolloServer({
  typeDefs: [userSchema, bookSchema],
  resolvers: [userResolver, bookResolver],
  context: ({ req }) => ({ user: req.user, req }), // Include req object in context
});

// Start the ApolloServer
async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
