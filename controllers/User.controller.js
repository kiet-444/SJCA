const { Op } = require('sequelize');
const User = require('../models/User');
const Review = require('../models/Review');

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
            const ratings = company.Reviews.map(review => review.rating);
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
        const { id } = req.params;
        const { password, ...updates } = req.body;


        const user = await User.findById(id);


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (user.role === 'admin' && user.firstLogin) {
            if (password) {
                user.password = password;
                user.firstLogin = false;
                await user.save();
                return res.status(200).json({ message: 'Password updated successfully for first login', data: user });
            } else {
                return res.status(400).json({ message: 'Password is required for first login' });
            }
        }
       
        if (password) {
            user.password = password;
            await user.save();
            return res.status(200).json({ message: 'Password updated successfully', data: user });
        }


        Object.assign(user, updates);
        const updatedUser = await user.save();


        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;


        const deletedUser = await User.findByIdAndDelete(id);
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



const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get user', error });
    }
};


module.exports = { updateUser, deleteUser, getAllUsers, getUserById, getCompanyByRating, getListCompany };
