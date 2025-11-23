import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setDoctorAvailability } from '../controller/addDoctorAvailability.js'; // The corrected middleware
import { doctorverifyJWT, restrictTODoctor } from '../middleware/doctorverifyjwt.js';
import { getDoctorBookings } from '../middleware/getDoctorbooking.js';
import { getAppointmentDetails } from '../controller/patientappointmentDetails.js';
import { getDoctorProfile } from '../controller/doctorProfileController.js';
import { updateDoctorProfile } from '../controller/updateDoctorProfile.js';
import { getMyAvailability } from '../controller/getDoctorAvailability.js';
export const doctorDashboardWay = express.Router();
export const doneDashboardWay = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware chain to ensure the user is logged in AND is a Doctor
const doctorAuthChain = [doctorverifyJWT, restrictTODoctor];

// 1. GET: Serves the Doctor Dashboard HTML page
doctorDashboardWay.get('/doctor/dashboard', ...doctorAuthChain, (req, res) => {
    // Assuming doctor_dashboard.html is in public/html/
    const htmlPath = path.join(__dirname, '..', 'public', 'html', 'doctordashboard.html');
    res.sendFile(htmlPath);
});
// In doctorDashboardWay.js (or wherever your doctor routes are defined)

// Assuming doctorAuthChain = [doctorverifyJWT, restrictTODoctor] is already defined

// 🎯 Route to fetch the doctor's appointments
doctorDashboardWay.get('/api/doctor/bookings', ...doctorAuthChain, getDoctorBookings);
// 2. POST: Handles setting/updating the doctor's weekly schedule
doctorDashboardWay.post('/api/doctor/availability', ...doctorAuthChain, setDoctorAvailability);

doctorDashboardWay.get('/doctor/schedule-summary', ...doctorAuthChain, (req, res) => {
    const htmlPath = path.join(__dirname, '..', 'public', 'html', 'doctor_booking_summary.html');
    res.sendFile(htmlPath);
});
// 3. GET: Fetches the current schedule data for display on the dashboard
doctorDashboardWay.get('/api/doctor/availability', ...doctorAuthChain, getMyAvailability);


doctorDashboardWay.get('/doctor/patient-details/:bookingId', ...doctorAuthChain, (req, res) => {
    // You will need to create this HTML file
    const htmlPath = path.join(__dirname, '..', 'public', 'html', 'doctor_patient_detail.html');
    res.sendFile(htmlPath);
});
// doctorDashboardWay.get('/api/doctor/bookings', doctorAuthChain, getDoctorBookings);
doctorDashboardWay.get('/api/doctor/patient-details/:bookingId', ...doctorAuthChain, getAppointmentDetails);

doctorDashboardWay.get("/doctor",doctorverifyJWT,(req,res)=>{
res.sendFile(path.join(__dirname, '..', 'public', 'html', 'doctor_dashboard.html'));
})

