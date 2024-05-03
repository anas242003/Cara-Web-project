const { Schema, model } = require("mongoose");
const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: 'https://drive.google.com/file/d/1C7ZnQZjSuFHNjIiicKTFB967Rb-zBvl_/view?usp=sharing',
        },

        quantity: {
            type: Number,
            required: true,
        },

    },
    {
        timestamps: true
    }
);

const Product = model("Product", productSchema);

module.exports = Product;