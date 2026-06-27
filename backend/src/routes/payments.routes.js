const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/payments.controller');

router.post('/initiate', auth, ctrl.initiatePayment);
router.post('/webhook', ctrl.webhook);
router.get('/:service_id', auth, ctrl.getPayment);

module.exports = router;
