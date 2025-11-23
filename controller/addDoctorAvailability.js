import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js"

export const setDoctorAvailability = async (req, res, next) => {
    const { workingDays, availableTime } = req.body;

    if (!workingDays || !availableTime) {
        return res.status(400).json({
            success: false,
            message: "day of week,starttime and end time all are required."
        });
    }

    try {
        const doc_profile = await doctor.findOne({ _id: req.user._id });
        if (!doc_profile) {
            return res.status(404).json({
                success: false,
                message: "doctor profile not found."
            });
        }
        // const doctor_id = doc_profile._id;
        const existingSlot = await doctorAvailable.findOne({
            doctor_id: doc_profile._id,
        });
        if (existingSlot) {
             existingSlot.workingDays = workingDays;
            existingSlot.availableTime = availableTime;
            await existingSlot.save();
            console.log("done booking");
            return res.status(200).json({ 
                success: true,
                message: "Doctor availability updated successfully.",
                data: existingSlot,
                redirectUrl: "/doctor/schedule-summary"
            });
        }
        else{
        const newslot = await doctorAvailable.create({
            doctor_id: doc_profile._id,
             workingDays,
            availableTime,
        });
        return res.status(201).json({
            success: true,
            message: "booking of slot done successfully.",
            data: newslot,
            redirectUrl: "/doctor/schedule-summary"
        });
    }

    } catch (error) {
        console.error("add availability error", error);
        if (error.code === 11000) {
             return res.status(409).json({
                success: false,
                message: "Schedule already exists for this doctor. Use PUT to update."
            });
        }
        return res.status(500).json({
            success: false,
            message: "server error while adding availability."
        });
    }
};


