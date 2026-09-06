// File: controller/checkAvailability.js

import { appointment } from "../mongoose modules/appointmentModule.js";
import mongoose from "mongoose";
import { patient } from "../mongoose modules/patientModule.js";
import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { sendBookingConfirmationEmail } from "../utils/emailsSender.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { generateDaySlots } from "../utils/slotGenerator.js";
import { isWithinBuffer } from "../utils/slotTime.js";

export const checkAvailability = async (req, res, next) => {
    const patient_id = req.patient_id;
    console.log("Patient ID for booking:", patient_id);
    const { doctor_id, timeSlot, appointment_date } = req.body;

    if (!timeSlot || !patient_id || !appointment_date || !doctor_id) {
        return res.status(400).json({
            success: false,
            message: "MORE FIELDS ARE REQUIRED"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(doctor_id) || !mongoose.Types.ObjectId.isValid(patient_id)) {
        return res.status(400).json({ success: false, message: "Invalid Doctor or Patient ID format." });
    }

    const bookingDate = new Date(appointment_date);
    const dayOfWeek = bookingDate.getDay();
    const newAppointmentId = Math.floor(Math.random() * 1000000);
    const reason = req.body.reason || "No reason provided";

    const normalizeDate = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const normalizedBookingDate = normalizeDate(bookingDate);

    let FindDoctor;
    try {
        FindDoctor = await doctorAvailable.findOne({ doctor_id });
    } catch (error) {
        console.log("server error fetching doctor availability", error);
        return res.status(500).json({ success: false, message: "Server error while checking availability." });
    }

    if (!FindDoctor) {
        return res.status(400).json({
            success: false,
            message: "doctor's schedule not found"
        });
    }

    // Rule-based slot validation
    const windowsToday = FindDoctor.workingHours
        .filter(w => w.day === dayOfWeek)
        .map(w => ({ startTime: w.startTime, endTime: w.endTime }));

    if (windowsToday.length === 0) {
        return res.status(400).json({
            success: false,
            message: `Doctor is not working on ${bookingDate.toDateString()}.`
        });
    }

    const breaksToday = (FindDoctor.breaks || [])
        .filter(b => b.day === dayOfWeek)
        .map(b => ({ startTime: b.startTime, endTime: b.endTime }));

    const bufferMinutes = FindDoctor.bufferMinutes ?? 10;
    const validSlotsToday = generateDaySlots(
        windowsToday,
        FindDoctor.slotDurationMinutes ?? 20,
        bufferMinutes,
        breaksToday
    );

    if (!validSlotsToday.includes(timeSlot)) {
        return res.status(400).json({
            success: false,
            message: `The slot ${timeSlot} is not offered by this doctor.`
        });
    }

    const startOfDay = normalizedBookingDate;
    const endOfDay = new Date(normalizedBookingDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    let sameDayBookings;
    try {
        sameDayBookings = await appointment.find({
            doctor_id,
            appointment_date: { $gte: startOfDay, $lt: endOfDay },
            status: { $in: ["scheduled", "pending"] }
        });
    } catch (error) {
        console.log("server error fetching same-day bookings", error);
        return res.status(500).json({ success: false, message: "Server error while checking availability." });
    }

    const bufferConflict = sameDayBookings.some(existing =>
        isWithinBuffer(timeSlot, existing.timeSlot, bufferMinutes)
    );

    if (bufferConflict) {
        return res.status(409).json({
            success: false,
            message: `This slot is too close to another appointment. Please leave at least ${bufferMinutes} minutes.`
        });
    }

    const checkCoincide = sameDayBookings.find(b => b.timeSlot === timeSlot);
    if (checkCoincide) {
        return res.status(409).json({
            success: false,
            message: "doctor not available on this time"
        });
    }

    // --- Save the booking. This is the only part guarded to decide success/failure. ---
    const newAppointment = new appointment({
        timeSlot,
        appointment_date: normalizedBookingDate,
        patient_id,
        doctor_id,
        status: "scheduled",
        appointment_id: newAppointmentId,
        reason
    });

    let savedAppointment;
    try {
        savedAppointment = await newAppointment.save();
    } catch (error) {
        console.log("server error in booking save", error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A booking for this exact time and doctor already exists."
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error while saving the booking."
        });
    }

    // Booking is confirmed at this point — respond immediately.
    // Nothing after this should ever be able to turn a successful booking into a failure response.
    res.status(201).json({
        success: true,
        message: "appointment booked successfully",
        appointment_id: newAppointmentId,
        redirectUrl: "/patient/appointments"
    });

    // Fire-and-forget confirmation email. Failures here are logged only —
    // they must never affect the response already sent above.
    (async () => {
        try {
            const patientData = await patient.findById(patient_id);
            const doctorData = await doctor.findById(doctor_id).lean();

            if (!patientData) {
                console.warn(`Booking ${newAppointmentId} saved, but patient ${patient_id} lookup failed for email.`);
                return;
            }
            if (!doctorData) {
                console.warn(`Booking ${newAppointmentId} saved, but doctor ${doctor_id} lookup failed for email.`);
                return;
            }

            const patientEmail = patientData.email;
            const patientName = `${patientData.firstName} ${patientData.lastName}`;
            const doctorName = `${doctorData.firstName} ${doctorData.lastName}`;
            const consultancyFee = doctorData.consultancyFee;

            const emailResult = await sendBookingConfirmationEmail(
                patientEmail,
                savedAppointment,
                patientName,
                doctorName,
                consultancyFee
            );

            if (!emailResult.success) {
                console.warn(`Booking ${newAppointmentId} created, but confirmation email failed to send.`);
            }
        } catch (err) {
            console.error(`Background email error for booking ${newAppointmentId} (booking already succeeded):`, err);
        }
    })();
};
