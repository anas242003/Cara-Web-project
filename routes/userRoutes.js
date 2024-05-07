const express = require('express');
const morgan = require("morgan");
const router = express.Router();
const User = require("../models/User_Model")
const asyncHandler = require("express-async-handler") 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// logging the requests using morgan 
router.use(morgan('common'))

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};



const getallusers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error; // Re-throw the error to be handled elsewhere
    }
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

// Define an asynchronous function to fetch all users

// Define the route handler for fetching all users
router.get('/get-all-users', async (req, res) => {
    try {
        const users = await getallusers(); // Call the asynchronous function
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and if the password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token with user's ID
        const token = generateToken(user.userId);

        // Send token in response
        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// get user data using ID 


const { ObjectId } = require('mongodb');

router.get('/profile', async (req, res) => {
    try {
        // Get user ID from JWT token
        const token = req.headers.authorization.split(' ')[1]; // Assuming JWT token is passed in the Authorization header
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const loggedInUserId = decodedToken.userId;

        // Fetch user profile
        const user = await User.findOne({ userId: loggedInUserId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
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


router.post('/upload-profile-picture', (req, res) => {
    // Implement logic to handle profile picture upload
});

router.delete('/delete-account', async (req, res) => {
    try {
        // Extract user ID from JWT token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Find user by user ID and delete it
        const deletedUser = await User.findOneAndDelete({ userId: userId });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
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
        const { password, newUsername, newEmail } = req.body;

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

        // Update user's username and email with new values
        if (newUsername) {
            user.username = newUsername;
        }
        if (newEmail) {
            user.email = newEmail;
        }

        // Save the updated user information to the database
        await user.save();

        res.json({ message: 'User information updated successfully' });
    } catch (error) {
        console.error('Error updating user information:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
