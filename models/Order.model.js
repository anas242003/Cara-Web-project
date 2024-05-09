const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema(
    {
        userId: {
            type: Number,
            ref: 'User',
            required: true
        },

        orderNumber: {
            type: String,
            require: true
        },
        phoneNumber: {
            type: String,
            require: true
        },
        Address: {
            type:Schema.Types.ObjectId,
            ref: "Address",
            require: true
        },

        
        totalAmount: {
            type: Number,
            require: true
        },

        status: {
            type: String,
            enum: ["Order Created", 'processing', 'shipped', 'delivered'],
            default: "Order Created",
        }, 


        content: [{
            productImg: {
                type: String,
            },
            productId:{
                type: String,
                require: true
            },
            productName: {
                type: String,
                require: true
            },
            price: {
                type:Number,
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