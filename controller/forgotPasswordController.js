// File: controller/forgotPasswordController.js

import crypto from "crypto";
import { patient } from "../mongoose modules/patientModule.js";
import { sendPasswordResetEmail } from "../utils/emailsSender.js";

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    try {
        const existingPatient = await patient.findOne({ email });

        // 🔒 Always return the same success message whether or not the email exists —
        // prevents leaking which emails are registered.
        if (!existingPatient) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a reset link has been sent."
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        existingPatient.resetPasswordToken = hashedToken;
        existingPatient.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await existingPatient.save();

        const resetLink = `${process.env.FRONTEND_BASE_URL}/patient/reset-password/${rawToken}`;

        // Respond first, send email in background — consistent with your other flows
        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a reset link has been sent."
        });

        sendPasswordResetEmail(existingPatient.email, existingPatient.firstName, resetLink)
            .catch(err => console.error("Error sending password reset email:", err));

    } catch (error) {
        console.error("Request Password Reset Error:", error);
        return res.status(500).json({ success: false, message: "Server error while processing request." });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required." });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const existingPatient = await patient.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link. Please request a new one."
            });
        }

        existingPatient.password = newPassword; // pre("save") hook will hash it
        existingPatient.resetPasswordToken = null;
        existingPatient.resetPasswordExpires = null;
        await existingPatient.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now log in.",
            redirectUrl: "/patient/login"
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ success: false, message: "Server error while resetting password." });
    }
};