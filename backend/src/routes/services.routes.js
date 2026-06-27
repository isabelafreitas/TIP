const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/services.controller');

router.post('/', auth, ctrl.createService);
router.post('/from-candidacy', auth, ctrl.createServiceFromCandidacy);
router.get('/mine', auth, ctrl.getMyServices);
router.get('/:id', auth, ctrl.getService);
router.patch('/:id/accept', auth, ctrl.acceptService);
router.patch('/:id/decline', auth, ctrl.declineService);
router.patch('/:id/complete', auth, ctrl.completeService);
router.patch('/:id/confirm', auth, ctrl.confirmService);
router.patch('/:id/cancel', auth, ctrl.cancelService);
router.post('/:id/modify', auth, ctrl.requestModification);
router.patch('/:id/modify/:mod_id/accept', auth, ctrl.acceptModification);
router.patch('/:id/modify/:mod_id/decline', auth, ctrl.declineModification);

module.exports = router;
