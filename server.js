// server/server.js

const express = require('express');
const path = require('path'); 
const enforce = require('express-sslify');
const app = express();
const port = process.env.PORT || 5000;
const apiRoutes = require('./routes/api');
const helmet = require('helmet');

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://lh3.googleusercontent.com",
        "https://drive.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://lh3.googleusercontent.com",
        "https://drive.google.com"
      ],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(helmet.frameguard({ action: 'deny' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, './client/build')));

// Forbidden paths to satisy security scans even though they don't exist.

app.use((req, res, next) => {
  if (/^\/\.(git|hg|bzr|darcs|bitkeeper)(\/|$)/.test(req.path)) {
    return res.status(403).send('Forbidden');
  }
  next();
});

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
