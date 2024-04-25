const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const connectToMongoDB = require('./db/mongoose');

const app = express();

// Middleware
app.use(express.json());

// Mount user routes
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// // Connect to MongoDB
// connectToMongoDB();
