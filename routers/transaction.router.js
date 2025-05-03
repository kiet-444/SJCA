const express = require("express");
const router = express.Router();

const TransactionController = require("../controllers/Transaction.controller");
const { verifyToken } = require("../middleware/auth.middleware");

/**
 *  
 * @swagger
 *  /api/transactions:
 *    get:
 *      summary: Get all transactions
 *      tags: [Transaction]
 *      responses:
 *        200:
 *          description: List of all transactions
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Transaction'
 *        500:
 *          description: Failed to retrieve transactions
 *      security:
 *        - bearerAuth: [] 
 */
router.get("/", verifyToken, TransactionController.getTransaction);

module.exports = router;