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

/**
 *  
 * @swagger
 *  /api/transactions:
 *    post:
 *      summary: Create a new transaction
 *      tags: [Transaction]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Transaction'
 *      responses:
 *        201:
 *          description: Transaction created successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Transaction'
 *        500:
 *          description: Failed to create transaction
 *      security:
 *        - bearerAuth: [] 
 */
router.post("/createTransaction", verifyToken, TransactionController.createTransaction);

module.exports = router;