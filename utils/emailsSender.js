// File: utils/emailsSender.js

import { sendTransactionalEmail } from "./brevoMailer.js";

export const sendBookingConfirmationEmail = async (patientEmail, appointmentDetails, patientName, doctorName, consultancyFee) => {
    const apptDate = new Date(appointmentDetails.appointment_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const apptTime = appointmentDetails.timeSlot;
    const bookingId = appointmentDetails._id;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #10B981;">Hello ${patientName},</h2>
            <p>Your appointment has been successfully scheduled with your doctor!</p>
            <p>Here are your appointment details:</p>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Booking ID:</strong> ${bookingId}</li>
                <li style="margin-bottom: 10px;"><strong>Date:</strong> ${apptDate}</li>
                <li style="margin-bottom: 10px;"><strong>Time Slot:</strong> ${apptTime}</li>
                <li style="margin-bottom: 10px;"><strong>Doctor:</strong> ${doctorName}</li>
                <li style="margin-bottom: 10px;"><strong>Consultancy Fees:</strong> ₹${consultancyFee}</li>
            </ul>
            <p style="margin-top: 20px;">Please arrive 15 minutes early for your appointment.</p>
            <p>Thank you for choosing our service.</p>
        </div>
    `;

    return await sendTransactionalEmail({
        toEmail: patientEmail,
        toName: patientName,
        subject: "Appointment Confirmed! 🎉",
        htmlContent
    });
};

export const sendPasswordResetEmail = async (recipientEmail, recipientName, resetLink) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4f46e5;">Hello ${recipientName},</h2>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <p style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
    `;

    return await sendTransactionalEmail({
        toEmail: recipientEmail,
        toName: recipientName,
        subject: "Reset Your Password",
        htmlContent
    });
};