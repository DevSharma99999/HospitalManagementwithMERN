import express from 'express';
import { appointment } from '../mongoose modules/appointmentModule.js';
import { doctor } from '../mongoose modules/doctormodule.js';


/**
 * Controller function to securely return the logged-in patient's name.
 * * This function is designed to be used in an Express route after the verifyJWT 
 * middleware has successfully authenticated the user and populated req.user.
 * * Example route setup: router.get('/api/patient/me/name', verifyJWT, getPatientName);
 */
// This is the correct version that matches your middleware:

 const getPatientName = async (req, res) => {
    console.log("getinng lkrnme ")
    // Check for the full patient object that your middleware sets
    if ( !req.patient || !req.patient.firstName) { 
        console.error("Attempted to fetch patient name, but req.patient was incomplete or missing.");
        return res.status(404).json({ 
            success: false, 
            message: "User authentication successful but name data not found on req.patient.",
        });
    }

    // Access the data exactly where the middleware put it
    const Name = req.patient.firstName;

    return res.json({
        success: true,
        Name: Name // This will send the patient's first name
    });
};



import path from 'path';
import { fileURLToPath } from 'url';
import { verifyJWT } from '../middleware/jwtAuthentication.js';
import { patientProfileAuth } from '../middleware/patientProfileAuth.js';
import { getWeeklySchedule } from '../controller/scheduleController.js';
export const patientbookingWay = express.Router(); // Assuming your patient router is called this
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const patientDashboardWay = express.Router();
const APPOINTMENT_SUMMARY_PATH = path.join(__dirname, '..', 'public', 'html', 'patient_appointments_summary.html');
const PATIENT_ACTIVITY_PATH = path.join(__dirname, '..', 'public', 'html', 'patient_activity.html');
const BOOKING_PAGE_PATH = path.join(__dirname, '..', 'public', 'html', 'doctor_schedule_view.html'); // 🚨 Create this HTML file!
patientbookingWay.get('/api/patient/schedule/weekly/:doctorId', getWeeklySchedule);

// 🎯 NEW ROUTE: Captures the doctor's ID and serves the schedule view page.
patientbookingWay.get('/patient/book-appointment/:doctorId', (req, res) => {
    // 1. The doctorId is now available via req.params.doctorId
    const doctorId = req.params.doctorId;

    // 2. We can pass the doctorId to the client either via a cookie/session (if rendering server-side)
    //    OR, more commonly, the client-side script will read it from the URL.

    // 3. Serve the new HTML page
    res.sendFile(BOOKING_PAGE_PATH, (err) => {
        if (err) {
            console.error('Error serving schedule view page:', err);
            res.status(500).send('Could not load the schedule page.');
        }
    });
});
patientDashboardWay.get('/patient/appointments', verifyJWT, patientProfileAuth, (req, res) => {
    res.sendFile(APPOINTMENT_SUMMARY_PATH, (err) => {
        if (err) {
            console.error('Error serving appointment summary page:', err);
            res.status(500).send('Could not load the appointments page.');
        }
    });
});
patientDashboardWay.get('/api/patient/my-appointments', verifyJWT, patientProfileAuth, async (req, res) => {
    try {
        // Patient ID is available on req.patient_id from patientProfileAuth middleware
        const patientId = req.patient_id;

        const now = new Date();
        const startOfTodayUTC = new Date(Date.UTC(
            now.getUTCFullYear(), 
            now.getUTCMonth(), 
            now.getUTCDate()
        ));

        const appointments = await appointment.find({
            patient_id: patientId,
            appointment_date: { $gte: startOfTodayUTC } // Only future appointments
        })
            .populate('doctor_id', 'firstName lastName ') // Fetch doctor name
            .sort({ appointment_date: 1, timeSlot: 1 });
console.log("appointments",appointments );
        return res.status(200).json({
            success: true,
            data: appointments
        });

    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        return res.status(500).json({ success: false, message: "Server error fetching appointments." });
    }
});
// In your patient router file (e.g., patientRoutes.js)

// ... (imports and patientAuthChain middleware setup)


// 🎯 NEW ROUTE: Patient Activity Hub
patientDashboardWay.get('/patient/activity', verifyJWT,patientProfileAuth, (req, res) => {
    // The patientAuthChain middleware runs first to ensure the user is logged in.
    res.sendFile(PATIENT_ACTIVITY_PATH, (err) => {
        if (err) {
            console.error('Error serving patient activity page:', err);
            res.status(500).send('Could not load the patient dashboard.');
        }
    });
});

// ... (other patient routes)


patientDashboardWay.get('/patient/doctor-details/:doctorId',  verifyJWT,patientProfileAuth, (req, res) => {
    const htmlPath = path.join(__dirname, '..', 'public', 'html', 'patientuidoctordetails.html');
    res.sendFile(htmlPath);
});

import { doctordetails } from '../controller/doctorappointmentdetails.js';
patientDashboardWay.get('/api/patient/doctor-details/:doctorId', verifyJWT,patientProfileAuth, doctordetails);


patientDashboardWay.get('/api/patient/me/name', verifyJWT,patientProfileAuth, getPatientName);