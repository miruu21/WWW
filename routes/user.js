const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Check username availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (user) return res.json({ available: false });
        res.json({ available: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Verify Email (send code)
router.post('/send-email', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Save code in-memory or DB (for production use Redis or DB)
    emailCodes[email] = code;
    await sendVerificationEmail(email, code);
    res.json({ message: 'Email sent' });
});

// ✅ Verify email code
router.post('/verify-email', (req, res) => {
    const { email, code } = req.body;
    if (emailCodes[email] === code) {
        delete emailCodes[email];
        return res.json({ verified: true });
    }
    res.status(400).json({ verified: false });
});

// ✅ Phone OTP (pseudo logic, integrate Twilio or similar)
router.post('/send-phone', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    phoneCodes[phone] = otp;
    // send OTP via SMS service
    res.json({ message: 'OTP sent' });
});

router.post('/verify-phone', (req, res) => {
    const { phone, otp } = req.body;
    if (phoneCodes[phone] === otp) {
        delete phoneCodes[phone];
        return res.json({ verified: true });
    }
    res.status(400).json({ verified: false });
});

// ✅ Final signup
router.post('/complete-signup', async (req, res) => {
    try {
        const { fullName, username, email, phone, businessName, dateOfBirth, referralCode } = req.body;

        const newUser = new User({
            fullName,
            username,
            email,
            phone,
            businessName,
            dateOfBirth,
            referralCode
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Error saving user', error: err.message });
    }
});

module.exports = router;
