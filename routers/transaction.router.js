const express = require("express");
const router = express.Router();

const TransactionController = require("../controllers/Transaction.controller");
const { verifyToken } = require("../middleware/auth.middleware");

/**
 *  
 * @swagger
 *  /api/transactions:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        description: The auto-generated ID of the transaction
 *      senderId:
 *        type: string
 *        description: The ID of the sender
 *      receiverId:
 *        type: string
 *        description: The ID of the receiver
 *      amount:
 *        type: number
 *        description: The amount of the transaction
 *      balance:
 *        type: number
 *        description: The balance of the transaction
 *      createdAt:
 *        type: string
 *        format: date-time
 *        description: The creation date of the transaction
 *      updatedAt:
 *        type: string
 *        format: date-time
 *        description: The update date of the transaction   
 */
router.get("/", verifyToken, TransactionController.getTransaction);

module.exports = router;