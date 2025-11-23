import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // Assuming you use dotenv for environment variables

dotenv.config();

// 1. Configure the Transporter (Using a service like Gmail or SendGrid/Mailgun SMTP)
const transporter = nodemailer.createTransport({
    // Example using Gmail (You need to set up an App Password for security)
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,    // Your email address (e.g., 'mybookingapp@gmail.com')
        pass: process.env.EMAIL_PASS     // The generated App Password or service password
    },
    // If using a custom SMTP server, provide host, port, and security settings.
});

// 2. Email Sending Function
export const sendBookingConfirmationEmail = async (patientEmail, appointmentDetails, patientName, doctorName, consultancyFee) => {

    // Format the date for the email
    const apptDate = new Date(appointmentDetails.appointment_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const apptTime = appointmentDetails.timeSlot;
    const bookingId = appointmentDetails._id;
    console.log("hi in the email");
    // 3. Define the email content
    const mailOptions = {
        from: `Your Clinic <${process.env.EMAIL_USER}>`,
        to: patientEmail,
        subject: 'Appointment Confirmed! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #10B981;">Hello ${patientName},</h2>
                <p>Your appointment has been successfully scheduled with your doctor!</p>
                <p>Here are your appointment details:</p>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px;"><strong>Booking ID:</strong> ${bookingId}</li>
                    <li style="margin-bottom: 10px;"><strong>Date:</strong> ${apptDate}</li>
                    <li style="margin-bottom: 10px;"><strong>Time Slot:</strong> ${apptTime}</li>
                    <li style="margin-bottom: 10px;"><strong>Doctor:</strong> ${doctorName}</li>
                    <li style="margin-bottom: 10px;"><strong>consultancy Fees:</strong> ${consultancyFee}</li>
                </ul>
                <p style="margin-top: 20px;">Please arrive 15 minutes early for your appointment.</p>
                <p>Thank you for choosing our service.</p>
            </div>
        `,
        // Note: You should also include a 'text' version for accessibility and fallback
    };

    // 4. Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${patientEmail}`);
        return { success: true };
    } catch (error) {
        console.error(`Error sending email to ${patientEmail}:`, error);
        // It's usually okay to proceed with the booking success even if the email fails
        return { success: false, error: error.message };
    }
};