const { Op } = require('sequelize');
const User = require('../models/User');
const Review = require('../models/Review');
const uploadFile = require('../controllers/Media.controller');


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


const getCompanyByRating = async (req, res) => {
    try {
        const topCompanies = await User.findAll({
            where: { role: 'employer' }, 
            include: [
                {
                    model: Review,
                    attributes: ['rating'],
                },
            ],
            attributes: ['id', 'companyName'], 
        });

        if (!topCompanies.length) {
            return res.status(404).json({ message: 'Không có công ty nào' });
        }

        // Tính rating trung bình
        const companiesWithAvgRating = topCompanies.map(company => {
            //check review truoc
            const ratings = company.Reviews ? company.Reviews.map(review => review.rating) : [];
            const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            return { ...company.toJSON(), avgRating };
        });

        // Lấy công ty có rating cao nhất
        const maxRating = Math.max(...companiesWithAvgRating.map(c => c.avgRating));
        const highestRatedCompanies = companiesWithAvgRating.filter(c => c.avgRating === maxRating);

        // Chọn ngẫu nhiên một công ty trong nhóm có rating cao nhất
        const randomCompany = highestRatedCompanies[Math.floor(Math.random() * highestRatedCompanies.length)];

        res.status(200).json({ data: randomCompany });
    } catch (error) {
        res.status(500).json({ message: 'Wrong when get company by rating', error });
    }
};

const getAverageRatingByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra user tồn tại
        const user = await User.findByPk(id, {
            include: [{ model: Review, attributes: ['rating'] }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const ratings = user.Reviews.map(review => review.rating);
        const avgRating = ratings.length
            ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0;

        res.status(200).json({ userId: id, avgRating });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get average rating', error });
    }
};


const getListCompany = async (req, res) => {
    try {
        const { name, minRating } = req.query;

        // Điều kiện tìm kiếm (chỉ thêm nếu có query)
        const whereCondition = { role: 'employer' };
        if (name) {             
            whereCondition.companyName = { [Op.like]: `%${name}%` };
        }

        // Truy vấn danh sách công ty
        const companies = await User.findAll({
            where: whereCondition,
            include: [
                {
                    model: Review,
                    attributes: ['rating'],
                },
            ],
            attributes: ['id', 'companyName', 'email', 'address', 'phoneNumber'],
        });

        if (!companies.length) {
            return res.status(200).json({ data: [], message: 'No companies found' });
        }

        // Tính điểm rating trung bình
        let companiesWithAvgRating = companies.map(company => {
            const ratings = company.Reviews.map(review => review.rating);
            const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
            return { ...company.toJSON(), avgRating: parseFloat(avgRating) };
        });

        // Nếu có `minRating`, lọc danh sách
        if (minRating) {
            companiesWithAvgRating = companiesWithAvgRating.filter(company => company.avgRating >= parseFloat(minRating));
        }

        res.status(200).json({ data: companiesWithAvgRating });
    } catch (error) {
        res.status(500).json({ message: 'Wrong when get list company', error });
    }
};





const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { password, avatar, ...updates } = req.body;


        const user = await User.findByPk(userId);


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            return res.status(200).json({ message: 'Password updated successfully' });
        }


        if (req.file) {
            try {
                const avatarUrl = await uploadFile(req.file); 
                updates.avatar = avatarUrl; 
            } catch (uploadError) {
                return res.status(500).json({ message: 'Failed to upload avatar', error: uploadError.message });
            }
        }


        // Update user fields based on role
        if (user.role === 'employer') {
            const { companyName, dateOfBirth, address, phoneNumber, description } = updates;
            Object.assign(user, {
                companyName,
                avatar: updates.avatar || user.avatar,
                dateOfBirth,
                address,
                phoneNumber,
                description: description ? description.trim() : null,
            });
        } else {
            const { fullname, dateOfBirth, gender, address, phoneNumber, description } = updates;


            const normalizedGender = gender ? gender.toLowerCase() : null;


            Object.assign(user, {
                fullName: fullname || user.fullName,
                avatar: updates.avatar || user.avatar,
                dateOfBirth,
                sex: normalizedGender,
                address,
                phoneNumber,
                description: description ? description.trim() : null,
            });
        }


        const updatedUser = await user.save();


        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;


        const deletedUser = await User.destroy({ where: { id } });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const whereConditon = {};

        if(role) {
            if(!['worker', 'employer'].includes(role)) {
                return res.status(400).json({ message: 'The role must be either "worker" or "employer"' });
            }
            whereConditon.role = role;
        }
        const users = await User.findAll({ where: whereConditon });
        res.status(200).json({ data: users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get users', error });
    }
};

const getTotalAccounts = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Đếm số lượng tài khoản theo ngày, tháng, năm
        const totalToday = await User.count({ where: { createdAt: { [Op.gte]: startOfDay } } });
        const totalThisMonth = await User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });
        const totalThisYear = await User.count({ where: { createdAt: { [Op.gte]: startOfYear } } });

        res.status(200).json({
            totalToday,
            totalThisMonth,
            totalThisYear
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get total accounts', error });
    }
};

const getUserByPkId = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, { include: [{ model: Review }] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userData = user.toJSON();
        delete userData.password;

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get user', error });
    }
};

// admin management status account 
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = status;
        await user.save();
        res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user status', error });
    }
};

const forgetPassword = async (req, res) => {
    try {

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${resetLink}`,
        });

        // Gửi email reset password
        res.status(200).json({ message: 'Reset password token sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset password token', error });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const user = await User.findOne({ where: { resetToken: token } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        await user.save();

        res.status(200).json({ message: 'Reset password successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password', error });
    }
};

module.exports = { updateUser, deleteUser, getAllUsers, getUserByPkId, getTotalAccounts, getCompanyByRating, getAverageRatingByUserId, getListCompany, updateUserStatus, forgetPassword, resetPassword };
