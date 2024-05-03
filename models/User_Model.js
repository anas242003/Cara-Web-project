const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    
    userId: {
        type: Number,
        unique: true,
    },

    isnew : {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer'
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

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isnew) {
        return next(); // If not a new user, proceed without generating an ID
    }

    try {
        // Find the maximum userId in existing users and increment it by 1
        const maxUserId = await User.findOne({}, {}, { sort: { 'userId': -1 } });

        // If no existing users, start with 1, else increment the maximum userId
        user.userId = maxUserId ? maxUserId.userId + 1 : 1;
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;