const Review = require('../models/Review');
const User = require('../models/User');

const ReviewController = {
    createReview: async (req, res) => {
        try {
            const { userId, reviewerId, rating, reason } = req.body;
            if (!userId || !rating || !reviewerId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const existingReview = await Review.findOne({ where: { userId, reviewerId } });
            if (existingReview) {
                return res.status(400).json({ error: 'You have been reviewed' });
            }
            const review = await Review.create({ reviewerId, userId, rating, reason });
            res.status(201).json({ message: 'Review created successfully', data: review });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getListRatings: async (req, res) => {
        try {
            const userId = req.userId;
            const ratings = await Review.findAll({
                where: { userId },
                attributes: ['id', 'reviewerId', 'reason', 'rating', 'createdAt'],
                order: [['createdAt', 'DESC']],
            });

            if (!ratings.length) {
                return res.status(404).json({ message: 'There are no ratings' });
            }

            res.status(200).json({ data: ratings });
        } catch (error) {
            res.status(500).json({ message: 'errors when get reviews', error });
        }
    },
};

module.exports = ReviewController;