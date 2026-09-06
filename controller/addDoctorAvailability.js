import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js"
import { timeStrToMinutes } from "../utils/slotGenerator.js";

const isValidTimeFormat = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

const validateWindows = (windows, label) => {
    for (const w of windows) {
        if (![0,1,2,3,4,5,6].includes(w.day)) {
            return `Invalid day value in ${label}.`;
        }
        if (!isValidTimeFormat(w.startTime) || !isValidTimeFormat(w.endTime)) {
            return `Invalid time format in ${label}. Use HH:MM.`;
        }
        if (timeStrToMinutes(w.startTime) >= timeStrToMinutes(w.endTime)) {
            return `startTime must be before endTime in ${label}.`;
        }
    }
    return null;
};

// 🆕 Two windows overlap if one starts before the other ends, in both directions.
const windowsOverlap = (a, b) => {
    return timeStrToMinutes(a.startTime) < timeStrToMinutes(b.endTime) &&
           timeStrToMinutes(b.startTime) < timeStrToMinutes(a.endTime);
};

// 🆕 Groups windows by day and checks pairwise overlap within each day.
// Returns an error message string, or null if no conflicts.
const findOverlapError = (windows, label) => {
    const byDay = {};
    for (const w of windows) {
        if (!byDay[w.day]) byDay[w.day] = [];

        const conflict = byDay[w.day].find(existing => windowsOverlap(existing, w));
        if (conflict) {
            return `Overlapping ${label} on day ${w.day}: "${conflict.startTime}-${conflict.endTime}" conflicts with "${w.startTime}-${w.endTime}".`;
        }
        byDay[w.day].push(w);
    }
    return null;
};

export const setDoctorAvailability = async (req, res, next) => {
    const { workingHours, breaks = [], slotDurationMinutes, bufferMinutes } = req.body;

    if (!workingHours || !Array.isArray(workingHours) || workingHours.length === 0) {
        return res.status(400).json({ success: false, message: "workingHours is required." });
    }
    if (!slotDurationMinutes || slotDurationMinutes < 5) {
        return res.status(400).json({ success: false, message: "slotDurationMinutes must be at least 5." });
    }
    if (bufferMinutes === undefined || bufferMinutes < 0) {
        return res.status(400).json({ success: false, message: "bufferMinutes must be 0 or greater." });
    }

    const workingHoursError = validateWindows(workingHours, "workingHours");
    if (workingHoursError) {
        return res.status(400).json({ success: false, message: workingHoursError });
    }
    if (breaks.length > 0) {
        const breaksError = validateWindows(breaks, "breaks");
        if (breaksError) {
            return res.status(400).json({ success: false, message: breaksError });
        }
    }

    // 🆕 Reject overlapping working-hour windows on the same day
    const workingHoursOverlapError = findOverlapError(workingHours, "working-hour windows");
    if (workingHoursOverlapError) {
        return res.status(400).json({ success: false, message: workingHoursOverlapError });
    }

    // 🆕 Reject overlapping break windows on the same day too
    if (breaks.length > 0) {
        const breaksOverlapError = findOverlapError(breaks, "break windows");
        if (breaksOverlapError) {
            return res.status(400).json({ success: false, message: breaksOverlapError });
        }
    }

    try {
        const doc_profile = await doctor.findOne({ _id: req.user._id });
        if (!doc_profile) {
            return res.status(404).json({ success: false, message: "doctor profile not found." });
        }

        const existingSlot = await doctorAvailable.findOne({ doctor_id: doc_profile._id });

        if (existingSlot) {
            existingSlot.workingHours = workingHours;
            existingSlot.breaks = breaks;
            existingSlot.slotDurationMinutes = slotDurationMinutes;
            existingSlot.bufferMinutes = bufferMinutes;
            await existingSlot.save();
            return res.status(200).json({
                success: true,
                message: "Doctor availability updated successfully.",
                data: existingSlot,
                redirectUrl: "/doctor/schedule-summary"
            });
        } else {
            const newAvailability = await doctorAvailable.create({
                doctor_id: doc_profile._id,
                workingHours,
                breaks,
                slotDurationMinutes,
                bufferMinutes
            });
            return res.status(201).json({
                success: true,
                message: "Availability rules saved successfully.",
                data: newAvailability,
                redirectUrl: "/doctor/schedule-summary"
            });
        }
    } catch (error) {
        console.error("add availability error", error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Schedule already exists for this doctor. Use PUT to update." });
        }
        return res.status(500).json({ success: false, message: "server error while adding availability." });
    }
};