
// File: controller/getDoctorAvailability.js

import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";

export const getMyAvailability = async (req, res, next) => {
    try {
        // req.user._id is populated by the doctorverifyJWT middleware
        const existingSlot = await doctorAvailable.findOne({
            doctor_id: req.user._id,
        });

        if (existingSlot) {
            // Return the existing schedule data
            return res.status(200).json({
                success: true,
                message: "Doctor availability fetched successfully.",
                data: {
                    workingDays: existingSlot.workingDays,
                    availableTime: existingSlot.availableTime,
                },
            });
        } else {
            // No schedule found, which is a success for loading, but with empty data
            return res.status(200).json({ 
                success: true,
                message: "No existing schedule found.",
                data: {
                    workingDays: [],
                    availableTime: [],
                }
            });
        }
    } catch (error) {
        console.error("Fetch availability error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching availability."
        });
    }
};