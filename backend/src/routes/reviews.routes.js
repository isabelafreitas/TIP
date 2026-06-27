const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reviews.controller');

router.post('/', auth, ctrl.submitReview);
router.get('/pending', auth, ctrl.getPendingReviews);

module.exports = router;
