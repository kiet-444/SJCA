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
};

module.exports = ReviewController;