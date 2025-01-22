const User = require('../models/User');


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
        const users = await User.find();
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


module.exports = { updateUser, deleteUser, getAllUsers, getUserById };
