const express = require('express');
const { default: mongoose } = require('mongoose');
const morgan = require("morgan");
const router = express.Router();

// connecting to the MongDB server
const url = "mongodb+srv://anaseladly:24102754@cara-cluster.murcxyh.mongodb.net/Cara"
mongoose.connect(url).then(() => {
    console.log("Connected to MongoDb server")
})

// logging the requests using morgan 
router.use(morgan('common'))

// User routes
// Register a new user
router.post('/register', (req, res) => {
    res.json(temp)
});
  
  // Login
  router.post('/login', (req, res) => {
    res.send("Hello world");
});

// get user data using ID 
router.get('/profile/:id', (req, res) => {

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
