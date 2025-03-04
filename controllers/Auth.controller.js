const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { Op } = require('sequelize');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
        const { username, email, phoneNumber , address , password, role, cccd } = req.body;

        if (!username || !email || !phoneNumber || !address || !password || !role) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        if (!role) {
            return res.status(400).json({ message: 'Vai trò là bắt buộc' });
        }

        if (!['user', 'employer'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        if (role === 'user') {
            if (!username || !email || !phoneNumber || !address || !password) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc cho tài khoản người dùng' });
            }
        } else if (role === 'employer') {
            //Employer cần nhập email và cccd để có thể xác thực
            if ((!email || !cccd) || !phoneNumber || !address || !password) {
                return res.status(400).json({ message: 'Doanh nghiệp cần nhập email hoặc mã số thuế, số điện thoại, địa chỉ và mật khẩu' });
            }
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã tồn tại' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            username: role === 'user' ? username : null, 
            email: email || null,
            phoneNumber,
            address,
            password, 
            role,
            cccd: role === 'employer' ? cccd || null : null,
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

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Thiếu thông tin đăng nhập' });
        }

        // Tìm người dùng theo email hoặc username
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: identifier }, { username: identifier }],
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
        }

        // Kiểm tra xác minh email
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Tài khoản chưa xác minh email' });
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: 'Đăng nhập thành công', token });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
    }
};

// Xác minh email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Mã xác minh không hợp lệ hoặc đã hết hạn' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Xác minh email thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xác minh email', error });
    }
};

module.exports = { register, login, verifyEmail };
