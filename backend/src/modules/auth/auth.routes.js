const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { loginSchema } = require('./auth.schema');
const auth = require('../../middlewares/auth');

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;