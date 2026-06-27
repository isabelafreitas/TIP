const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/announcements.controller');

router.get('/', auth, ctrl.getAvailableAnnouncements);
router.get('/mine', auth, ctrl.getMyAnnouncements);
router.post('/', auth, ctrl.createAnnouncement);
router.post('/:id/apply', auth, ctrl.applyToAnnouncement);
router.get('/:id/candidacies', auth, ctrl.getCandidacies);
router.patch('/:id/close', auth, ctrl.closeAnnouncement);

module.exports = router;
