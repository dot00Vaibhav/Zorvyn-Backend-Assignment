const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Please provide an amount']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Please provide the type (income or expense)']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category']
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
