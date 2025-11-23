import { doctor } from '../mongoose modules/doctormodule.js';
import bcrypt from 'bcrypt';
import { sendSMS } from '../utils/smsService.js';
// Assuming you have a standard hashing setup (e.g., 10 salt rounds)
const SALT_ROUNDS = 10; 

export const resetPassword = async (req, res, next) => {
    // 1. Get the token from the URL query and the new password from the body
    const { token } = req.query; // e.g., /reset-password?token=XYZ
    const { newPassword } = req.body; 

    if (!token || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing reset token or new password." 
        });
    }

    try {
        // 2. Find the Doctor by Token AND ensure the token is not expired
        const doctorgi = await doctor.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // $gt means 'greater than' (i.e., in the future)
        });

        if (!doctorgi) {
            // Token is invalid, expired, or doesn't match
            return res.status(400).json({ 
                success: false, 
                message: "Password reset link is invalid or has expired. Please request a new one." 
            });
        }
        
        // --- SECURE PASSWORD UPDATE ---
        
        // 3. Hash the new password securely
        // const salt = await bcrypt.genSalt(SALT_ROUNDS);
        // const passwordHash = await bcrypt.hash(newPassword, salt);

        // 4. Update the doctor's document
        doctorgi.password = newPassword;
        // CRUCIAL: Clear the token and expiration fields to prevent reuse
        doctorgi.resetPasswordToken = undefined;
        doctorgi.resetPasswordExpires = undefined;

         await doctorgi.save();
        
        // 5. Send final confirmation (optional, but good practice)
        const confirmationMessage = `Dear Dr., your password has been successfully reset.`;
        const phone=`+91${doctorgi.phone}`;
        await sendSMS(phone, confirmationMessage); 
        
        // 6. Success Response
        return res.status(200).json({
            success: true,
            message: "Password has been successfully updated. You can now log in with your new password.",
            redirectUrl: "/doctor-login"
        });

    } catch (error) {
        console.error("Password Reset Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during password update." });
    }
};