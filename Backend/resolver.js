const jwt = require('jsonwebtoken');

// Mock data
let users = {
  admin: { password: 'admin123', role: 'Admin' },
  user: { password: 'user123', role: 'User' }, // Ensure 'user' exists here
};

let events = [
  { id: '1', title: 'Wedding Party', date: '2024-12-29', location: 'Bangalore' },
  { id: '2', title: 'Birthday Party', date: '2024-12-30', location: 'Chennai' },
  { id: '3', title: 'New Year Party', date: '2024-12-31', location: 'Mumbai' },
];

// Secret key for JWT signing
const SECRET_KEY = 'my-secret-key';

const resolvers = {
  Query: {
    events: () => events,
  },

  Mutation: {
    login: (_, { username, password }) => {
      console.log("Login attempt for:", username);  // Debugging line

      const user = users[username];
      if (!user) {
        throw new Error('User not found');
      }
      if (user.password !== password) {
        throw new Error('Invalid credentials');
      }


      
      // Generate JWT token (unique per user)
      const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

      return {
        token,
        user: { username, role: user.role },
      };
    },

    addEvent: (_, { title, date, location }, { token }) => {
      try {
        // Verify JWT token
        jwt.verify(token, SECRET_KEY);
      } catch (e) {
        throw new Error('Authentication required');
      }

      // Add new event
      const newEvent = { id: String(events.length + 1), title, date, location };
      events.push(newEvent);
      return newEvent;
    },
  },
};

module.exports = resolvers;
