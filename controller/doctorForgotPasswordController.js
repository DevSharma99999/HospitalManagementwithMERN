// --- File: controller/doctorForgotPasswordController.js ---

import { doctor } from '../mongoose modules/doctormodule.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailsSender.js';

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Please provide your registered email address." });
    }

    try {
        const searchEmail = email.trim().toLowerCase();
        const foundDoctor = await doctor.findOne({ email: searchEmail });

        if (!foundDoctor) {
            // Security best practice: same generic response whether or not the account exists
            return res.status(200).json({
                success: true,
                message: "If an account is associated with this email, a reset link has been sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        foundDoctor.resetPasswordToken = hashedToken;
        foundDoctor.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await foundDoctor.save();

        const resetUrl = `${process.env.FRONTEND_BASE_URL}/doctor-reset-password/${resetToken}`;

        // Respond first, send email in background — consistent with your other auth flows
        res.status(200).json({
            success: true,
            message: "If an account is associated with this email, a reset link has been sent."
        });

        sendPasswordResetEmail(foundDoctor.email, `Dr. ${foundDoctor.firstName}`, resetUrl)
            .catch(err => console.error("Error sending doctor password reset email:", err));

    } catch (error) {
        console.error("Doctor Forgot Password Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during password request." });
    }
};