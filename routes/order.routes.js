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

        const cartItemsWithDetails = await Promise.all(cart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                productId: item.productId,
                price: product.price,
                quantity: item.quantity
            };
        }));
        let totalAmount = 0;
        cartItemsWithDetails.forEach(element => {
            totalAmount += (element.price * element.quantity);

        });

        const transformedArray = cartItemsWithDetails.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        const { Address, phoneNumber } = req.body;
        if (!Address || !phoneNumber) {
            return res.status(400).json({ error: 'Missing required fields Address and phoneNumber' });
        }

        const order = new Order({
            userId,
            items: transformedArray,
            totalAmount,
            Address,
            phoneNumber

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

// GET endpoint to fetch all orders of a user
router.get('/orders', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Validate request parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find all orders of the user
        const orders = await Order.find({ userId });
        if (!orders) {
            return res.status(404).json({ error: 'There the No orders for this user' });
        }


        const transformedData = orders.map((item) => ({
            OrderId: item._id,
            phoneNumber: item.phoneNumber,
            Address: item.Address,
            totalAmount: item.totalAmount,
            status: item.status
        }));


        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


router.get('/orders-details/:orderId', authMiddleware, isCustomer, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        let { orderId } = req.params;
        // Validate request parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Find all orders of the user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'There the No order for this order id' });
        }

        if (order.userId != userId) {
            return res.status(403).json({ error: 'Not allow to access this order ' });
        }

        const orderItemsWithDetails = await Promise.all(order.items.map(async (item) => {
            const product = await Product.findById(item.productId);

            if (product) {
                return {
                    productId: item._id,
                    price: product.price,
                    quantity: item.quantity,
                    productName: product.productName,
                    image: product.image,
                    description: product.description
                };
            }


        }));


        // Remove null values from the array
        let productsData = orderItemsWithDetails.filter(obj => obj != null);

        res.json(productsData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


//===================================================================================
//                              ADMIN OPRETIONS FOR ORDERS
//===================================================================================


router.get('/orders-details-admin/:orderId', authMiddleware, isAdmin, async (req, res, next) => {
    try {

        let { orderId } = req.params;
        // Validate request parameters

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Find all orders of the user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'There the No order for this order id' });
        }


        const orderItemsWithDetails = await Promise.all(order.items.map(async (item) => {
            const product = await Product.findById(item.productId);

            if (product) {
                return {
                    productId: item._id,
                    price: product.price,
                    quantity: item.quantity,
                    productName: product.productName,
                    image: product.image,
                    description: product.description
                };
            }


        }));


        // Remove null values from the array
        let productsData = orderItemsWithDetails.filter(obj => obj != null);

        res.json(productsData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


router.get('/orders-admin', authMiddleware, isAdmin, async (req, res, next) => {
    try {
        // Find all orders of the user
        const orders = await Order.find();
        if (!orders) {
            return res.status(404).json({ error: 'There the No orders for this user' });
        }
        const transformedData = orders.map((item) => ({
            OrderId: item._id,
            phoneNumber: item.phoneNumber,
            Address: item.Address,
            totalAmount: item.totalAmount,
            status: item.status
        }));

        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


router.delete('/orders-admin/:orderId', authMiddleware, isAdmin, async (req, res, next) => {
    try {

        let { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: `Order with Order ID - ${orderId} is not found.` });
        }
        res.json({ message: `Order with ${orderId} is removed successfully.` })

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


router.put('/orders-admin/:orderId', authMiddleware, isAdmin, async (req, res, next) => {
    try {

        let { orderId } = req.params;
        const { status } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        if (!status) {
            return res.status(400).json({ error: ' status is required' });
        }
        // Find all orders of the user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'There the No order for this order id' });
        }
        order.status = status;

        const updatedOrder = await order.save();

        res.json(updatedOrder);

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
//===================================================================================

module.exports = router;
