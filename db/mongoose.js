const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;


mongoose.connect(url).then(()=>{
    console.log("connected to MongDB")
})

// module.exports = main;
