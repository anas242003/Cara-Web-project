const express = require('express');
const morgan = require("morgan");
const router = express.Router();
const User = require("../models/User_Model")
const asyncHandler = require("express-async-handler")
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/jwt.middleware');
const { isAdmin, isCustomer } = require('../middleware/guard.middleware.js');


router.use(morgan('common'))

const getallusers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error; // Re-throw the error to be handled elsewhere
    }
};

// Define the route handler for fetching all users
router.get('/get-all-users', authMiddleware, isAdmin, async (req, res , next) => {
    try {
        console.log(req.user.email);
        console.log(req.user.userId);
        console.log(req.user.role);
        const users = await getallusers(); // Call the asynchronous function
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete-user/:userId',authMiddleware, isAdmin, async (req, res,next) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findOneAndDelete({ userId }); // Using userId as the search criteria
        if (!deletedUser) {
            return res.status(404).json({ message: `User with ID ${userId} is not found.` });
        }
        res.json({ message: `User with ID ${userId} has been deleted successfully.` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Failed to delete user` });
    }
});

module.exports = router;
