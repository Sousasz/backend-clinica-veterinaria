const express = require('express');
const { createMedicine, getMedicines, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const router = express.Router();

router.post('/', createMedicine);
router.get('/', getMedicines);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
