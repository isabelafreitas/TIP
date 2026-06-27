const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/saved.controller');

router.get('/', auth, ctrl.getSavedProviders);
router.post('/:provider_id', auth, ctrl.saveProvider);
router.delete('/:provider_id', auth, ctrl.unsaveProvider);

module.exports = router;
