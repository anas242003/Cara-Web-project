const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema(
    {
        userId: {
            type: Number,
            ref: 'User',
            required: true
        },

        // orderNumber: {
        //     type: String,
        //     require: true
        // },
        phoneNumber: {
            type: String,
            require: true
        },
        Address: {
            type: String,
            require: true
        },


        totalAmount: {
            type: Number,
            require: true
        },

        status: {
            type: String,
            //enum: ["Order Created", 'processing', 'shipped', 'delivered'],
            default: "Order Created",
        },


        items: [{
            productId: {
                type: String,
                require: true
            },
            
            quantity: {
                type: Number,
                require: true
            }
        }]
    },
    {
        timestamps: true
    }
);

module.exports = model('Order', orderSchema);