// --- File: ../controller/forgetPasswordController.js ---

// Use an alias to avoid conflict with the variable 'foundDoctor'
import { doctor } from '../mongoose modules/doctormodule.js';
import crypto from 'crypto';
import { sendSMS } from '../utils/smsService.js';
// --- If your server is crashing here, ensure 'crypto' and 'sendSMS' are properly imported and available ---

export const forgotPassword = async (req, res, next) => {
    console.log("hell");

    // 🛑 FIX 1: Destructure the VALUE from the correct key sent by the HTML form ('medical_license')
    const { medical_license } = req.body;

    // The query variable is now the string value, not the whole object
    const licenceValue = medical_license;

    // Log the actual string value
    console.log("Searching for string value:", licenceValue);

    if (!licenceValue) {
        return res.status(400).json({ success: false, message: "Please provide your Medical License number." });
    }

    try {
        // Prepare the value (trimming for safety)
        const searchLicense = licenceValue.trim();

        // 🛑 FIX 2: Pass the string value (searchLicense) to the correct DB field name (medical_licence_number)
        const foundDoctor = await doctor.findOne({ medical_licence_number: searchLicense });

        if (!foundDoctor) {
            // Security Best Practice: Send generic success even on not found
            return res.status(200).json({
                success: true,
                message: "If an account is associated with this license, a link will be sent."
            });
        }
        // 2. Generate a secure, unique, and time-limited token
        const resetToken = crypto.randomBytes(32).toString('hex');
        console.log(resetToken, "resetToken");
        // 3. Save the token and expiration time
        foundDoctor.resetPasswordToken = resetToken; // Use foundDoctor here
        foundDoctor.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        console.log("hell5");

        await foundDoctor.save(); // Use foundDoctor here

        // 4. Construct the secure reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/doctor-reset-password?token=${resetToken}`;

        // 5. Send the SMS using Twilio utility
        const message = `Dear Dr., you requested a password reset. Click this secure link to set a new password: ${resetUrl}. This link expires in one hour.`;
        console.log("hell2");
        const phonenumber=`+91${foundDoctor.phone}`;
        await sendSMS(phonenumber, message); // Use foundDoctor here
        console.log("hell3");

        // 6. Respond to the client
        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your registered phone number."
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Patient Registration Error:", error);

        // Send a generic 500 error back to the client
        res.status(500).json({ success: false, message: "Internal server error during password request." });
    }
};