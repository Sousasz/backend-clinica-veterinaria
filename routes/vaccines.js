const express = require('express');
const { createVaccine, getVaccines, updateVaccine, deleteVaccine } = require('../controllers/vaccineController');
const router = express.Router();

router.post('/', createVaccine);
router.get('/', getVaccines);
router.put('/:id', updateVaccine);
router.delete('/:id', deleteVaccine);

module.exports = router;
