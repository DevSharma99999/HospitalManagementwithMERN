

import { doctor } from "../mongoose modules/doctormodule.js";

export const doctorLoginAuth = async (req, res, next) => {
    const { medical_licence_number, password } = req.body;

    if (!medical_licence_number || !password) {
        return res.status(400).json({ success: false, message: "License number and password are required." });
    }

    try {
        // 1. Find the doctor by medical license number
        // NOTE: If you save the password with {select: false} in the schema, you must use .select("+password") here.
        const foundDoctor = await doctor.findOne({ medical_licence_number }).select("+password"); 
        
        if (!foundDoctor) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 2. Validate the password (You must implement this method on the doctorSchema)
        const isPasswordValid = await foundDoctor.isPasswordCorrect(password); 
        
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 3. Generate a new token upon successful login
        const accessToken = foundDoctor.generateDoctorAccessToken();

        // 4. Success response (200 OK)
        return res.status(200).json({
            success: true,
            message: `Welcome back, Dr. ${foundDoctor.lastName}!`,
            accessToken
        });

    } catch (error) {
        console.error("Doctor Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during login." });
    }
};