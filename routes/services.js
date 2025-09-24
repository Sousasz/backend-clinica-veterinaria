const express = require('express');
const { createService, getServices } = require('../controllers/serviceController');
const router = express.Router();

router.post('/', createService);
router.get('/', getServices);

module.exports = router;
