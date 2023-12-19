// server/server.js

const express = require('express');
const path = require('path'); // Import the 'path' module for working with file paths

const app = express();
const port = process.env.PORT || 5000;

const apiRoutes = require('./routes/api'); // Import your API routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static files from the 'client/public' directory (including index.html)
app.use(express.static(path.join(__dirname, './client/build')));

// Use the API routes
app.use('/api', apiRoutes);

// Define a route to serve your React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
