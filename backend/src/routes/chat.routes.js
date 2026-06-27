const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/chat.controller');

router.get('/sessions', auth, ctrl.getSessions);
router.get('/sessions/:id/messages', auth, ctrl.getMessages);
router.post('/sessions/:id/messages', auth, ctrl.sendMessage);

module.exports = router;
