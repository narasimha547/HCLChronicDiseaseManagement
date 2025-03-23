const express = require("express");
const router = express.Router();

const { validateRequest } = require("../middlewares");

const RequestController = require("../controllers/RequestController");

const {
  addPartner,
  authenticatePartner,
  verifyToken,
} = require("../controllers/authController");
const { addPatient, addDoctor, addProvider, login, addPatientHistory } = require("../controllers/userController");

router.post("/admin/addpartner", validateRequest, addPartner);
router.post("/authenticate", validateRequest, authenticatePartner);

router.post("/addPatient", validateRequest, verifyToken, addPatient);
router.post("/addDoctor", validateRequest, verifyToken, addDoctor);
router.post("/addProvider", validateRequest, verifyToken, addProvider);
router.post("/login", validateRequest, verifyToken, login);
router.post("/addPatientHistory", validateRequest, verifyToken, addPatientHistory);

router.post("/decrypt", validateRequest, RequestController.decrypt);

module.exports = router;
