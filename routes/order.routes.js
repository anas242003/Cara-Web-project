const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart.js');
const Order = require('../models/Order.model.js');
const Product = require('../models/Product.model.js');
const { authMiddleware } = require('../middleware/jwt.middleware');
const { isAdmin, isCustomer } = require('../middleware/guard.middleware.js');


// POST endpoint to create an order
router.post('/orders/create', authMiddleware, isCustomer, async (req, res, next) => {
    try {

        const userId = req.user.userId;
        // Validate request body
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user' });
        }

        // Create an order object based on cart items
        const orderItems = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price // Assuming the price is stored in the cart item
        }));
        const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

        const order = new Order({
            userId,
            items: orderItems,
            totalAmount
        });

        // Save the order to the database
        await order.save();

        // Clear the user's cart (remove all items)
        cart.items = [];
        await cart.save();

        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

module.exports = router;
