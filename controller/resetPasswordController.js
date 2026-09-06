import { doctor } from '../mongoose modules/doctormodule.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailsSender.js';

export const resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Missing reset token or new password."
        });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const foundDoctor = await doctor.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!foundDoctor) {
            return res.status(400).json({
                success: false,
                message: "Password reset link is invalid or has expired. Please request a new one."
            });
        }

        // doctorSchema's pre("save") hook already hashes this — no manual bcrypt needed here
        foundDoctor.password = newPassword;
        foundDoctor.resetPasswordToken = undefined;
        foundDoctor.resetPasswordExpires = undefined;
        await foundDoctor.save();

        return res.status(200).json({
            success: true,
            message: "Password has been successfully updated. You can now log in with your new password.",
            redirectUrl: "/doctor-login"
        });

    } catch (error) {
        console.error("Doctor Password Reset Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during password update." });
    }
};