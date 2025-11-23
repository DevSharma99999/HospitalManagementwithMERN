import { appointment } from "../mongoose modules/appointmentModule.js";
import mongoose from "mongoose";
import { patient } from "../mongoose modules/patientModule.js";
import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { sendBookingConfirmationEmail } from "../utils/emailsSender.js";
import{ doctor} from "../mongoose modules/doctormodule.js";

export const checkAvailability = async (req, res, next) => {
    const patient_id = req.patient_id;
    console.log("Patient ID for booking:", patient_id);
    const { doctor_id, timeSlot, appointment_date } = req.body;
    if (!timeSlot || !patient_id || !appointment_date || !doctor_id) {
        return res.status(400).json({
            success: false,
            message: "ALL FIELD ARE REQUIRED"
        });
    }
    // Validate IDs and Date format before querying
    if (!mongoose.Types.ObjectId.isValid(doctor_id) || !mongoose.Types.ObjectId.isValid(patient_id)) {
        return res.status(400).json({ success: false, message: "Invalid Doctor or Patient ID format." });
    }
    const bookingDate = new Date(appointment_date);
    const dayOfWeek = bookingDate.getDay();
    const newAppointmentId = Math.floor(Math.random() * 1000000);

    const normalizeDate = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const normalizedBookingDate = normalizeDate(bookingDate);
    try {
        const FindDoctor = await doctorAvailable.findOne({ doctor_id });
        if (!FindDoctor) {
            return res.status(400).json({
                success: false,
                message: "doctor's schedule not found"
            });
        }
        const isWorkingDay = FindDoctor.workingDays.includes(dayOfWeek);
        const isSlotOffered = FindDoctor.availableTime.includes(timeSlot);
        if (!isWorkingDay) {
            return res.status(400).json({
                success: false,
                message: `Doctor is not working on ${bookingDate.toDateString()}.`
            });
        }
        if (!isSlotOffered) {
            return res.status(400).json({
                success: false,
                message: `Doctor does not offer the slot ${timeSlot}.`
            });
        }
        const startOfDay = normalizedBookingDate;
        const endOfDay = new Date(normalizedBookingDate);
        // Sets the time to 23:59:59.999 of the booking date
        endOfDay.setDate(endOfDay.getDate() + 1);
        const checkCoincide = await appointment.findOne({
            doctor_id,
            timeSlot: timeSlot,
            appointment_date: {
                $gte: startOfDay, // Greater than or equal to 00:00:00 of the target day
                $lt: endOfDay     // Less than the 00:00:00 of the next day
            },
            status: { $in: ["scheduled", "pending"] }
        });
        if (checkCoincide) {
            return res.status(409).json({
                success: false,
                message: "doctor not available on this time"
            });
        }

        const newAppointment = new appointment({
            timeSlot: timeSlot,
            appointment_date: normalizedBookingDate,
            patient_id: patient_id,
            doctor_id,
            status: "scheduled",
            appointment_id: newAppointmentId
        });
        const savedAppointment = await newAppointment.save();

        const patientData = await patient.findById(patient_id);
            // .populate( 'email') // Assuming email is on the linked 'user' model
            // .lean();

        const patientEmail = patientData.email; // Safely access email
        const patientName = `${patientData.firstName} ${patientData.lastName}`;
        // -------------------------
        console.log("patientEmail",patientEmail);
        const doctorData=await doctor.findById(doctor_id)
        .populate('doctor_id','medical_licence_number').lean();
        const consultancyFee=doctorData.consultancyFee;
        const doctorName= `${doctorData.firstName} ${doctorData.lastName}`;

        // 3. Send the Confirmation Email (ASYNCHRONOUSLY)
        // We use await here to ensure the logic starts, but don't hold up the HTTP response.
        // You might want to run this in the background without awaiting if performance is critical.
        const emailResult = await sendBookingConfirmationEmail(
            patientEmail,
            savedAppointment,
            patientName,
            doctorName,
            consultancyFee
        );

        if (!emailResult.success) {
            console.warn("Booking created, but email failed to send.");
        }
        return res.status(201).json({
            success: true,
            message: "appointment booked successfully",
            appointment_id: newAppointmentId,
            redirectUrl: "/patient/appointments"
        });
    }
    catch (error) {
        console.log("server error in booking", error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A booking for this exact time and doctor already exists."
            });
        }
        return res.status(400).json({
            success: false,
            message: "server error in catch now"
        });
    }

}