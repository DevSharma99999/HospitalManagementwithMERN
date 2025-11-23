// --- File: ../controller/patientProfileController.js (Corrected) ---

import { patient } from "../mongoose modules/patientModule.js";
export const patient_profile_controller= async (req, res)=>{
    
    // 🛑 FIX: Get the authenticated user ID from the standard req.user object
    const _id = req.user._id; 
    
    // NOTE: The 'if(!_id)' check is largely redundant if the middleware verified the token.
    if(!_id){ 
        return res.status(401).json({ // Use 401 Unauthorized here
            success:false,
            message:"Authentication failed: User ID is required."
        });
    }
    
    try{
        // 🛑 FIX 2: Ensure all fields needed for the frontend are selected
        const patientData = await patient.findById(_id).select(
            // Added phone_number and gender as requested by the frontend HTML
            'firstName lastName dob address reason medicalHistory email phone_number gender'
        ).lean(); // .lean() is good for faster reads

        if(!patientData){
            return res.status(404).json({
                success:false,
                message: "Patient record not found."
            });
        }
        
        // Success: Return the data
        res.status(200).json({
            success:true,
            message:"Data retrieved successfully",
            patientData // Return the data object with a clear key
        });
    }
    catch(error){
        console.error("Error retrieving patient data:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
}