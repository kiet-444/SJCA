const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/Payment. controller");

router.post("/create", PaymentController. createPayment);
router.post("/callback", PaymentController.paymentCallback);
router.post("/release", PaymentController.releasePayment);

module.exports = router;
