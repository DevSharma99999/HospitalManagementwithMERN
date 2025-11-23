// --- File: ../controller/patientProfileController.js (Add this new export) ---

import { patient } from '../mongoose modules/patientModule.js'; // Assuming this is correct

export const updatePatientProfile = async (req, res) => {
    // 1. Get the authenticated patient's ID from the JWT (set by patientverifyJWT)
    const patientId = req.user._id; 
    
    // 2. Define allowed fields for update
    const { 
        firstName, 
        lastName, 
        dob, // Date of Birth
        gender,
        phone_number,
        address,
        reason,
        medicalHistory
        // Note: Email is often restricted from updates or requires special verification
    } = req.body;

    // 3. Simple Validation
    if (!firstName || !lastName || !phone_number || !dob) {
         return res.status(400).json({ success: false, message: "First Name, Last Name, Phone, and DOB are required fields." });
    }

    try {
        const updatedPatient = await patient.findByIdAndUpdate(
            patientId,
            { 
                firstName, 
                lastName, 
                dob: new Date(dob), // Convert string back to Date object
                gender,
                phone_number,
                address,
                reason,
                medicalHistory,
                profile_complete: 'yes' // Mark profile as complete after update
            },
            // Return the new document and run schema validators
            { new: true, runValidators: true, select: '-__v' } 
        );

        if (!updatedPatient) {
            return res.status(404).json({ success: false, message: "Patient record not found." });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully.", 
            data: updatedPatient 
        });

    } catch (error) {
        console.error("Patient Profile Update Error:", error);
        // Handle unique constraint violation (e.g., if phone or email already exists)
        if (error.code === 11000) {
             return res.status(409).json({ success: false, message: "A user with this phone number or email already exists." });
        }
        res.status(500).json({ success: false, message: "Internal server error during profile update." });
    }
};