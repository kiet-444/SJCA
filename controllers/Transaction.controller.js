const { Transaction } = require('../models');
const { Op } = require('sequelize');
const EscrowWallet = require('../models/EscrowWallet');


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
        const userId = req.userId;
        const { receiverId, amount, description } = req.body;


        const exitEscrowWallet = await EscrowWallet.findOne({ where: { userId: receiverId } });


        if (exitEscrowWallet && exitEscrowWallet.balance >= amount) {
            await Transaction.create({ senderId: userId, receiverId, amount, description });
            await exitEscrowWallet.update({ balance: exitEscrowWallet.balance - amount });
        } else if (exitEscrowWallet.balance < amount) {
            res.status(400).json({ message: 'Insufficient balance' });
        } else {
            res.status(404).json({ message: 'Escrow wallet not found' });
        }


        res.status(201).json({ message: 'Transaction created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    getTransaction,
    createTransaction
}
