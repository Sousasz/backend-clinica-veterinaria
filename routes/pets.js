const express = require('express');
const { createPet, getPets } = require('../controllers/petController');
const router = express.Router();

router.post('/', createPet);
router.get('/', getPets);

module.exports = router;
