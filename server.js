const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const dbconnect = require("./db/mongoose");
const { db } = require('./models/User_Model');


const app = express();
dbconnect();

// Middleware
app.use(express.json());
// Mount user routes
app.use('/api/users', userRoutes);


const productRouter = require("./routes/product.routes");
app.use("/api", productRouter);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

