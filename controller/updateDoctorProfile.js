// --- File: ../controller/doctorProfileController.js ---

import { doctor } from '../mongoose modules/doctormodule.js';

export const updateDoctorProfile = async (req, res) => {
    // 1. Get the authenticated doctor's ID from the JWT (set by doctorverifyJWT)
    const doctorId = req.user._id; 
    
    // 2. Define allowed fields for update 
    const { 
        firstName, 
        lastName,
        qualifications, 
        experience_years, 
        clinic_address, 
        consultancyFee,
        phone 
    } = req.body;

    // 3. Validation
    if (!firstName || !lastName || !qualifications || !clinic_address || !phone || isNaN(parseInt(experience_years)) || isNaN(parseInt(consultancyFee))) {
         return res.status(400).json({ success: false, message: "All required fields must be valid." });
    }

    try {
        const updatedDoctor = await doctor.findByIdAndUpdate(
            doctorId,
            { 
                firstName,
                lastName,
                qualifications,
                experience_years: parseInt(experience_years), 
                clinic_address, 
                consultancyFee: parseInt(consultancyFee),
                phone: String(phone) // Ensure phone is saved as string (per schema)
            },
            // Return the updated document, run schema validators, and exclude sensitive data
            { new: true, runValidators: true, select: '-password -resetPasswordToken' } 
        );

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor profile not found." });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully.", 
            profile: updatedDoctor 
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        // Handle unique constraint violation (e.g., if phone number is unique and already exists)
        if (error.code === 11000) {
             return res.status(409).json({ success: false, message: "A doctor with this input already exists." });
        }
        res.status(500).json({ success: false, message: "Internal server error during profile update." });
    }
};