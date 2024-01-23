// server/server.js

const express = require('express');
const path = require('path'); 
const enforce = require('express-sslify');
const app = express();
const port = process.env.PORT || 5000;
const apiRoutes = require('./routes/api');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, './client/build')));

app.use('/api', apiRoutes);

// enable HTTPS redirection in a secure environment
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
