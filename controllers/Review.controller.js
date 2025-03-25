const Review = require('../models/Review');
const User = require('../models/User');

const ReviewController = {
    createReview: async (req, res) => {
        try {
            const { userId, rating } = req.body;
            if (!userId || !rating) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const review = await Review.create({ userId, rating });
            res.status(201).json({ message: 'Review created successfully', data: review });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getListRatings: async (req, res) => {
        try {
            const { userId } = req.query; 

            const whereClause = {}; 

            if (userId) {
                whereClause.userId = userId;
            }

            const ratings = await Review.findAll({
                where: whereClause,
                attributes: ['id', 'userId', 'rating', 'createdAt'],
                order: [['createdAt', 'DESC']], 
            });

            if (!ratings.length) {
                return res.status(404).json({ message: 'Không có đánh giá nào' });
            }

            res.status(200).json({ data: ratings });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá', error });
        }
    },
};

module.exports = ReviewController;