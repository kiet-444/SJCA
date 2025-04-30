const express = require("express");
const router = express.Router();

const TransactionController = require("../controllers/Transaction.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, TransactionController.getTransaction);

module.exports = router;