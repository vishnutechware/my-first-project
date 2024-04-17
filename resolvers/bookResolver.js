const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const User = require('../models/User');

const bookResolver = {
  Mutation: {
    async addBook(parent, args, context, info) {
      const token = context.req.headers.authorization;

      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decodedToken;

        if (!userId) {
          throw new Error('Invalid token');
        }

        const { name, author, price } = args.input;

        // Automatically add the postedBy field with the user ID of the logged-in user
        const newBook = new Book({
          name,
          author,
          price,
          postedBy: userId
        });

        const savedBook = await newBook.save();

        return savedBook;
      } catch (error) {
        throw new Error('Failed to add book: ' + error.message);
      }
    },

    async updateBook(parent, args, context, info) {
      const token = context.req.headers.authorization;

      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decodedToken;

        if (!userId) {
          throw new Error('Invalid token');
        }

        const { id, name, author, price } = args.input;

        // Find the book by ID
        const book = await Book.findById(id);

        if (!book) {
          throw new Error('Book not found');
        }

        // Check if the logged-in user is the same as the one who posted the book
        if (book.postedBy.toString() !== userId) {
          throw new Error('You are not authorized to update this book');
        }

        // Update the book
        const updatedBook = await Book.findByIdAndUpdate(
          id,
          { name, author, price },
          { new: true }
        );

        return updatedBook;
      } catch (error) {
        throw new Error('Failed to update book: ' + error.message);
      }
    },

    async deleteBook(parent, args, context, info) {
      const token = context.req.headers.authorization;

      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decodedToken;

        if (!userId) {
          throw new Error('Invalid token');
        }

        const { id } = args;

        // Find the book by ID
        const book = await Book.findById(id);

        if (!book) {
          throw new Error('Book not found');
        }

        // Check if the logged-in user is the same as the one who posted the book
        if (book.postedBy.toString() !== userId) {
          throw new Error('You are not authorized to delete this book');
        }

        // Delete the book
        const deletedBook = await Book.findByIdAndDelete(id);

        return deletedBook;
      } catch (error) {
        throw new Error('Failed to delete book: ' + error.message);
      }
    },

    async purchaseBook(parent, args, context, info) {
      const token = context.req.headers.authorization;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decodedToken;
      
        if (!userId) {
          throw new Error('Invalid token');
        }
      
        const { bookId } = args.input;
      
        const book = await Book.findById(bookId);
      
        if (!book) {
          throw new Error('Book not found');
        }
      
        const user = await User.findById(userId);
      
        if (!user) {
          throw new Error('User not found');
        }
      
        if (user.purchasedBooks.includes(bookId)) {
          throw new Error('Book already in purchase list');
        }
      
        user.purchasedBooks.push(bookId);
        await user.save();
      
        return `${book.name} purchased successfully`;
      } catch (error) {
        throw new Error('Failed to purchase book: ' + error.message);
      }
    }
  },

  Query: {
    getAllBooks: async (parent, args, context, info) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const books = await Book.find();
        return books;
      } catch (error) {
        throw new Error('Failed to fetch books');
      }
    },

    getBookById: async (parent, { id }, context, info) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      try {
        const book = await Book.findById(id);
        return book;
      } catch (error) {
        throw new Error('Failed to fetch book');
      }
    }
  }
};

module.exports = bookResolver;
