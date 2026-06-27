const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const announcementsController = require('../controllers/announcements.controller');

router.post('/', auth, announcementsController.createAnnouncement);
router.get('/mine', auth, announcementsController.getMyAnnouncements);
router.get('/available', auth, announcementsController.getAvailableAnnouncements);
router.post('/:id/apply', auth, announcementsController.applyToAnnouncement);
router.get('/:id/candidacies', auth, announcementsController.getCandidacies);
router.patch('/:id/close', auth, announcementsController.closeAnnouncement);

module.exports = router;
