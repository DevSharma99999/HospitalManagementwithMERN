import crypto from "crypto";
import { appointment } from "../mongoose modules/appointmentModule.js";
import { patient } from "../mongoose modules/patientModule.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { sendBookingConfirmationEmail } from "../utils/emailsSender.js";

export const verifyPayment = async (req, res) => {
    const { appointment_db_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!appointment_db_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing payment verification fields." });
    }

    // Verify signature: HMAC-SHA256 of "order_id|payment_id" using your key secret
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed. Signature mismatch." });
    }

    let bookingAppointment;
    try {
        bookingAppointment = await appointment.findById(appointment_db_id);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error while confirming booking." });
    }

    if (!bookingAppointment) {
        return res.status(404).json({
            success: false,
            message: "This booking hold has expired or was not found. Please book again."
        });
    }

    // Idempotency: if already confirmed (e.g. webhook beat us to it), just return success
    if (bookingAppointment.status === "scheduled") {
        return res.status(200).json({
            success: true,
            message: "Booking already confirmed.",
            appointment_id: bookingAppointment.appointment_id,
            redirectUrl: "/patient/appointments"
        });
    }

    bookingAppointment.status = "scheduled";
    bookingAppointment.paymentStatus = "paid";
    bookingAppointment.paymentId = razorpay_payment_id;
    bookingAppointment.amountPaid = null; // optionally set from order amount if you fetch it
    bookingAppointment.holdExpiresAt = null; // 🔑 unsets TTL — this doc is now permanent

    try {
        await bookingAppointment.save();
    } catch (error) {
        console.error("Error confirming booking after payment", error);
        return res.status(500).json({ success: false, message: "Payment verified but booking confirmation failed. Contact support." });
    }

    // Respond immediately, send email in background
    res.status(200).json({
        success: true,
        message: "Payment verified. Appointment confirmed.",
        appointment_id: bookingAppointment.appointment_id,
        redirectUrl: "/patient/appointments"
    });

    (async () => {
        try {
            const patientData = await patient.findById(bookingAppointment.patient_id);
            const doctorData = await doctor.findById(bookingAppointment.doctor_id).lean();
            if (!patientData || !doctorData) return;

            const emailResult = await sendBookingConfirmationEmail(
                patientData.email,
                bookingAppointment,
                `${patientData.firstName} ${patientData.lastName}`,
                `${doctorData.firstName} ${doctorData.lastName}`,
                doctorData.consultancyFee
            );
            if (!emailResult.success) console.warn("Booking confirmed, but email failed to send.");
        } catch (err) {
            console.error("Background email error after payment confirmation:", err);
        }
    })();
};