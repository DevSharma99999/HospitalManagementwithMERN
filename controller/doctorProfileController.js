// --- File: ../controller/doctorProfileController.js ---

import { doctor } from '../mongoose modules/doctormodule.js';

export const getDoctorProfile = async (req, res) => {
    // 1. Get the authenticated doctor's ID from the JWT (set by doctorverifyJWT middleware)
    const doctorId = req.user._id; 

    try {
        // 2. Fetch the profile data
        // Use select: '-password -resetPasswordToken' to ensure sensitive fields are excluded
        const profile = await doctor.findById(doctorId).select('-password -resetPasswordToken -__v');

        if (!profile) {
            // This should ideally not happen if the token is valid, but it's a safety check
            return res.status(404).json({ success: false, message: "Doctor profile not found." });
        }

        // 3. Success response
        return res.status(200).json({ 
            success: true,
            message: "Profile retrieved successfully.",
            data: profile
        });

    } catch (error) {
        console.error("Profile Retrieval Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during profile retrieval." });
    }
};