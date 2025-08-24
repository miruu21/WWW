const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, code) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'HerHub Email Verification',
        text: `Your verification code is: ${code}`
    });
}

module.exports = sendVerificationEmail;
