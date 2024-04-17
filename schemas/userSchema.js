const { gql } = require('apollo-server-express');

const userSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    purchasedBooks: [Book]!
  }

  type AuthData {
    user: User!
    token: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Mutation {
    register(input: RegisterInput!): AuthData!
    login(input: LoginInput!): AuthData!
  }

  type Query {
    getAllUsers: [User]!
  }
`;

module.exports = userSchema;
