const {Transaction } = require('../models');
const { Op } = require('sequelize');

const getTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        
        const transactions = await Transaction.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
        });

        if (!transactions) {
            return res.status(404).json({
                success: false,
                message: "Transaction is not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: transactions,
        }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createTransaction = async (req, res) => {
    try {
        const { senderId, amount } = req.body;
        const transaction = await Transaction.create({ senderId, amount });
        res.status(201).json({ message: 'Transaction created successfully', data: transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTransaction,
    createTransaction
}

