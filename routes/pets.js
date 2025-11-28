const express = require("express");
const PetController = require("../controllers/PetController");

const router = express.Router();

router.post("/", PetController.createPet);
router.get("/", PetController.getPets);

module.exports = router;
