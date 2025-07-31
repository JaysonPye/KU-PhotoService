const express = require('express');
const path = require('path'); 
const enforce = require('express-sslify');
const app = express();
const port = process.env.PORT || 5000;
const apiRoutes = require('./routes/api');
const helmet = require('helmet');

app.disable('x-powered-by');

// Base helmet middleware to apply standard security headers (like nosniff)
app.use(helmet());

// Custom CSP
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https:"],
      styleSrc: ["'self'", "https:"],
      imgSrc: [
        "'self'",
        "data:",
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
      workerSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);


// Frameguard to prevent clickjacking
app.use(helmet.frameguard({ action: 'deny' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './client/build')));

// 404 paths to satisfy security scans even though they don't exist.
app.use((req, res, next) => {
  if (/^\/(\.git|\.hg|\.bzr|\.darcs|\.bitkeeper|_darcs|BitKeeper)(\/|$)/i.test(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});


app.use('/api', apiRoutes);

// Enable HTTPS redirection in a secure environment
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));
}

// React SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
