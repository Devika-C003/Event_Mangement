const { gql } = require('apollo-server');

const typeDefs = gql`
  type Event {
    id: ID!
    title: String!
    date: String!
    location: String!
  }

  type User {
    username: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    events: [Event]
  }

  type Mutation {
    register(username: String!, password: String!, role: String!): User
    login(username: String!, password: String!): AuthPayload
    addEvent(title: String!, date: String!, location: String!): Event
    deleteEvent(id: ID!): Event
  }
`;

module.exports = typeDefs;
