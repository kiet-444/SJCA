const Payment = require('../models/Payment');
const PayOS = require('../models/User');
const User = require('../models/User');
//
const dotenv = require('dotenv');
dotenv.config();




const payos = new PayOS({
    apiKey: process.env.PAYOS_API_KEY,
    apiSecret: process.env.PAYOS_API_SECRET,
    environment: process.env.PAYOS_ENVIRONMENT || 'sandbox',
});

const addPayment = async (req, res) => {
    try {
        const { user, amount, description } = req.body;

        const oderCode = Math.floor(Math.random() * 1000000);s

        const payment = new Payment({ user, amount, description });
        await payment.save();

        res.status(201).json({ message: 'Payment added successfully', payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add payment', error });
    }
};

const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        res.status(200).json({ data: payments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get payments', error });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ data: payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get payment', error });
    }
};

module.exports = { 
    addPayment, 
    getPayments, 
    getPaymentById
 };