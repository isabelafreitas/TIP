const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providers.controller');

router.get('/', providersController.listProviders);
router.get('/search', providersController.searchProviders);

module.exports = router;
