// ... existing imports ...
import { appointment } from '../mongoose modules/appointmentModule.js';
import { patient } from '../mongoose modules/patientModule.js'; 

export const getAppointmentDetails = async (req, res) => {
    // 1. Get the booking ID from the URL parameter
    const bookingId = req.params.bookingId; 
    const doctorId = req.user._id.toString();

    try {
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Missing appointment ID." });
        }

        // 2. Fetch the specific appointment and populate patient details
        // Ensure the appointment belongs to the authenticated doctor for security
      // In your getAppointmentDetails controller (../controller/patientappointmentDetails.js)
    const appointmentDetails = await appointment.findOne({
        _id: bookingId,
        doctor_id: doctorId
    })
    .populate('patient_id', 'firstName lastName dob gender phone_number address') // Corrected fields
    .lean();
        if (!appointmentDetails) {
            return res.status(404).json({ success: false, message: "Appointment not found or does not belong to this doctor." });
        }

        // 3. Success: Send the data
        return res.status(200).json({
            success: true,
            data: appointmentDetails
        });

    } catch (error) {
        console.error("Error fetching appointment details:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving appointment details."
        });
    }
};