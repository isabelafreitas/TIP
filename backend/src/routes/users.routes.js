const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const usersController = require('../controllers/users.controller');

router.get('/me', auth, usersController.getMe);
router.patch('/me', auth, usersController.updateMe);
router.patch('/me/provider-profile', auth, usersController.updateProviderProfile);
router.get('/:id', usersController.getPublicProfile);
router.get('/:id/reviews', usersController.getUserReviews);

module.exports = router;
