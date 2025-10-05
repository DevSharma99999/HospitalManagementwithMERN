import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js"

export const addAvailability = async (req, res, next) => {
    const { dayOfWeek, start_time, end_time } = req.body;

    if (!dayOfWeek || !start_time || !end_time) {
        return res.status(400).json({
            success: false,
            message: "day of week,starttime and end time all are required."
        });
    }

    try {
        const doc_profile = await doctor.findOne({ user_id: req.user._id });
        if (!doc_profile) {
            return res.status(404).json({
                success: false,
                message: "doctor profile not found."
            });
        }

        const existingSlot = await doctorAvailable.findOne({
            doctor_id: doc_profile._id,
            dayOfWeek: dayOfWeek
        });
        if (existingSlot) {
            return res.status(409).json({
                success: false,
                message: `availability already exists for day ${dayOfWeek}`
            });
        }

        const newslot = await doctorAvailable.create({
            doctor_id: doc_profile._id,
            dayOfWeek,
            start_time,
            end_time,
        });
        return res.status(201).json({
            success: true,
            message: "booking of slot done successfully.",
            data: newslot
        });

    } catch (error) {
        console.error("add availability error", error);
        return res.status(500).json({
            success: false,
            message: "server error while adding availability."
        });
    }
};


export const getMyAvailability = async (req, res, next) => {
    try {
        const doc_profile = await doctor.findOne({ user_id: req.user._id });
        if (!doc_profile) {
            return res.status(404).json({
                success: false,
                message: "doctor profile not found."
            });
        }
        const availability = await doctorAvailable.find({ doctor_id: doc_profile._id }).sort({ dayOfWeek: 1 });
        return res.status(200).json({
            success: true,
            count: availability.length,
            data: availability
        });


    } catch (error) {
        console.error("GET AVAILIBILITY ERROR", error);
        return res.status(500).json({
            success: false,
            message: "server error while fetching availibility."
        });
    }
}