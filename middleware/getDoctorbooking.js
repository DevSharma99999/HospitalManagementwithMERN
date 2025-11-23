// File: ../controller/doctorBookingController.js

import { appointment } from '../mongoose modules/appointmentModule.js'; // Assuming this holds your Appointment model
import { doctor } from '../mongoose modules/doctormodule.js'; // Needed if you want to use req.user._id check
import { patient } from '../mongoose modules/patientModule.js'; // Needed for population

const getUTCStartOfToday = () => {
    const now = new Date();
    // Creates a Date object representing 00:00:00 UTC for the current calendar day.
    return new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));
};


export const getDoctorBookings = async (req, res) => {
    console.log("i am at fetchinggg")// The doctor's user ID is stored here by the authentication middleware
    const doctorId = req.user._id;

    const doctorIdForQuery = doctorId ? doctorId.toString() : null; // Safe string casting

    console.log("SERVER LOG: Final Doctor ID for Query:", doctorIdForQuery);
    const startOfTodayFilter = getUTCStartOfToday();
    try {
        if (!doctorId) {
            return res.status(401).json({ success: false, message: "Authentication failure: Doctor ID missing." });
        }
        console.log("SERVER LOG: Filter Start:", startOfTodayFilter.toISOString());
        // Fetch all upcoming or current scheduled appointments for this specific doctor
        const bookings = await appointment.find({
            doctor_id: doctorIdForQuery,
            status: { $in: ["scheduled", "pending"] },
            appointment_date: { $gte: startOfTodayFilter }
        })
            .sort({ appointment_date: 1, timeSlot: 1 }) // Sort by date and time
            
            // CRITICAL: Populate the patient_id field to get the patient's details
            .populate('patient_id', 'firstName lastName phone_number').lean();

            bookings.forEach(booking => {
    // CRITICAL CHECK: Does the patient object exist, and is phone_number present?
    if (!booking.patient_id || !booking.patient_id.phone_number) {
        console.error("Patient details or phone number is missing for a booking!");
    }
});
console.log("buy");
        return res.status(200).json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error("Error fetching doctor bookings:", error);
        // Use 500 status for server errors
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving appointments."
        });
    }
};