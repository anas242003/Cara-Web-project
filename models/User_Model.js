const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    }
}, {
    timestamps: true
});


const User = mongoose.model('User', userSchema);

module.exports = User;