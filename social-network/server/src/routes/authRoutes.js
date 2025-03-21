const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getUser);

module.exports = router;
