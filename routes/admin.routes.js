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
router.get('/get-all-users', async (req, res) => {
    try {
        // Get the JWT token from the Authorization header
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const loggedInUserRole = decodedToken.role;

        // Check if the user's role is 'admin'
        if (loggedInUserRole !== 'admin') {
            // If the user is not an admin, return a 403 Forbidden status code
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If the user is an admin, fetch all users
        const users = await getallusers();

        // Return the list of users
        res.json(users);
    } catch (error) {
        // Handle any errors
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
