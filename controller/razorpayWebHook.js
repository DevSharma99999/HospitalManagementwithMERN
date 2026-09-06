import crypto from "crypto";
import { appointment } from "../mongoose modules/appointmentModule.js";
import { patient } from "../mongoose modules/patientModule.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { sendBookingConfirmationEmail } from "../utils/emailsSender.js";

// NOTE: this route MUST receive the raw request body (not JSON-parsed)
// for signature verification to work. See routing note below.
export const razorpayWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.body) // raw buffer
        .digest("hex");

    if (signature !== expectedSignature) {
        console.warn("Invalid Razorpay webhook signature.");
        return res.status(400).json({ success: false });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    // Always ack quickly so Razorpay doesn't retry unnecessarily
    res.status(200).json({ received: true });

    if (event !== "payment.captured") return; // ignore other events for now

    try {
        const orderId = payload.payload.payment.entity.order_id;
        const paymentId = payload.payload.payment.entity.id;

        const bookingAppointment = await appointment.findOne({ paymentOrderId: orderId });
        if (!bookingAppointment) {
            console.warn(`Webhook: no appointment found for order ${orderId}`);
            return;
        }
        if (bookingAppointment.status === "scheduled") return; // already confirmed via /verify-payment

        bookingAppointment.status = "scheduled";
        bookingAppointment.paymentStatus = "paid";
        bookingAppointment.paymentId = paymentId;
        bookingAppointment.holdExpiresAt = null;
        await bookingAppointment.save();

        const patientData = await patient.findById(bookingAppointment.patient_id);
        const doctorData = await doctor.findById(bookingAppointment.doctor_id).lean();
        if (patientData && doctorData) {
            await sendBookingConfirmationEmail(
                patientData.email,
                bookingAppointment,
                `${patientData.firstName} ${patientData.lastName}`,
                `${doctorData.firstName} ${doctorData.lastName}`,
                doctorData.consultancyFee
            ).catch(err => console.error("Webhook email error:", err));
        }
    } catch (error) {
        console.error("Error processing Razorpay webhook:", error);
    }
};