import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import path from "path";
import { fileURLToPath } from 'url';
import { PatientHomeWay } from './routes/userHome.js';
import wrongWay from './routes/page 404.js';
import homeWay from './routes/home.js';
import cookieParser from 'cookie-parser';
import { patientregisterWay } from './routes/patientForm.js';
import { patientFormfile } from './routes/petientFormFile.js';
import { searchFileWay } from './routes/searchdoctorfile.js';
import { searchWay } from './routes/searchroute.js';
import { bookingWay } from './routes/patientbooking.js';
import { patientbookingWay } from './routes/patientbookingWay.js';
import { patientLoginFileWay } from './routes/patientloginFile.js';
import { patientLoginWay } from './routes/patientLoginAuth.js';
import { logoutWay } from './routes/logoutRoute.js';
import { patientDashboardWay } from './routes/patientbookingWay.js';
import { doctorDashboardWay } from './routes/doctorDashBoardRoute.js';
import { doctorloginfile } from './routes/doctorloginfile.js';
import { doctorloginsuccessful } from './routes/doctorLogin.js';
import { doctorRegisterfile } from './routes/doctorRegisterfile.js';
import { doctorform } from './routes/doctorRegisterForm.js';
import { airoutes } from './routes/genairoutes.js';

// Payment flow (already wired earlier)
import { appointmentPaymentWay } from './routes/appointmentPaymentRoute.js';
import { razorpayWebhook } from './controller/razorpayWebHook.js';

// 🆕 New: patient email/password auth + forgot-password
import { patientAuthWay } from './routes/login.js';       // POST /api/patient/login, /forgot-password, /reset-password
import { patientAuthPagesWay } from './routes/patientAuthPagesWay.js'; // GET page routes

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Webhook must be registered BEFORE express.json() — needs raw body
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json({ limit: "16kb" }));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(homeWay);

// Payment flow
app.use(appointmentPaymentWay);

// 🆕 Patient auth (login/forgot-password/reset-password API + pages)
app.use(patientAuthWay);
app.use(patientAuthPagesWay);

app.use(airoutes);
app.use(doctorloginfile);
app.use(doctorloginsuccessful);
app.use(doctorRegisterfile);
app.use(doctorform);
app.use(searchFileWay);
app.use(searchWay);
app.use(patientFormfile);
app.use(patientregisterWay);
app.use(PatientHomeWay);
app.use(logoutWay);
app.use(patientLoginFileWay);
app.use(patientLoginWay);
app.use(bookingWay);
app.use(doctorDashboardWay);
app.use(patientbookingWay);
app.use(patientDashboardWay);
app.use(wrongWay);

const p = process.env.port || 3000;
mongoose.connect(process.env.url).then(() => {
    console.log("mongoose connected succesfully");
    app.listen(process.env.port, () => {
        console.log(`http://localhost:${p}`);
    });
}).catch(err => {
    console.log("errr", err);
    process.exit(1);
});