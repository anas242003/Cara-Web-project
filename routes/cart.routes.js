const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart.js');
const { authMiddleware } = require('../middleware/jwt.middleware');
const { isAdmin, isCustomer } = require('../middleware/guard.middleware.js');
const Product = require('../models/Product.model.js');
// POST endpoint to add a product to the cart
router.post('/cart/add', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;

        // Validate request body
        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if the product already exists in the cart
        const existingItemIndex = cart.items.findIndex(item => String(item.productId) === String(productId));

        if (existingItemIndex !== -1) {
            // If the product already exists in the cart, update its quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Otherwise, add the product to the cart
            cart.items.push({ productId, quantity });
        }

        // Save the updated cart to the database
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
});



// DELETE endpoint to remove a CartItem from the user's cart
router.delete('/cart/items/:productId', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        // Validate request parameters
        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user' });
        }

        // Remove the specified CartItem from the cart
        cart.items = cart.items.filter(item => String(item.productId) !== productId);

        // Save the updated cart to the database
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error removing CartItem from cart:', error);
        res.status(500).json({ error: 'Failed to remove CartItem from cart' });
    }
});

//==================

// GET endpoint to retrieve cart items with product details
router.get('/cart/items', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;


        // Validate request parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user' });
        }

        // Fetch product details for each item in the cart
        const cartItemsWithDetails = await Promise.all(cart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                productName: product.productName,
                productId: item.productId,
                image: product.image,
                price: product.price,
                quantity: item.quantity
            };
        }));

        const transformedArray = cartItemsWithDetails.map((item) => ({
            id: item.productId,
            img: item.image || 'https://static.zara.net/assets/public/021c/20d6/25814622a083/64986afc4fe8/04408474250-p/04408474250-p.jpg?ts=1706111329442&w=824', // Assuming your original object has an 'image' property
            name: item.productName || '',
            price: item.price || 0,
            quantity: item.quantity

        }));

        res.json(transformedArray);
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).json({ error: 'Failed to retrieve cart items' });
    }
});
//--

router.get('/cart/totalAmount', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Validate request parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user' });
        }

        // Fetch product details for each item in the cart
        const cartItemsWithDetails = await Promise.all(cart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                price: product.price,
                quantity: item.quantity
            };
        }));
        let totalAmount = 0;
        cartItemsWithDetails.forEach(element => {
            totalAmount += (element.price * element.quantity);
        });

        res.json({ totalAmount: totalAmount });
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).json({ error: 'Failed to retrieve cart items' });
    }
});
module.exports = router;
