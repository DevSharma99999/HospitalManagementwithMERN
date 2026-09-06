import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";

export const getMyAvailability = async (req, res, next) => {
    try {
        const existingSlot = await doctorAvailable.findOne({ doctor_id: req.user._id });

        if (existingSlot) {
            return res.status(200).json({
                success: true,
                message: "Doctor availability fetched successfully.",
                data: {
                    workingHours: existingSlot.workingHours,
                    breaks: existingSlot.breaks,
                    slotDurationMinutes: existingSlot.slotDurationMinutes,
                    bufferMinutes: existingSlot.bufferMinutes
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No existing schedule found.",
                data: { workingHours: [], breaks: [], slotDurationMinutes: 20, bufferMinutes: 10 }
            });
        }
    } catch (error) {
        console.error("Fetch availability error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching availability." });
    }
};