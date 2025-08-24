const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // New field
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    businessName: { type: String, default: '' }, // Optional for now
    dateOfBirth: { type: Date, required: true },
    referralCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


