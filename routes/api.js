// server/routes/api.js

const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController');
const picturesController = require('../controllers/picturesController');

// Define your API routes here
router.post('/login', loginController.handleLogin);
router.post('/seasonal-pictures', picturesController.getSeasonalPictures);
router.get('/pictures', picturesController.getPictures);

module.exports = router;
