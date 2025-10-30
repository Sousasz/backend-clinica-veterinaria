const express = require('express');
const { createRating, getRatings } = require('../controllers/ratingController');
const router = express.Router();

router.post('/', createRating);
router.get('/', getRatings);

module.exports = router;
