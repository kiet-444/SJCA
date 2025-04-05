const User = require('../models/User');
const jwt = require('jsonwebtoken');


const { Op } = require('sequelize');

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Đăng ký tài khoản
const register = async (req, res) => {
    try {
        const { email, fullName, companyName, phoneNumber , address , password, role } = req.body;

        if (!email || !fullName || !phoneNumber || !address || !companyName || !password || !role) {
            return res.status(400).json({ message: 'Not enough information' });
        }

        if (!['worker', 'employer', 'admin', 'support staff'].includes(role)) {
            return res.status(400).json({ message: 'The role must be either "user" or "employer"' });
        }

        if (role === 'worker' && (!fullName || !email.endsWith('@gmail.com') || !password)) {
            return res.status(400).json({ message: 'Full name, email, and password are required for workers' });
        }
        
        if (role === 'employer' && (!companyName || !address || !phoneNumber || !password || !email.endsWith('@gmail.com'))) {
            return res.status(400).json({ message: 'Company name, address, phone number, and password are required for employers' });
        }
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
 

        const newUser = await User.create({
            email,
            fullName,
            companyName,
            phoneNumber,
            address,
            password,
            role,
            verificationToken,
        });

        const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Xác nhận Email',
            html: `<p>Vui lòng xác nhận email của bạn bằng cách nhấp vào liên kết sau:</p><a href="${verificationLink}">Xác nhận Email</a>`,
        });

        res.status(201).json({ message: 'Đăng ký thành công, vui lòng kiểm tra email để xác nhận tài khoản.', error_code: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng ký', error });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Not enough informantion' });
        }

        // Tìm người dùng theo email hoặc username
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: email }],
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'Wrong username or password' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Wrong username or password' });
        }

        // Kiểm tra xác minh email
        if (!user.isVerified) {
            return res.status(403).json({ message: 'The account has not been verified' });
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: 'Login successfully', token, role: user.role });
    } catch (error) {
        console.error('Wrong when login:', error);
        res.status(500).json({ message: 'Wrong when login', error: error.message });
    }
};

// Xác minh email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'The verification token is invalid' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        res.status(500).json({ message: 'Wrong when verify email', error });
    }
};

module.exports = { register, login, verifyEmail };
