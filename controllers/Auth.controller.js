const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Register a new user
const register = async (req, res) => {
    try {
        const { username, fullname, email, password, address, phoneNumber } = req.body;


        if (!username || !fullname || !email || !password || !address || !phoneNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }


        // Check phoneNumber format
        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }


        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({ username, fullname, email, password, address, phoneNumber, verificationToken });
        await user.save();

        const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
        });


        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.', error_code: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user', error });
    }
};


// Login a user and return a JWT token
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        // Check if the identifier is an email or username
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(identifier);
        const user = isEmail
            ? await User.findOne({ email: identifier })
            : await User.findOne({ username: identifier });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'User is not verified' });
        }


        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });


        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login', error });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify email', error });
    }
};


module.exports = { register, login, verifyEmail };
