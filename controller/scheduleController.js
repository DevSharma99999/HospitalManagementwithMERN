import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { appointment } from "../mongoose modules/appointmentModule.js";
import { generateDaySlots } from "../utils/slotGenerator.js";
import { isWithinBuffer } from "../utils/slotTime.js";
import mongoose from "mongoose";

const toYYYYMMDD = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const transformToWeeklyGrid = (availability, bookings) => {
    if (!availability || !availability.workingHours || availability.workingHours.length === 0) {
        return [];
    }

    const slotDuration = availability.slotDurationMinutes || 20;
    const bufferMinutes = availability.bufferMinutes || 10;

    const windowsByDay = new Map();
    availability.workingHours.forEach(w => {
        if (!windowsByDay.has(w.day)) windowsByDay.set(w.day, []);
        windowsByDay.get(w.day).push({ startTime: w.startTime, endTime: w.endTime });
    });

    const breaksByDay = new Map();
    (availability.breaks || []).forEach(b => {
        if (!breaksByDay.has(b.day)) breaksByDay.set(b.day, []);
        breaksByDay.get(b.day).push({ startTime: b.startTime, endTime: b.endTime });
    });

    const bookingsByDate = new Map();
    bookings.forEach(b => {
        const dateString = toYYYYMMDD(b.appointment_date);
        if (!bookingsByDate.has(dateString)) bookingsByDate.set(dateString, []);
        bookingsByDate.get(dateString).push(b.timeSlot);
    });

    const weeklySchedule = [];
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setUTCDate(today.getUTCDate() + i);
        const currentDayNumber = currentDate.getDay();
        const dateString = toYYYYMMDD(currentDate);
        const bookedSlotsToday = bookingsByDate.get(dateString) || [];

        // Real bookings always show, regardless of current rules
        bookedSlotsToday.forEach(slot => {
            weeklySchedule.push({ date: dateString, dayOfWeek: currentDayNumber, timeSlot: slot, status: 'booked' });
        });

        // Generate today's candidate slots from the doctor's current rules
        const windows = windowsByDay.get(currentDayNumber);
        if (windows && windows.length) {
            const breaksToday = breaksByDay.get(currentDayNumber) || [];
            const generatedSlots = generateDaySlots(windows, slotDuration, bufferMinutes, breaksToday);

            generatedSlots.forEach(slot => {
                if (bookedSlotsToday.includes(slot)) return; // already rendered as 'booked'

                const blockedByBuffer = bookedSlotsToday.some(bookedSlot =>
                    isWithinBuffer(slot, bookedSlot, bufferMinutes)
                );

                weeklySchedule.push({
                    date: dateString,
                    dayOfWeek: currentDayNumber,
                    timeSlot: slot,
                    status: blockedByBuffer ? 'buffer-blocked' : 'available'
                });
            });
        }
    }
    return weeklySchedule;
};

export const getWeeklySchedule = async (req, res) => {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, message: "Invalid Doctor ID format." });
    }
    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    try {
        const doctorProfile = await doctor.findById(doctorId, 'firstName lastName');
        if (!doctorProfile) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        const availability = await doctorAvailable.findOne({ doctor_id: doctorId });
        const bookings = await appointment.find({
            doctor_id: doctorId,
            status: { $in: ["scheduled", "pending"] },
            appointment_date: { $gte: startOfTodayUTC }
        });

        const weeklyScheduleData = transformToWeeklyGrid(availability, bookings);

        return res.status(200).json({
            success: true,
            message: "Weekly schedule loaded.",
            data: {
                doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
                schedule: weeklyScheduleData
            }
        });
    } catch (error) {
        console.error("Error fetching weekly schedule:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching schedule data." });
    }
};