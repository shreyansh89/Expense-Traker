
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    amount: {
        type: Number,
    },
    paymentMethod: {
        type: String,
    },
    adminId: {
        type: mongoose.Schema.ObjectId,
        ref: 'admin',

    },
    Created_date: {
        type: String,
    },
    Updated_date: {
        type: String,
    },


})

const userpanel = mongoose.model("user", userSchema);


module.exports = userpanel;