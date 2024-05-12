const express = require('express');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const dbconnect = require("./db/mongoose");
const { db } = require('./models/User_Model');


const app = express();
dbconnect();

const cors = require('cors');
app.use(cors());


// Middleware
app.use(express.json());
// Mount user routes
app.use('/api/users', userRoutes);


const productRouter = require("./routes/product.routes");
app.use("/api", productRouter);

const cartRouter = require("./routes/cart.routes");
app.use("/api", cartRouter);

const ordersRouter = require("./routes/order.routes");
app.use("/api", ordersRouter);


const adminRouter = require("./routes/admin.routes");
app.use("/api/admin", adminRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

