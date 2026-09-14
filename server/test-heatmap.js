const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/me/profile', // wait, we don't have the token. I should hit a user profile by ID.
};
// I need a user ID. Let me query the DB for the first user.
