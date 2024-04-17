// bookSchema.js

const { gql } = require('apollo-server-express');

const bookSchema = gql`
  type Book {
    id: ID!
    name: String!
    author: String!
    price: Float!
  }

  input AddBookInput {
    name: String!
    author: String!
    price: Float!
  }

  input UpdateBookInput {
    id: ID!
    name: String
    author: String
    price: Float
  }

  input PurchaseBookInput {
    bookId: ID!
  }

  type UserPurchases {
    username: String!
    purchaseList: [Book]!
  }

  type Mutation {
    addBook(input: AddBookInput!): Book!
    updateBook(input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Book
    purchaseBook(input: PurchaseBookInput!): String!
  }

  type Query {
    getAllBooks: [Book]!
    getBookById(id: ID!): Book
  }
`;

module.exports = bookSchema;
