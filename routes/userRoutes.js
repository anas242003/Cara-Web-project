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

const nodemailer = require('nodemailer');


// logging the requests using morgan 
router.use(morgan('common'))

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
    );
};

// User routes
// Register a new user
router.post('/adduser', async (req, res) => {
    const email = req.body.email;

    try {
        // Check if user with the given email already exists
        const findUser = await User.findOne({ email: email });

        if (findUser) {
            // User already exists, send response to the client
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword; // Replace plain password with hashed password

        // Create new User

        const newUser = await User.create(req.body);
        res.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error); // Log the error
        res.status(500).json({ message: "Internal server error" }); // Send generic error response
    }
});





// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email == process.env.AdminEmail && password == process.env.AdminPassword) {
            const payload = { email: process.env.AdminEmail, password: process.env.AdminPassword, role: 'admin', userId: 15, username: 'Administrator' };
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { algorithm: 'HS256', expiresIn: '2h' }
            );
            return res.json({ token: token, isAdmin: true });

        }

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and if the password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const payload = { email: user.email, fullName: user.username, userId: user.userId, role: 'customer' };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '2h' }
        );

        res.json({ token: token, isAdmin: false });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const { ObjectId } = require('mongodb');

router.get('/profile', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Validate request parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }


        // Fetch user profile
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/change-password', async (req, res) => {
    try {
        // Get user ID from JWT token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Extract old and new passwords from request body
        const { oldPassword, newPassword } = req.body;

        // Fetch user from the database based on userId
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the old password provided by the user matches the password stored in the database
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in the database
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});




router.patch('/update-user', async (req, res) => {
    try {
        // Get user ID from JWT token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Extract password, username, and email from request body
        const { password, username, email } = req.body;

        // Fetch user from the database based on userId
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the provided password matches the password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }


        // Save the updated user information to  the database
        console.log(userId);
        const update = await User.updateOne({ userId: userId }, { email: email, username: username });

        const returneduser = await User.findOne({ userId: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        return res.json({ message: 'User information updated successfully', returneduser });
    } catch (error) {
        console.error('Error updating user information:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
