const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const auth = require('../../middlewares/auth');

router.get('/', auth, dashboardController.getStats);

module.exports = router;