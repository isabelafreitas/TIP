const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/disputes.controller');

router.post('/', auth, ctrl.openDispute);
router.get('/:id', auth, ctrl.getDispute);
router.post('/:id/respond', auth, ctrl.respondToDispute);

module.exports = router;
