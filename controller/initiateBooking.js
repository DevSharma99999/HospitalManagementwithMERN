import { appointment } from "../mongoose modules/appointmentModule.js";
import mongoose from "mongoose";
import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { generateDaySlots } from "../utils/slotGenerator.js";
import { isWithinBuffer } from "../utils/slotTime.js";
import { razorpayInstance } from "../utils/razorpay.js";

const HOLD_DURATION_MINUTES = 10;

export const initiateBooking = async (req, res) => {
    const patient_id = req.patient_id;
    const { doctor_id, timeSlot, appointment_date, reason } = req.body;

    if (!timeSlot || !patient_id || !appointment_date || !doctor_id) {
        return res.status(400).json({ success: false, message: "MORE FIELDS ARE REQUIRED" });
    }
    if (!mongoose.Types.ObjectId.isValid(doctor_id) || !mongoose.Types.ObjectId.isValid(patient_id)) {
        return res.status(400).json({ success: false, message: "Invalid Doctor or Patient ID format." });
    }

    const bookingDate = new Date(appointment_date);
    const dayOfWeek = bookingDate.getDay();
    const newAppointmentId = Math.floor(Math.random() * 1000000);
    const bookingReason = reason || "No reason provided";

    const normalizeDate = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const normalizedBookingDate = normalizeDate(bookingDate);

    // --- Same validation as before ---
    let FindDoctor;
    try {
        FindDoctor = await doctorAvailable.findOne({ doctor_id });
    } catch (error) {
        console.log("server error fetching doctor availability", error);
        return res.status(500).json({ success: false, message: "Server error while checking availability." });
    }
    if (!FindDoctor) {
        return res.status(400).json({ success: false, message: "doctor's schedule not found" });
    }

    const windowsToday = FindDoctor.workingHours
        .filter(w => w.day === dayOfWeek)
        .map(w => ({ startTime: w.startTime, endTime: w.endTime }));

    if (windowsToday.length === 0) {
        return res.status(400).json({ success: false, message: `Doctor is not working on ${bookingDate.toDateString()}.` });
    }

    const breaksToday = (FindDoctor.breaks || [])
        .filter(b => b.day === dayOfWeek)
        .map(b => ({ startTime: b.startTime, endTime: b.endTime }));

    const bufferMinutes = FindDoctor.bufferMinutes ?? 10;
    const validSlotsToday = generateDaySlots(
        windowsToday, FindDoctor.slotDurationMinutes ?? 20, bufferMinutes, breaksToday
    );

    if (!validSlotsToday.includes(timeSlot)) {
        return res.status(400).json({ success: false, message: `The slot ${timeSlot} is not offered by this doctor.` });
    }

    const startOfDay = normalizedBookingDate;
    const endOfDay = new Date(normalizedBookingDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    let sameDayBookings;
    try {
        // 🔧 status filter now includes pending_payment — a held slot blocks others too
        sameDayBookings = await appointment.find({
            doctor_id,
            appointment_date: { $gte: startOfDay, $lt: endOfDay },
            status: { $in: ["scheduled", "pending_payment"] }
        });
    } catch (error) {
        console.log("server error fetching same-day bookings", error);
        return res.status(500).json({ success: false, message: "Server error while checking availability." });
    }

    const bufferConflict = sameDayBookings.some(existing => isWithinBuffer(timeSlot, existing.timeSlot, bufferMinutes));
    if (bufferConflict) {
        return res.status(409).json({
            success: false,
            message: `This slot is too close to another appointment. Please leave at least ${bufferMinutes} minutes.`
        });
    }

    const checkCoincide = sameDayBookings.find(b => b.timeSlot === timeSlot);
    if (checkCoincide) {
        return res.status(409).json({ success: false, message: "This slot is currently held or booked by another patient." });
    }

    // --- Fetch consultancy fee for the payment amount ---
    let doctorData;
    try {
        doctorData = await doctor.findById(doctor_id).lean();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error while fetching doctor details." });
    }
    if (!doctorData) {
        return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    const amountInPaise = Math.round(doctorData.consultancyFee * 100); // Razorpay expects paise

    // --- Create the hold (this IS the lock — unique index enforces it) ---
    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

    const newAppointment = new appointment({
        timeSlot,
        appointment_date: normalizedBookingDate,
        patient_id,
        doctor_id,
        status: "pending_payment",
        appointment_id: newAppointmentId,
        reason: bookingReason,
        holdExpiresAt,
        paymentStatus: "not_initiated"
    });

    let savedAppointment;
    try {
        savedAppointment = await newAppointment.save();
    } catch (error) {
        console.log("server error creating hold", error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This slot was just taken by another patient. Please pick a different slot."
            });
        }
        return res.status(500).json({ success: false, message: "Server error while holding the slot." });
    }

    // --- Create the Razorpay order ---
    let order;
    try {
        order = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `appt_${savedAppointment._id}`,
            notes: {
                appointment_db_id: savedAppointment._id.toString(),
                doctor_id: doctor_id.toString(),
                patient_id: patient_id.toString()
            }
        });
    } catch (error) {
        console.error("Razorpay order creation failed", error);
        // Release the hold immediately since payment can't proceed
        await appointment.findByIdAndDelete(savedAppointment._id).catch(() => {});
        return res.status(502).json({ success: false, message: "Could not initiate payment. Please try again." });
    }

    savedAppointment.paymentOrderId = order.id;
    savedAppointment.paymentStatus = "created";
    await savedAppointment.save();

    return res.status(201).json({
        success: true,
        message: "Slot held. Proceed to payment.",
        appointment_db_id: savedAppointment._id,
        appointment_id: newAppointmentId,
        holdExpiresAt,
        razorpayOrder: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }
    });
};