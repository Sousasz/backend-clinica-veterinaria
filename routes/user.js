
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserProfile } = require('../controllers/userController'); 
const { getUserConsults } = require('../controllers/consultController')

router.get('/profile', auth, getUserProfile);
router.get('/consults', auth, getUserConsults);

module.exports = router;
