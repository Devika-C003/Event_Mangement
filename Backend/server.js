const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolver');
const jwt = require('jsonwebtoken');

// Secret key for JWT signing
const SECRET_KEY = 'my-secret-key';

// Middleware to verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null; // Return null if the token is invalid or expired
  }
};



// Apollo Server context function to check authorization
const context = ({ req }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null; // Ensure "Bearer" prefix is handled properly

  if (token) {
    const user = verifyToken(token);
    if (user) {
      return { user }; // Authenticated user
    }
    console.warn('Invalid or expired token'); // Log for debugging
  }

  return {}; // No user if no token or invalid token
};



// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  formatError: (err) => {
    // Enhanced error logging for debugging
    console.error(`[Error]: ${err.message}`);
    return err;
  },
});

// Start the server
server.listen(4000).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
