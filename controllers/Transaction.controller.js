const {Transaction } = require('../models');

const getTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        
        const transactions = await Transaction.findOne({
            where: { userId },
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

module.exports = {
    getTransaction
}

