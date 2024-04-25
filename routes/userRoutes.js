const express = require('express');
const morgan = require("morgan");
const router = express.Router();
const User = require("../models/User_Model")
const mongoose = require('mongoose');

// logging the requests using morgan 
router.use(morgan('common'))

// User routes
// Register a new user
router.post('/register', (req, res) => {
    res.json(temp)
});

// Define an asynchronous function to fetch all users
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
        const users = await getallusers(); // Call the asynchronous function
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Login
router.post('/login', (req, res) => {
    res.send("Hello world");
});

// get user data using ID 


const { ObjectId } = require('mongodb');

router.get('/profile/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.find({ username: username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





router.put('/change-password', (req, res) => {
    // Implement logic to change user password
});

router.post('/forgot-password', (req, res) => {
    // Implement logic to handle forgot password request
});

router.post('/upload-profile-picture', (req, res) => {
    // Implement logic to handle profile picture upload
});

router.delete('/delete-account', (req, res) => {
    // Implement logic to delete user account
});

module.exports = router;
